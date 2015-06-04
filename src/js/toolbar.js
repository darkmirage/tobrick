"use strict";
/* global React: false */
function createToolbar(colors, id) {

  var ColorEntry = React.createClass({
    render: function() {
      return (
        <div className="toolbar-color-entry">
          {this.props.data.name}
        </div>
      );
    }
  });

  var ColorPicker = React.createClass({
    render: function() {
      var colorNodes = this.props.data.map(function (color) {
        return (
          <ColorEntry data={color} key={color.id} />
        );
      });
      return (
        <div className="toolbar-color-list">
          {colorNodes}
        </div>
      );
    }
  });

  React.render(
    <ColorPicker data={colors.rows} />,
    document.getElementById('toolbar')
  );
}