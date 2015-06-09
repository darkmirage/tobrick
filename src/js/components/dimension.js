"use strict";
/* jshint globalstrict: true */

/* global require, module, React */

var Globals = require('../globals');

var Dimension = React.createClass({
  getInitialState: function() {
    return {
      useMetric: true
    };
  },
  _toFeet: function(x) {
    var realFeet = ((x*0.393700) / 12);
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + '\u2032' + inches + '\u2033';
  },
  _getHeight: function() {
    if (this.props.stackMode) {
      return this.props.dimension.height * Globals.blockRealHeight / 10;
    } else {
      return this.props.dimension.height * Globals.blockRealWidth / 10;
    }
  },
  _getWidth: function() {
    return this.props.dimension.width * Globals.blockRealWidth / 10;
  },
  _printDimensions: function() {
    if (this.state.useMetric) {
      return this._getWidth().toFixed(1) + 'cm x ' + this._getHeight().toFixed(1) + 'cm';
    } else {
      return this._toFeet(this._getWidth()) + ' x ' + this._toFeet(this._getHeight());
    }
  },
  onChange: function(event) {
    var height = event.target.value;
    this.props.data.handleUpdateHeight(height);
  },
  render: function() {
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">How tall should the mosaic be?</div>
        <div className="toolbar-block-height">
          <input type="text" value={this.props.defaultValue} onChange={this.onChange}></input>
          <span> blocks high</span>
        </div>
        <div className="toolbar-dimensions">
          Dimensions: {this._printDimensions()}
        </div>
      </div>
    );
  }
});

module.exports = Dimension;