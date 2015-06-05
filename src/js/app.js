"use strict";
/* jshint globalstrict: true */
/* exported BrickerApp */

/* global $: false */
/* global Bricker: false */
/* global Colors: false */
/* global Globals: false */
/* global React: false */

function BrickerApp(img, csv_url, id, thumbnails) {

// Thumbnails
//=================================================================================================
var Thumbnail = React.createClass({
  onClick: function(event) {
    var src = event.target.src;
    this.props.data.handleChangeImage(src);
  },
  render: function() {
    return (
      <img src={this.props.thumbnail.src} className="bricker-thumbnail" title={this.props.thumbnail.title} onClick={this.onClick} />
    );
  }
});

var Thumbnails = React.createClass({
  render: function() {
    var self = this;
    var thumbnailNodes = this.props.data.thumbnails.map(function (thumbnail) {
      return (
        <Thumbnail key={thumbnail.title} thumbnail={thumbnail} data={self.props.data}/>
      );
    });
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Try out the preset images</div>
        {thumbnailNodes}
      </div>
    );
  }
});

// HeightField
//=================================================================================================
var HeightField = React.createClass({
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
    var class_name = "toolbar-color-entry";
    if (this.state.isSelected) {
      class_name += " toolbar-color-entry-selected";
    }
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
      <div className="toolbar-section">
        <div className="toolbar-label">Pick the block colors you want to incorporate</div>
        <div className="toolbar-color-list">
          {colorNodes}
        </div>
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
    this.props.image.on('load', function() {
      self.setState({ numVerticalBlocks: self.getDefaultHeight() });
      self.resetBricker();
    });
  },
  initializeColors: function(colors) {
    var self = this;
    this.setState({ colors: colors });
    setTimeout(function() {
      self.updatePalette(colors.getDefaultIDs());
    }, 1);
  },
  resetBricker: function() {
    if (this.state.bricker) {
      this.state.bricker.destroy();
    }
    var palette = this.state.colors.getPalette(this.state.selectedColors);
    var bricker = new Bricker(this.props.image,
                              palette,
                              this.state.numVerticalBlocks,
                              this.state.stackMode);
    bricker.ditherImage();
    this.setState({ bricker: bricker });
  },
  getDefaultHeight: function() {
    var height = Math.floor(this.props.image[0].naturalHeight / (Globals.blockSize / 4));
    return height > Globals.defaultHeight ? Globals.defaultHeight : height;
  },
  changeImage: function(src) {
    $(Globals.displayBoxSelector).remove();
    this.props.image[0].src = src;
  },
  updateHeight: function(height) {
    this.state.bricker.changeSize(height);
    this.setState({ numVerticalBlocks: height });
  },
  updatePalette: function(selected_ids) {
    this.setState({ selectedColors: selected_ids });
    this.resetBricker();
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
  render: function() {
    var data = {
      thumbnails: this.props.thumbnails,
      colors: this.state.colors.rows,
      handleAddToPalette: this.addToPalette,
      handleRemoveFromPalette: this.removeFromPalette,
      handleUpdateHeight: this.updateHeight,
      handleChangeImage: this.changeImage
    };
    return (
      <div>
        <Thumbnails data={data} />
        <HeightField data={data} defaultValue={this.state.numVerticalBlocks} />
        <ColorPicker data={data} />
      </div>
    );
  }
});

// Initialize
//=================================================================================================
React.render(
  <App colorsURL={csv_url} image={img} thumbnails={thumbnails} />,
  document.getElementById(id)
);

}