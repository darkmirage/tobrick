"use strict";
/* jshint globalstrict: true */

/* global require, module, React */

var Globals = require('../globals');

var Options = React.createClass({
  getInitialState: function() {
    return {
      stackMode: this.props.stackMode,
      changed: false,
      height: this.props.defaultHeight,
      useMetric: true
    };
  },
  _toFeet: function(x) {
    var realFeet = ((x*0.393700) / 12);
    var feet = Math.floor(realFeet);
    var inches = Math.round((realFeet - feet) * 12);
    return feet + '\u2032 ' + inches + '\u2033';
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
    this.setState({ height: height, changed: true });
  },
  onClickSave: function() {
    this.props.data.handleUpdateHeight(this.state.height, this.state.stackMode);
    this.setState({ changed: false });
  },
  onFocus: function(event) {
    $(event.currentTarget).select();
  },
  onChangeStackMode: function() {
    this.setState({ stackMode: !this.state.stackMode, changed: true });
  },
  onChangeUseMetric: function() {
    this.setState({ useMetric: !this.state.useMetric });
  },
  render: function() {
    var button_class = this.state.changed ? "btn btn-custom" : "btn btn-custom disabled";
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Options</div>
        <div className="toolbar-content">
          <table className="toolbar-options">
            <tr>
              <th>Height in Blocks</th>
              <td>
                <input type="text" className="btn-custom" value={this.state.height} onClick={this.onFocus} onChange={this.onChange}></input>
              </td>
            </tr>
            <tr title="Choose between top down or stacking bricks">
              <th>Stack Bricks</th>
              <td>
                <input type="checkbox" className="btn-custom" checked={this.state.stackMode} onChange={this.onChangeStackMode}></input>
              </td>
            </tr>
            <tr>
              <th>Use Metric</th>
              <td>
                <input type="checkbox" className="btn-custom" checked={this.state.useMetric} onChange={this.onChangeUseMetric}></input>
              </td>
            </tr>
          </table>

          <div className="toolbar-save">
            <button className={button_class} onClick={this.onClickSave}>Save Options</button>
          </div>
        </div>
        <div className="toolbar-footer">
          <div className="toolbar-dimensions">
            Design measures <strong>{this._printDimensions()}</strong>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Options;