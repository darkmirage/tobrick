"use strict";
/* jshint globalstrict: true */

/* global module, React */

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

module.exports = Thumbnails;