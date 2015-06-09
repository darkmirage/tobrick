"use strict";
/* jshint globalstrict: true */

/* global module, React */

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

module.exports = Uploader;