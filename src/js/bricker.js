"use strict";
/* jshint globalstrict: true */
/* exported Bricker */

/* global $: false */
/* global DitherJS: false */
/* global Globals: false */


function Bricker(original_image, palette, num_vertical_blocks, stack_mode) {
  var self = this;
  var kOrigImage = $(original_image);
  var kBlockSize = Globals.blockSize;
  var kStretch = 9.6 / 7.8;
  var kScratchCanvas = $('#bricker-scratch-canvas');
  var kScratchImg = $('#bricker-scratch-img');
  var kStackMode = stack_mode;

  self.numVerticalBlocks = num_vertical_blocks;
  self.palette = palette;
  self.cachedResults = {};

  var _cropImage = function() {
    var src_width = kOrigImage[0].naturalWidth;
    var src_height = kOrigImage[0].naturalHeight;

    var new_height = self.numVerticalBlocks * kBlockSize;
    var compression = kStackMode ? 1/kStretch : 1;
    var new_width = Math.floor((src_width / (src_height * compression)) * (self.numVerticalBlocks)) * kBlockSize;

    var canvas = kScratchCanvas[0];

    canvas.width = new_width;
    canvas.height = new_height;

    canvas.getContext("2d").drawImage(kOrigImage[0], 0, 0, src_width, src_height, 0, 0, new_width, new_height);

    // Not sure if there's a race condition here
    kScratchImg[0].src = canvas.toDataURL('image/png');
  };

  var _cloneImage = function() {
    var display_box = $('<div></div>');
    display_box.appendTo(kOrigImage.parent());

    display_box.addClass(self.getSizeKey());
    display_box.addClass('bricker-display-box');

    _cropImage();

    var tmp = kScratchImg.clone();
    tmp.removeAttr('id');
    tmp.addClass('bricker-display-box-image');

    // Background comparison image
    tmp.clone().appendTo(display_box);

    tmp.addClass('tmp-image-' + self.getSizeKey());
    tmp.appendTo(display_box);

    return display_box;
  };

  var _resetZoom = function(display_box) {
    var canvas = $('canvas', display_box);
    var img = $('img', display_box);

    if (kStackMode) {
      var width = canvas.width();
      canvas.width(width);
      canvas.height(canvas.height() * kStretch);
      img.width(width);
      img.height(img.height() * kStretch);
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

  self.ditherImage = function() {
    setTimeout(function() {
      var display_box = _cloneImage();
      self.cachedResults[self.getSizeKey()] = display_box;

      var options = {
          'step': kBlockSize,
          'className': 'tmp-image-' + self.getSizeKey(),
          'palette': self.palette,
          'algorithm': 'ordered'
      };

      display_box.css("visibility", "hidden");
      new DitherJS('.tmp-image-' + self.getSizeKey(), options, function() {
        display_box.css("visibility", "visible");
        _resetZoom(display_box);
      });
    }, 0);
  };

  self.getSizeKey = function() {
    return "bricker-size-" + self.numVerticalBlocks;
  };

  self.changeSize = function(num_vertical_blocks) {
    var current = self.cachedResults[self.getSizeKey()];
    if (current) {
      current.hide();
    }
    self.numVerticalBlocks = num_vertical_blocks;

    if (self.getSizeKey() in self.cachedResults) {
      self.cachedResults[self.getSizeKey()].show();
      return true;
    } else {
      self.ditherImage();
      return false;
    }
  };

  self.destroy = function() {
    $('.bricker-display-box').remove();
  };
}