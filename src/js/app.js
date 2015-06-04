"use strict";
/* jshint globalstrict: true */
/* exported BrickerApp */

/* global $: false */
/* global Bricker: false */
/* global Colors: false */
/* global Globals: false */
/* global React: false */

function BrickerApp(img, csv_url, id) {

// HeightField
//=================================================================================================
var HeightField = React.createClass({
  onChange: function(event) {
    var height = event.target.value;
    this.props.data.handleUpdateHeight(height);
  },
  render: function() {
    return (
      <div className="toolbar-block-height">
        <input type="text" value={this.props.defaultValue} onChange={this.onChange}></input>
        <span> blocks high</span>
      </div>
    );
  }
});

// Color Picker
//=================================================================================================
var ColorEntry = React.createClass({
  getInitialState: function() {
    return { isSelected: this.props.color.isDefault() };
  },
  toggle: function() {
    if (this.state.isSelected) {
      this.props.data.handleRemoveFromPalette(this.props.color.id);
    } else {
      this.props.data.handleAddToPalette(this.props.color.id);
    }
    this.setState({ isSelected: !this.state.isSelected });
  },
  render: function() {
    var divStyle = {
      backgroundColor: this.props.color.getRGBString()
    };
    var class_name = this.state.isSelected ? "toolbar-color-entry selected" : "toolbar-color-entry";
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
  render: function() {
    var self = this;
    var colorNodes = this.props.data.colors.map(function (color) {
      return (
        <ColorEntry key={color.id} color={color} data={self.props.data}/>
      );
    });
    return (
      <div className="toolbar-color-list">
        {colorNodes}
      </div>
    );
  }
});

// Main App
//=================================================================================================
var App = React.createClass({
  propTypes: {
  },
  getInitialState: function() {
    return {
      colors: { rows: [] },
      selectedColors: [],
      numVerticalBlocks: this.getDefaultHeight(),
      stackMode: false,
      bricker: null
    };
  },
  componentDidMount: function() {
    var self = this;
    $.ajax({
      type: 'GET',
      url: this.props.colorsURL,
      dataType: 'text',
      success: function(csv_text) {
        var colors = new Colors(csv_text);
        console.log('Successfully fetched colors CSV (', self.props.colorsURL, ')');
        self.initializeColors(colors);
      }
    });
  },
  getDefaultHeight: function() {
    var height = Math.floor(this.props.image[0].naturalHeight / Globals.blockSize);
    return height > 40 ? 40 : height;
  },
  updateHeight: function(height) {
    this.state.bricker.changeSize(height);
    this.setState({ numVerticalBlocks: height });
  },
  updatePalette: function(selected_ids) {
    var palette = this.state.colors.getPalette(selected_ids);
    if (this.state.bricker) {
      this.state.bricker.destroy();
    }
    var bricker = new Bricker(this.props.image,
                              palette,
                              this.state.numVerticalBlocks,
                              this.state.stackMode);
    bricker.ditherImage();
    this.setState({ selectedColors: selected_ids, bricker: bricker });
  },
  addToPalette: function(selected_id) {
    var ids = this.state.selectedColors;
    if (ids.indexOf(selected_id) === -1) {
      ids.push(selected_id);
      this.updatePalette(ids);
    }
  },
  removeFromPalette: function(selected_id) {
    var ids = this.state.selectedColors;
    var index = ids.indexOf(selected_id);
    if (index !== -1) {
      ids.splice(index, 1);
      this.updatePalette(ids);
    }
  },
  initializeColors: function(colors) {
    this.setState({ colors: colors });
    this.updatePalette(colors.getDefaultIDs());
  },
  render: function() {
    var data = {
      colors: this.state.colors.rows,
      handleAddToPalette: this.addToPalette,
      handleRemoveFromPalette: this.removeFromPalette,
      handleUpdateHeight: this.updateHeight
    };
    return (
      <div>
        <HeightField data={data} defaultValue={this.state.numVerticalBlocks} />
        <ColorPicker data={data} />
      </div>
    );
  }
});

// Initialize
//=================================================================================================
React.render(
  <App colorsURL={csv_url} image={img} />,
  document.getElementById(id)
);

}