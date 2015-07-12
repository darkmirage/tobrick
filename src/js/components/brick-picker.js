"use strict";
/* jshint globalstrict: true */

/* global require, module, React */

var Globals = require('../globals');

var BrickPicker = React.createClass({
  getInitialState: function() {
    return {
      changed: false,
      selectedBrickTypes: this.props.selectedBrickTypes
    };
  },
  onClickSave: function() {
    this.props.data.handleUpdateSelectedBricks(this.state.selectedBrickTypes);
    this.setState({ changed: false });
    console.log("test");
  },
  onClick: function(event) {
    var brick_type = parseInt(event.currentTarget.value);
    var selected_types = this.state.selectedBrickTypes;
    var index = selected_types.indexOf(brick_type);
    if (index === -1) {
      selected_types.push(brick_type);
    } else {
      selected_types.splice(index, 1);
    }
    this.setState({ selectedBrickTypes: selected_types, changed: true });
  },
  render: function() {
    var self = this;
    var brickNodes = Globals.allBrickTypes.map(function(brick_type) {
      if (brick_type === 1) {
        return null;
      }
      var selected = self.state.selectedBrickTypes.indexOf(brick_type) !== -1;
      var class_name = selected ? 'btn btn-custom active' : 'btn btn-custom';
      return (
        <button type="button" key={brick_type} className={class_name} value={brick_type} onClick={self.onClick}>
          1 x {brick_type}
        </button>
      );
    });

    var button_class = this.state.changed ? "btn btn-primary" : "btn btn-primary disabled";

    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Bricks</div>
        <div className="toolbar-content">
          <div className="toolbar-brick-list">
            {brickNodes}
            <button type="button" className="btn btn-custom active" title="1x1 bricks must always be selected">
              1 x 1
            </button>
          </div>
          <div className="toolbar-save">
            <button className={button_class} onClick={this.onClickSave}>Save Bricks</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BrickPicker;