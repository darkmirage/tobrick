"use strict";
/* jshint globalstrict: true */
/* exported Bricker */

/* global $: false */
/* global DitherJS: false */


function Bricker(class_name, colors, num_vertical_blocks) {
  var self = this;
  var original_image = $('.' + class_name);
  var block_size = 16;

  self.num_vertical_blocks = num_vertical_blocks;
  self.colors = colors;
  self.cached_results = {};

  self._cloneImage = function() {
    var displayBox = $('<div></div>');
    displayBox.appendTo(original_image.parent());
    displayBox.addClass(self.getSizeKey());
    displayBox.addClass('dither-display-box');

    var tmp = original_image.clone();
    tmp.removeClass(class_name);
    tmp.addClass('dither-display-box-image');

    var width = tmp.width();
    var height = tmp.height();
    var newHeight = block_size * self.num_vertical_blocks;
    var newWidth = newHeight / height * width;
    // Needs crop here
    tmp.width(newWidth);
    tmp.height(newHeight);

    // Background comparison image
    tmp.clone().appendTo(displayBox);

    tmp.addClass('tmp-image-' + self.getSizeKey());
    tmp.appendTo(displayBox);

    return displayBox;
  };

  self._resetZoom = function(displayBox) {
    var canvas = $('canvas', displayBox);
    var img = $('img', displayBox);
    if (canvas.width() <= original_image.width()) {
      return;
    }

    var newWidth = original_image.width();
    var newHeight = canvas.height() / canvas.width() * newWidth;
    canvas.width(newWidth);
    canvas.height(newHeight);
    img.width(newWidth);
    img.height(newHeight);
  };

  self.ditherImage = function() {
    var displayBox = self._cloneImage();
    self.cached_results[self.getSizeKey()] = displayBox;

    var options = {
        'step': block_size,
        'className': 'tmp-image-' + self.getSizeKey(),
        'palette': self.colors.getDefaultPalette(),
        'algorithm': 'ordered'
    };


    displayBox.css("visibility", "hidden");
    new DitherJS('.tmp-image-' + self.getSizeKey(), options, function() {
      displayBox.css("visibility", "visible");
      self._resetZoom(displayBox);
    });
  };

  self.getSizeKey = function() {
    return "bricker-size-" + self.num_vertical_blocks;
  };

  self.changeSize = function(num_vertical_blocks) {
    self.cached_results[self.getSizeKey()].hide();
    self.num_vertical_blocks = num_vertical_blocks;

    if (self.getSizeKey() in self.cached_results) {
      self.cached_results[self.getSizeKey()].show();
      return true;
    } else {
      self.ditherImage();
      return false;
    }
  };

}