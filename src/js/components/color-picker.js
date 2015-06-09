"use strict";
/* jshint globalstrict: true */

/* global module, React */

var ColorEntry = React.createClass({
  toggle: function() {
    if (this.props.isSelected) {
      this.props.data.handleRemoveFromPalette(this.props.color.id);
    } else {
      this.props.data.handleAddToPalette(this.props.color.id);
    }
  },
  render: function() {
    var divStyle = {
      backgroundColor: this.props.color.getRGBString()
    };
    var class_name = "toolbar-color-entry";
    if (this.props.isSelected) {
      class_name += " toolbar-color-entry-selected";
    }
    return (
      <div className={class_name}
           onClick={this.toggle}
           style={divStyle}
           title={this.props.color.name}>
      </div>
    );
  }
});

var ColorPicker = React.createClass({
  selectedColorEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return selected_colors.indexOf(color.id) !== -1;
    }).map(this.mapEntries);
  },
  otherColorEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return selected_colors.indexOf(color.id) === -1;
    }).map(this.mapEntries);
  },
  mapEntries: function(color) {
    var self = this;
    var selected = this.props.selectedColors.indexOf(color.id) !== -1;
    return (
      <ColorEntry key={color.id} color={color} isSelected={selected} data={self.props.data}/>
    );
  },
  render: function() {
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Pick the block colors you want to incorporate</div>
        <div className="toolbar-color-list">
          {this.selectedColorEntries()}
          {this.otherColorEntries()}
        </div>
        <a className="btn btn-default" onClick={this.props.data.handleReset}>Show me</a>
      </div>
    );
  }
});

module.exports = ColorPicker;