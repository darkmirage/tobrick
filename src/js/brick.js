"use strict";
/* jshint globalstrict: true */
/* exported Brick */

function Brick(dimension, color) {
  var self = this;
  self.dimension = dimension;
  self.color = color;
}

Brick.prototype.toString = function() {
  return '(' + this.dimension + ', ' + this.color.id + ' ' + this.color.name + ')';
};