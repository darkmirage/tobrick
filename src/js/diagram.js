"use strict";
/* jshint globalstrict: true */

/* global $, require, module, React */

var Globals = require('./globals');

var Diagram = React.createClass({
  getInitialState: function() {
    return {
      instructions: null,
      stackMode: false,
      showLabel: true,
      colors: null
    };
  },
  updateInstructions: function(instructions, stackMode, colors) {
    this.setState({
      instructions: instructions,
      stackMode: stackMode,
      colors: colors
    });
  },
  hideLabel: function() {
    this.setState({ showLabel: !this.state.showLabel });
  },
  render: function() {
    if (!this.state.colors) {
      return null;
    }

    var data = {
      instructions: this.state.instructions,
      stackMode: this.state.stackMode,
      showLabel: this.state.showLabel,
      handleHideLabel: this.hideLabel,
      colors: this.state.colors
    };

    return (
      <div>
        <h2 id="instructions">Build Instructions</h2>
        <div className="instruction-diagram-controls row">
          <div className="col-sm-4 text-right">
            <InstructionToolbar data={data} />
          </div>
          <div className="col-sm-4">
            <InstructionTable data={data} />
          </div>
          
        </div>
        <InstructionRows data={data} />
      </div>
    );
  }
});

var InstructionTable = React.createClass({
  render: function() {
    var instructions = this.props.data.instructions;
    if (instructions === null) {
      return null;
    }

    var self = this;
    var brick_counts = instructions.brickCounts;

    var headerNodes = brick_counts.brick_colors.map(function(color_id) {
      var color = self.props.data.colors.getColorFromID(color_id);
      return (
        <th key={color_id}>
          <InstructionBrick data={self.props.data} color={color} dimension={1} />
        </th>
      );
    });

    var col_sums = brick_counts.brick_colors.map(function() {
      return 0;
    });

    var rowNodes = brick_counts.brick_types.map(function(type) {

      var row_sum = 0;
      var cellNodes = brick_counts.brick_colors.map(function(color_id, index) {
        var key = type + ', ' + color_id;
        var count = key in brick_counts.individual ? brick_counts.individual[key] : 0;
        row_sum += count;
        col_sums[index] += count;
        return (
          <td key={key}>{count}</td>
        );
      });

      var color = self.props.data.colors.getColorFromID(194);

      return (
        <tr key={type}>
          <th className="text-right"><InstructionBrick data={self.props.data} color={color} dimension={type} /></th>
          <th>1 x {type}</th>
          {cellNodes}
          <td>{row_sum}</td>
        </tr>
      );
    });

    var sumNodes = col_sums.map(function(sum, index) {
      return (
        <td key={index}>{sum}</td>
      );
    });

    return (
      <table className="instruction-table table table-bordered table-striped">
        <tr>
          <th colSpan="2">Brick Size</th>
          {headerNodes}
          <th></th>
        </tr>
        {rowNodes}
        <tr>
          <td colSpan="2"></td>
          {sumNodes}
          <td>{brick_counts.total}</td>
        </tr>
      </table>
    );
  }
});

var InstructionToolbar = React.createClass({
  scrollToTop: function() {
    $(document.body).animate({
      scrollTop: $('#header').offset().top
    }, 400);
  },
  render: function() {
    var text = this.props.data.showLabel ? 'Hide Brick Labels' : 'Show Brick Labels';
    return (
      <div className="btn-toolbar" style={{display: 'inline-block'}}>
        <div className="btn-group">
          <button type="button" className="btn btn-primary btn-lg" onClick={this.scrollToTop}>
            Go Back
          </button>
        </div>
        <div className="btn-group">
          <button type="button" className="btn btn-custom btn-lg" onClick={this.props.data.handleHideLabel}>
            {text}
          </button>
        </div>
      </div>
    );
  }
});

var InstructionRows = React.createClass({
  render: function() {
    var instructions = this.props.data.instructions;
    if (instructions === null) {
      return null;
    }

    var self = this;
    var rows = instructions.bricks;
    var rowNodes = rows.map(function(row, index) {
      var row_num = rows.length - index;
      return (
        <InstructionRow key={index}
                        rowNumber={row_num}
                        row={row}
                        data={self.props.data} />
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
        <InstructionBrick key={index}
                          rowNum={self.props.rowNumber}
                          num={index+1}
                          dimension={brick.dimension}
                          color={brick.color}
                          data={self.props.data} />
      );
    });
    var class_name = 'instruction-diagram-row';
    if (!this.props.data.showLabel) {
      class_name += ' hide-label';
    }

    return (
      <div className={class_name}>
        <div className="instruction-diagram-row-number instruction-diagram-label">{this.props.rowNumber} </div>
        {brickNodes}
        <div className="instruction-diagram-row-number instruction-diagram-label">{this.props.rowNumber} </div>
      </div>
    );
  }
});

var InstructionBrick = React.createClass({
  render: function() {
    var style = {
      backgroundColor: this.props.color.getRGBString(),
      // height: 9.6 * 2,
      width: this.props.data.stackMode ? Globals.blockRealWidth * 2 * this.props.dimension : Globals.blockRealHeight * 2 * this.props.dimension
    };
    var text_style = {
      color: this.props.color.isDark() ? '#fff' : '#000',
    };

    var hover_box = null;
    if (this.props.num) {
      hover_box = (
        <div className="instruction-diagram-hover">
          <strong>{this.props.color.name}</strong> of size <strong>{this.props.dimension}</strong>
          <br/>
          at position <strong>{this.props.num}</strong> of row <strong>{this.props.rowNum}</strong>
        </div>
      );
    } else {
      hover_box = (
        <div className="instruction-diagram-hover">
          <strong>{this.props.color.name}</strong>
        </div>
      );
    }

    return (
      <div className="instruction-diagram-brick" style={style}>
        <span className="instruction-diagram-label" style={text_style}>{this.props.num}</span>
        {hover_box}
      </div>
    );
  }
});

module.exports = Diagram;