"use strict";
/* jshint globalstrict: true */

/* global $, require, module */
/* global React: false */

var Colors = require('./colors');
var Globals = require('./globals');
var Bricker = require('./bricker');

function BrickerApp(img, csv_url, id, thumbnails) {

console.log("Initializing BrickerApp");

// Thumbnails
//=================================================================================================
var Thumbnail = React.createClass({
  onClick: function(event) {
    var src = event.target.src;
    var use_colors = this.props.thumbnail.colors;
    this.props.data.handleChangeImage(src, use_colors);
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
    var thumbnailNodes = this.props.thumbnails.map(function (thumbnail) {
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

// Image uploader
//=================================================================================================
var Uploader = React.createClass({
  onChange: function(event) {
    var self = this;
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
      self.props.data.handleChangeImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  },
  render: function() {
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Or upload your own</div>
        <div className="tooblar-upload">
          <span className="btn btn-lg btn-default btn-file">
            Upload image<input type="file" onChange={this.onChange}></input>
          </span>
        </div>
      </div>
    );
  }
});


// Instruction options
//=================================================================================================
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

// Display height
//=================================================================================================
var HeightField = React.createClass({
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

// Color Picker
//=================================================================================================
var ColorEntry = React.createClass({
  toggle: function() {
    if (this.props.isSelected) {
      this.props.data.handleRemoveFromPalette(this.props.color.id);
    } else {
      this.props.data.handleAddToPalette(this.props.color.id);
    }
  },
  render: function() {
    var divStyle = {
      backgroundColor: this.props.color.getRGBString()
    };
    var class_name = "toolbar-color-entry";
    if (this.props.isSelected) {
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
  selectedColorEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return selected_colors.indexOf(color.id) !== -1;
    }).map(this.mapEntries);
  },
  otherColorEntries: function() {
    var selected_colors = this.props.selectedColors;
    return this.props.colors.filter(function(color) {
      return selected_colors.indexOf(color.id) === -1;
    }).map(this.mapEntries);
  },
  mapEntries: function(color) {
    var self = this;
    var selected = this.props.selectedColors.indexOf(color.id) !== -1;
    return (
      <ColorEntry key={color.id} color={color} isSelected={selected} data={self.props.data}/>
    );
  },
  render: function() {
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Pick the block colors you want to incorporate</div>
        <div className="toolbar-color-list">
          {this.selectedColorEntries()}
          {this.otherColorEntries()}
        </div>
        <a className="btn btn-default" onClick={this.props.data.handleReset}>Show me</a>
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
      selectedBrickTypes: [8, 4, 2, 1],
      numVerticalBlocks: this.getDefaultHeight(),
      stackMode: false,
      bricker: null,
      mosaicDimension: { width: 0, height: 0 },
      ready: false,
      instructions: null
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
      self.setState({ selectedColors: colors.getDefaultIDs() });
      self.resetBricker();
    }, 1);
  },
  resetBricker: function() {
    var self = this;
    if (this.state.bricker) {
      this.state.bricker.destroy();
    }
    var bricker = new Bricker(this.props.image,
                              this.state.numVerticalBlocks,
                              this.state.colors,
                              this.state.selectedColors,
                              this.state.stackMode, function(dim) {
                                self.setState({ mosaicDimension: dim });
                              });
    self.setState({ ready: false });
    bricker.ditherImage(function() {
      self.refreshInstructions();
      self.setState({ ready: true });
    });
    self.setState({ bricker: bricker });
  },
  getDefaultHeight: function() {
    var height = Math.floor(this.props.image[0].naturalHeight / (Globals.blockSize / 4));
    return height > Globals.defaultHeight ? Globals.defaultHeight : height;
  },
  changeImage: function(src, use_colors) {
    $(Globals.displayBoxSelector).remove();
    if (!use_colors) {
      use_colors = this.state.colors.getDefaultIDs();
    }
    this.setState({ selectedColors: use_colors });
    this.props.image[0].src = src;
  },
  refreshInstructions: function() {
    var bricker = this.state.bricker;
    var brick_types = this.state.selectedBrickTypes;
    var instructions = bricker.generateInstructions(brick_types);
    this.setState({ instructions: instructions });
  },
  updateHeight: function(height) {
    var self = this;
    self.setState({ ready: false });
    this.state.bricker.changeSize(height, function() {
      self.refreshInstructions();
      self.setState({ ready: true });
    });
    this.setState({ numVerticalBlocks: height });
  },
  addToPalette: function(selected_id) {
    var ids = this.state.selectedColors;
    if (ids.indexOf(selected_id) === -1) {
      ids.push(selected_id);
      this.setState({ selectedColors: ids });
    }
  },
  removeFromPalette: function(selected_id) {
    var ids = this.state.selectedColors;
    var index = ids.indexOf(selected_id);
    if (index !== -1) {
      ids.splice(index, 1);
      this.setState({ selectedColors: ids });
    }
  },
  render: function() {
    var data = {
      ready: this.state.ready,
      handleAddToPalette: this.addToPalette,
      handleRemoveFromPalette: this.removeFromPalette,
      handleReset: this.resetBricker,
      handleUpdateHeight: this.updateHeight,
      handleChangeImage: this.changeImage
    };
    return (
      <div>
        <Thumbnails   data={data}
                      thumbnails={this.props.thumbnails} />
        <Uploader     data={data} />
        <HeightField  data={data}
                      dimension={this.state.mosaicDimension}
                      defaultValue={this.state.numVerticalBlocks}
                      stackMode={this.state.stackMode} />
        <Instruction  data={data}
                      instructions={this.state.instructions} />
        <ColorPicker  data={data}
                      colors={this.state.colors.rows}
                      selectedColors={this.state.selectedColors} />
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

module.exports = BrickerApp;