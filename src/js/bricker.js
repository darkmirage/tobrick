"use strict";
/* jshint globalstrict: true */
/* exported Bricker */

/* global $: false */
/* global DitherJS: false */


function Bricker(original_image, colors, num_vertical_blocks) {
  var self = this;
  var kOrigImage = original_image;
  var kBlockSize = 16;
  var kScratchCanvas = $('#bricker-scratch-canvas');
  var kScratchImg = $('#bricker-scratch-img');

  self.numVerticalBlocks = num_vertical_blocks;
  self.colors = colors;
  self.cachedResults = {};

  var _cropImage = function() {
    var src_width = kOrigImage[0].naturalWidth;
    var src_height = kOrigImage[0].naturalHeight;

    var new_height = self.numVerticalBlocks * kBlockSize;
    var new_width = Math.floor((src_width / src_height) * (self.numVerticalBlocks)) * kBlockSize;
    var resized_width = new_height / src_height * src_width;
    var x_offset = (resized_width - new_width) / 2;

    var canvas = kScratchCanvas[0];

    canvas.width = new_width;
    canvas.height = new_height;

    canvas.getContext("2d").drawImage(kOrigImage[0], x_offset, 0, src_width, src_height, 0, 0, new_width, new_height);

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

  self._resetZoom = function(display_box) {
    var canvas = $('canvas', display_box);
    var img = $('img', display_box);
    if (canvas.width() <= kOrigImage.width()) {
      return;
    }

    var newWidth = kOrigImage.width();
    var newHeight = canvas.height() / canvas.width() * newWidth;
    canvas.width(newWidth);
    canvas.height(newHeight);
    img.width(newWidth);
    img.height(newHeight);
  };

  self.ditherImage = function() {
    var display_box = _cloneImage();
    self.cachedResults[self.getSizeKey()] = display_box;

    var options = {
        'step': kBlockSize,
        'className': 'tmp-image-' + self.getSizeKey(),
        'palette': self.colors.getDefaultPalette(),
        'algorithm': 'ordered'
    };


    display_box.css("visibility", "hidden");
    new DitherJS('.tmp-image-' + self.getSizeKey(), options, function() {
      display_box.css("visibility", "visible");
      self._resetZoom(display_box);
    });
  };

  self.getSizeKey = function() {
    return "bricker-size-" + self.numVerticalBlocks;
  };

  self.changeSize = function(num_vertical_blocks) {
    self.cachedResults[self.getSizeKey()].hide();
    self.numVerticalBlocks = num_vertical_blocks;

    if (self.getSizeKey() in self.cachedResults) {
      self.cachedResults[self.getSizeKey()].show();
      return true;
    } else {
      self.ditherImage();
      return false;
    }
  };

}