"use strict";
/* jshint globalstrict: true */
/* exported Globals */

var Globals = {
  blockSize: 16,
  blockAspectRatio: 9.6 / 7.8,
  maxHeight: 200,
  defaultHeight: 90,
  displayBoxClass: 'bricker-display-box',
  displayBoxImageClass: 'bricker-display-box-image',
  init: function() {
    this.displayBoxSelector = '.' + this.displayBoxClass;
  }
};

Globals.init();