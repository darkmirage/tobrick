"use strict";
/* jshint globalstrict: true */
/* exported Colors, Color */

function Color(headers, line) {
  var self = this;

  for (var i = 0; i < headers.length; i++) {
    var val = line[i];
    if (headers[i] !== 'name') {
      val = parseInt(val);
    }
    self[headers[i].toLowerCase()] = val;
  }
  line = null;

  self.getRGBString = function() {
    return 'rgba(' + self.r + ',' + self.g + ',' + self.b + ',1.0)';
  };

  self.getRGB = function() {
    return [self.r, self.g, self.b];
  };

  self.isDefault = function() {
    return self.show_as_default === 1;
  };
}

function Colors(csv_text) {
  var self = this;
  var idMap = {};
  var rgbaMap = {};

  var lines = csv_text.split(/\r\n|\n/);
  self.headers = lines[0].split(',');
  self.rows = [];
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].split(',');
    var color = new Color(self.headers, line);
    self.rows.push(color);
    idMap[color.id] = color;
    rgbaMap[color.getRGBString()] = color;
  }
  lines = null;

  self.getDefaultIDs = function() {
    var ids = [];
    for (var i = 0; i < self.rows.length; i++) {
      var color = self.rows[i];
      if (color.isDefault()) {
        ids.push(color.id);
      }
    }
    return ids;
  };

  self.getPalette = function(ids) {
    var palette = [];
    for (var i = 0; i < self.rows.length; i++) {
      var color = self.rows[i];
      if (ids.indexOf(color.id) !== -1) {
        palette.push(color.getRGB());
      }
    }
    return palette;
  };

  self.getColorFromRGBA = function(rgba) {
    return rgbaMap[rgba];
  };
}
