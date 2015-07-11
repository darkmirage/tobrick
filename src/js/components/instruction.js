"use strict";
/* jshint globalstrict: true */

/* global $, module, React */

var Instruction = React.createClass({
  getInitialState: function() {
    return {
      imgurURL: null
    };
  },
  _getImageURL: function() {
    var active = $('.bricker-display-box-active');
    var canvas = $('canvas', active);
    return canvas.get(0).toDataURL('image/png');
  },
  scrollToInstructions: function() {
    $(document.body).animate({
      scrollTop: $('#instructions').offset().top
    }, 400);
  },
  saveImage: function(event) {
    event.currentTarget.href = this._getImageURL();
  },
  uploadImage: function(event) {
    if (this.state.imgurURL) {
      window.open(this.state.imgurURL, '_blank');
      return;
    }
    var self = this;
    var img = this._getImageURL().split(',')[1];

    $.ajax({
      url: 'https://api.imgur.com/3/image',
      type: 'post',
      headers: {
        Authorization: 'Client-ID 3477476ed556a0b'
      },
      data: {
        image: img
      },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          var url = 'http://imgur.com/' + response.data.id;
          self.setState({ imgurURL: url });
          window.location = url;
        }
      }
    });
  },
  render: function() {
    var class_name = 'btn btn-default';
    if (!this.props.data.ready) {
      class_name += ' disabled';
    }

    if (!this.props.instructions) {
      return null;
    }

    return (
      <div className="toolbar-section">
        <div className="toolbar-label">Result</div>
        <div className="toolbar-content">
          <div className="btn-toolbar">
            <div className="btn-group">
              <button type="button" className="btn btn-primary btn-lg" onClick={this.scrollToInstructions}>
                Build
              </button>
            </div>
            <div className="btn-group">
              <a type="button" className="btn btn-custom btn-lg" onClick={this.saveImage} download="bricks.png">
                Save
              </a>
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-custom btn-lg" onClick={this.uploadImage} title="Upload to Imgur to share with others">
                Share
              </button>
            </div>
          </div>
        </div>
        <div className="toolbar-footer">
            Design requires <strong>{this.props.instructions.brickCounts.total}</strong> bricks
        </div>
      </div>
    );
  }
});

module.exports = Instruction;