"use strict";
/* jshint globalstrict: true */
/* global module */

var Globals = {
  blockSize: 16,
  blockRealHeight: 9.6,
  blockRealWidth: 7.8,
  maxHeight: 200,
  defaultHeight: 64,
  displayBoxClass: 'bricker-display-box',
  displayBoxImageClass: 'bricker-display-box-image',
  instructionsPreviewRows: 3,
  allBrickTypes: [16, 12, 10, 8, 6, 4, 3, 2, 1],
  initialBrickTypes: [12, 8, 6, 4, 3, 2, 1],
  init: function() {
    this.displayBoxSelector = '.' + this.displayBoxClass;
    this.blockAspectRatio = this.blockRealHeight / this.blockRealWidth;
  }
};

Globals.init();

module.exports = Globals;