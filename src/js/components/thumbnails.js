"use strict";
/* jshint globalstrict: true */

/* global require, module, React */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Uploader = require('./uploader');

var Thumbnail = React.createClass({
  onClick: function(event) {
    var src = event.target.style.backgroundImage.replace('url(','').replace(')','');
    var use_colors = this.props.thumbnail.colors;
    this.props.data.handleChangeImage(src, use_colors);
  },
  render: function() {
    var style = {
      backgroundImage: 'url(' + this.props.thumbnail.src + ')'
    };
    return (
      <div className="bricker-thumbnail-box">
        <div style={style} className="bricker-thumbnail" title={this.props.thumbnail.title} onClick={this.onClick} />
        <div className="bricker-thumbnail-popup">
          <img src={this.props.thumbnail.src} className="bricker-thumbnail-popup-image" />
          <div className="bricker-thumbnail-popup-caption">{this.props.thumbnail.title}</div>
        </div>
      </div>
    );
  }
});

var Thumbnails = React.createClass({
  render: function() {
    var self = this;
    var thumbnailNodes = this.props.thumbnails.map(function(thumbnail) {
      return (
        <Thumbnail key={thumbnail.title} thumbnail={thumbnail} data={self.props.data}/>
      );
    });
    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Try out the preset images</div>
          <ReactCSSTransitionGroup transitionName="bricker-thumbnail-transition">
            {thumbnailNodes}
          </ReactCSSTransitionGroup>
        <div className="bricker-thumbnail-box">
          <Uploader data={this.props.data} />
        </div>
      </div>
    );
  }
});

module.exports = Thumbnails;