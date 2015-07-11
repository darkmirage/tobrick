"use strict";
/* jshint globalstrict: true */

/* global module, React */

var Globals = require('../globals');

var Instruction = React.createClass({
  render: function() {
    var class_name = 'btn btn-default';
    if (!this.props.data.ready) {
      class_name += ' disabled';
    }
    var totalCount = this.props.instructions ? this.props.instructions.brickCounts.total : 0;
    return (
      <div className="toolbar-section">
        <div>
          Number of bricks: {totalCount}
        </div>
        <div className="toolbar-label">Build instructions</div>
        <button type="button" className="btn btn-primary btn-lg">
          Show Instuctions
        </button>
      </div>
    );
  }
});

module.exports = Instruction;