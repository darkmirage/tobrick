"use strict";
/* jshint globalstrict: true */

/* global $, require, module */

var DitherJS = require('../../lib/ditherjs');
var Globals = require('./globals');
var Brick = require('./brick');

function Bricker(original_image, num_vertical_blocks, colors, selected_colors, stack_mode, size_callback) {
  var self = this;
  var kColors = colors;
  var kOrigImage = $(original_image);
  var kScratchCanvas = $('#bricker-scratch-canvas');
  var kScratchImg = $('#bricker-scratch-img');
  var kStackMode = stack_mode;
  var kTmpPrefix = 'tmp-image-';
  var kCallback = size_callback;

  self.numVerticalBlocks = num_vertical_blocks;
  self.palette = kColors.getPalette(selected_colors);
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
    // var offset = 5;
    var offset = 0;
    context.drawImage(kOrigImage[0], offset, offset, src_width, src_height, 0, 0, new_width, new_height);

    // Not sure if there's a race condition here
    kScratchImg[0].src = canvas.toDataURL('image/png');
  };

  var _cloneImage = function() {
    var display_box = $('<div></div>');
    display_box.appendTo(kOrigImage.parent());

    display_box.addClass(_getSizeKey());
    display_box.addClass(Globals.displayBoxClass);
    display_box.addClass('bricker-display-box-active')

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

  var _getCurrentBox = function() {
    return self.cachedResults[_getSizeKey()];
  };

  self.ditherImage = function(callback) {
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
        if (callback) {
          callback();
        }
      });
    }, 1);
  };

  self.changeSize = function(num_vertical_blocks, callback) {
    var box = _getCurrentBox();
    if (box) {
      box.hide();
      box.removeClass('bricker-display-box-active')
    }
    self.numVerticalBlocks = num_vertical_blocks;

    if (_getSizeKey() in self.cachedResults) {
      box = _getCurrentBox();
      box.show();
      box.addClass('bricker-display-box-active');
      _returnSize($('canvas', box)[0]);
      if (callback) {
        callback();
      }
      return true;
    } else {
      self.ditherImage(callback);
      return false;
    }
  };

  self.destroy = function() {
    $(Globals.displayBoxSelector).remove();
  };



// Build instructions
//=================================================================================================
  var _getColorMatrix = function(box) {
    var canvas = $('canvas', box)[0];
    var width = canvas.width;
    var height = canvas.height;
    var data = canvas.getContext('2d').getImageData(0, 0, width, height).data;

    var color_matrix = [];
    for (var y = 0; y < height; y += Globals.blockSize) {
      var row = [];
      for (var x = 0; x < width; x += Globals.blockSize) {
        var index = (y * width + x) * 4;
        var rgba = 'rgba(' + data[index] + ',' + data[index+1] + ',' + data[index+2] + ',1.0)';
        var color = kColors.getColorFromRGBA(rgba);
        row.push(color);
      }
      color_matrix.push(row);
    }
    return color_matrix;
  };

  var _fitBricksInChunk = function(brick_types, num_blocks, color, brick_counts) {
    var chunk = [];
    var n = 0;
    for (var i = 0; i < brick_types.length; i++) {
      var brick = new Brick(brick_types[i], color);
      while (brick.dimension <= num_blocks) {
        if (n++ % 2 === 0) {
          chunk.unshift(brick);
        } else {
          chunk.push(brick);
        }
        if (!(brick in brick_counts)) {
          brick_counts[brick] = 0;
        }
        brick_counts[brick]++;
        brick_counts.total++;
        num_blocks -= brick.dimension;
      }
    }
    return chunk;
  };

  // Probably needs more arguments for valid block sizes and stack mode
  self.generateInstructions = function(brick_types) {
    if (!brick_types) {
      brick_types = [8, 4, 2, 1];
    }

    var box = _getCurrentBox();
    if (!box) {
      console.error("Failed to generate instructions");
      return;
    }

    var color_matrix = _getColorMatrix(box);
    var brick_matrix = [];
    var brick_counts = { total: 0 };

    for (var i = 0; i < color_matrix.length; i++) {
      var bricks = [];
      var row = color_matrix[i];

      var j = 0;
      while (j < row.length) {
        var start = j;
        var current_color = row[j];

        while (j < row.length && row[j].id === current_color.id) {
          j++;
        }

        var num_blocks = j - start;
        var chunk = _fitBricksInChunk(brick_types, num_blocks, current_color, brick_counts);
        bricks = bricks.concat(chunk);
      }
      brick_matrix.push(bricks);
    }
    console.log("Number of bricks: ", brick_counts.total);
    return { bricks: brick_matrix, brickCounts: brick_counts };
  };
}

module.exports = Bricker;