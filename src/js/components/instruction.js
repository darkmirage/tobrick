"use strict";
/* jshint globalstrict: true */

/* global module, React */

var Instruction = React.createClass({
  onClickShow: function(event) {
    event.preventDefault();
  },
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
        <a href="#" onClick={this.onClickShow} className={class_name}>Show</a>
      </div>
    );
  }
});

module.exports = Instruction;