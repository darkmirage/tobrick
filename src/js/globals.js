"use strict";
/* jshint globalstrict: true */
/* exported Globals */

var Globals = {
  blockSize: 16,
  blockRealHeight: 9.6,
  blockRealWidth: 7.8,
  maxHeight: 200,
  defaultHeight: 120,
  displayBoxClass: 'bricker-display-box',
  displayBoxImageClass: 'bricker-display-box-image',
  init: function() {
    this.displayBoxSelector = '.' + this.displayBoxClass;
    this.blockAspectRatio = this.blockRealHeight / this.blockRealWidth;
  }
};

Globals.init();