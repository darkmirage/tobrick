"use strict";
/* jshint globalstrict: true */

/* global $, require, module, React */

var Colors = require('./colors');
var Globals = require('./globals');
var Bricker = require('./bricker');

var Thumbnails = require('./components/thumbnails');
var Instruction = require('./components/instruction');
var Options = require('./components/options');
var ColorPicker = require('./components/color-picker');
var BrickPicker = require('./components/brick-picker');

var Toolbar = React.createClass({
  propTypes: {
  },
  getInitialState: function() {
    return {
      colors: { rows: [] },
      selectedColors: [],
      selectedBrickTypes: Globals.initialBrickTypes,
      numVerticalBlocks: this.getDefaultHeight(),
      stackMode: false,
      bricker: null,
      mosaicDimension: { width: 0, height: 0 },
      ready: false,
      instructions: null,
      thumbnails: this.props.initialThumbnails
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
  addToThumbnails: function(src, file_name) {
    var self = this;
    var thumbnails = this.state.thumbnails;
    thumbnails.push({ src: src, title: file_name });
    this.setState({ thumbnails: thumbnails });
    self.changeImage(src);
  },
  refreshInstructions: function() {
    var bricker = this.state.bricker;
    var brick_types = this.state.selectedBrickTypes;
    var instructions = bricker.generateInstructions(brick_types);
    this.setState({ instructions: instructions });
    this.props.diagram.updateInstructions(instructions, this.state.stackMode, this.state.colors);
  },
  updateHeight: function(height, stackMode) {
    var self = this;
    if (stackMode !== this.state.stackMode) {
      this.state.numVerticalBlocks = height;
      this.state.stackMode = stackMode;
      this.setState({ numVerticalBlocks: height, stackMode: stackMode });
      this.resetBricker();
      return;
    }

    self.setState({ ready: false });
    this.state.bricker.changeSize(height, function() {
      self.refreshInstructions();
      self.setState({ ready: true });
    });
    this.setState({ numVerticalBlocks: height });
  },
  updateSelectedBricks: function(selected_bricks) {
    this.state.selectedBrickTypes = selected_bricks;
    this.setState({ selectedBrickTypes: selected_bricks });
    this.resetBricker();
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
    var self = this;
    var data = {
      ready: this.state.ready,
      handleAddToPalette: this.addToPalette,
      handleRemoveFromPalette: this.removeFromPalette,
      handleReset: this.resetBricker,
      handleUpdateHeight: this.updateHeight,
      handleUpdateSelectedBricks: this.updateSelectedBricks,
      handleChangeImage: this.changeImage,
      handleUploadedImage: this.addToThumbnails,
      handleStackMode: function() {
        self.setState({ stackMode: !self.state.stackMode });
      }
    };
    return (
      <div>
        <Thumbnails   data={data}
                      thumbnails={this.state.thumbnails} />
        <Instruction  data={data}
                      instructions={this.state.instructions} />
        <Options      data={data}
                      dimension={this.state.mosaicDimension}
                      defaultHeight={this.state.numVerticalBlocks}
                      stackMode={this.state.stackMode} />
        <BrickPicker  data={data}
                      selectedBrickTypes={this.state.selectedBrickTypes} />
        <ColorPicker  data={data}
                      colors={this.state.colors.rows}
                      selectedColors={this.state.selectedColors} />
      </div>
    );
  }
});

module.exports = Toolbar;