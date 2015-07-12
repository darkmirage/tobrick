"use strict";
/* jshint globalstrict: true */

/* global module */

function Brick(dimension, color) {
  var self = this;
  self.dimension = dimension;
  self.color = color;
}

Brick.prototype.toString = function() {
  return this.dimension + ', ' + this.color.id;
};

module.exports = Brick;