"use strict";
/* jshint globalstrict: true */

/* global module, React */

var ColorEntry = React.createClass({
  toggle: function() {
    this.props.data.reportChanged();
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
  getInitialState: function() {
    return {
      changed: false
    };
  },
  selectedEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return selected_colors.indexOf(color.id) !== -1;
    }).map(this.mapEntries);
  },
  unselectedTransparentEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return color.isTransparent() && selected_colors.indexOf(color.id) === -1;
    }).map(this.mapEntries);
  },
  unselectedNormalEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return !color.isTransparent() && selected_colors.indexOf(color.id) === -1;
    }).map(this.mapEntries);
  },
  mapEntries: function(color) {
    var self = this;
    var selected = this.props.selectedColors.indexOf(color.id) !== -1;
    var data = this.props.data;
    data.reportChanged = function() {
      self.setState({ changed: true });
    };
    return (
      <ColorEntry key={color.id} color={color} isSelected={selected} data={data}/>
    );
  },
  onClick: function() {
    this.props.data.handleReset();
    this.setState({ changed: false });
  },
  render: function() {
    var button_class = this.state.changed ? "btn btn-primary" : "btn btn-primary disabled";
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Colors</div>
        <div className="toolbar-content">
          <div className="toolbar-color-list">
            {this.selectedEntries()}
            <br />
            {this.unselectedNormalEntries()}
          </div>
          <div className="toolbar-save">
            <button className={button_class} onClick={this.onClick}>Save Colors</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ColorPicker;