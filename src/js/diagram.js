"use strict";
/* jshint globalstrict: true */

/* global module, React */

var Diagram = React.createClass({
  getInitialState: function() {
    return {
      instructions: null
    };
  },
  updateInstructions: function(instructions) {
    this.setState({ instructions: instructions });
  },
  render: function() {
    return (
      <div>
        <h2 id="instructions">Build Instructions</h2>
        <InstructionRows instructions={this.state.instructions} />
      </div>
    );
  }
});

var InstructionRows = React.createClass({
  render: function() {
    var instructions = this.props.instructions;
    if (instructions === null) {
      return null;
    }

    var rows = instructions.bricks;
    var rowNodes = rows.map(function(row, index) {
      var row_num = rows.length - index;
      return (
        <InstructionRow key={index} rowNumber={row_num} row={row} />
      );
    });

    return (
      <div className="instruction-diagram-body">
        {rowNodes}
      </div>
    );
  }
});

var InstructionRow = React.createClass({
  render: function() {
    var self = this;
    var brickNodes = this.props.row.map(function(brick, index) {
      return (
        <InstructionBrick key={index} rowNum={self.props.rowNumber} brickNum={index+1} brick={brick} />
      );
    });
    return (
      <div className="instruction-diagram-row">
        <div className="instruction-diagram-row-number instruction-diagram-label">{this.props.rowNumber} </div>
        {brickNodes}
        <div className="instruction-diagram-row-number instruction-diagram-label">{this.props.rowNumber} </div>
      </div>
    );
  }
});

var InstructionBrick = React.createClass({
  render: function() {
    var brick = this.props.brick;
    var style = {
      backgroundColor: brick.color.getRGBString(),
      // height: 9.6 * 2,
      width: 7.8 * 2 * brick.dimension
    };
    var text_style = {
      color: brick.color.isDark() ? '#fff' : '#000',
    };
    return (
      <div className="instruction-diagram-brick" style={style}>
        <span className="instruction-diagram-label" style={text_style}>{this.props.brickNum}</span>
        <div className="instruction-diagram-hover">
          <strong>{brick.color.name}</strong> of size <strong>{brick.dimension}</strong>
          <br/>
          at position <strong>{this.props.brickNum}</strong> of row <strong>{this.props.rowNum}</strong>
        </div>
      </div>
    );
  }
});

module.exports = Diagram;