"use strict";
/* jshint globalstrict: true */

/* global module, React */

var Instruction = React.createClass({
  render: function() {
    var class_name = 'btn btn-default';
    if (!this.props.data.ready) {
      class_name += ' disabled';
    }

    if (!this.props.instructions) {
      return null;
    }

    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Build It</div>
        <div className="toolbar-content">
          <button type="button" className="btn btn-primary btn-lg">
            Show Instuctions
          </button>
        </div>
        <div className="toolbar-footer">
            Design requires <strong>{this.props.instructions.brickCounts.total}</strong> bricks
        </div>
      </div>
    );
  }
});

module.exports = Instruction;