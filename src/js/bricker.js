"use strict";
/* jshint globalstrict: true */
/* exported Bricker */

/* global $: false */
/* global DitherJS: false */
/* global Globals: false */


function Bricker(original_image, palette, num_vertical_blocks, stack_mode, size_callback) {
  var self = this;
  var kOrigImage = $(original_image);
  var kScratchCanvas = $('#bricker-scratch-canvas');
  var kScratchImg = $('#bricker-scratch-img');
  var kStackMode = stack_mode;
  var kTmpPrefix = 'tmp-image-';
  var kCallback = size_callback;

  self.numVerticalBlocks = num_vertical_blocks;
  self.palette = palette;
  self.cachedResults = {};

  var _returnSize = function(canvas) {
    kCallback({
      width: canvas.width / Globals.blockSize,
      height: canvas.height / Globals.blockSize
    });
  };

  var _cropImage = function() {
    var src_width = kOrigImage[0].naturalWidth;
    var src_height = kOrigImage[0].naturalHeight;

    var new_height = self.numVerticalBlocks * Globals.blockSize;
    var compression = kStackMode ? 1/Globals.blockAspectRatio : 1;
    var new_width = Math.floor((src_width / (src_height * compression)) * (self.numVerticalBlocks)) * Globals.blockSize;

    var canvas = kScratchCanvas[0];
    var context = canvas.getContext('2d');
    canvas.width = new_width;
    canvas.height = new_height;
    _returnSize(canvas);

    // Force fill background white to support images with transparency
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, new_width, new_height);

    // Seems to work better with some arbitrary offsets... Not sure if it's problem with DitherJS
    var offset = 4;
    context.drawImage(kOrigImage[0], offset, offset, src_width, src_height, 0, 0, new_width, new_height);

    // Not sure if there's a race condition here
    kScratchImg[0].src = canvas.toDataURL('image/png');
  };

  var _cloneImage = function() {
    var display_box = $('<div></div>');
    display_box.appendTo(kOrigImage.parent());

    display_box.addClass(_getSizeKey());
    display_box.addClass(Globals.displayBoxClass);

    _cropImage();

    var tmp = kScratchImg.clone();
    tmp.removeAttr('id');
    tmp.addClass(Globals.displayBoxImageClass);

    // Background comparison image
    tmp.clone().appendTo(display_box);

    tmp.addClass(kTmpPrefix + _getSizeKey());
    tmp.appendTo(display_box);

    return display_box;
  };

  var _resetZoom = function(display_box) {
    var canvas = $('canvas', display_box);
    var img = $('img', display_box);

    if (kStackMode) {
      var width = canvas.width();
      canvas.width(width);
      canvas.height(canvas.height() * Globals.blockAspectRatio);
      img.width(width);
      img.height(img.height() * Globals.blockAspectRatio);
    }

    if (canvas.width() <= kOrigImage.width()) {
      return;
    }

    var new_width = kOrigImage.width();
    var new_height = canvas.height() / canvas.width() * new_width;
    canvas.width(new_width);
    canvas.height(new_height);
    img.width(new_width);
    img.height(new_height);
  };

  var _getSizeKey = function() {
    return "bricker-size-" + self.numVerticalBlocks;
  };

  self.ditherImage = function() {
    setTimeout(function() {
      var display_box = _cloneImage();
      self.cachedResults[_getSizeKey()] = display_box;

      var options = {
          'step': Globals.blockSize,
          'className': kTmpPrefix + _getSizeKey(),
          'palette': self.palette,
          'algorithm': 'ordered'
      };

      display_box.css("visibility", "hidden");
      new DitherJS('.' + kTmpPrefix + _getSizeKey(), options, function() {
        display_box.css("visibility", "visible");
        _resetZoom(display_box);
      });
    }, 1);
  };

  self.changeSize = function(num_vertical_blocks) {
    var box = self.cachedResults[_getSizeKey()];
    if (box) {
      box.hide();
    }
    self.numVerticalBlocks = num_vertical_blocks;

    if (_getSizeKey() in self.cachedResults) {
      box = self.cachedResults[_getSizeKey()];
      box.show();
      _returnSize($('canvas', box)[0]);
      return true;
    } else {
      self.ditherImage();
      return false;
    }
  };

  self.destroy = function() {
    $(Globals.displayBoxSelector).remove();
  };
}