"use strict";
/* jshint globalstrict: true */

/* global module, React */

var Uploader = React.createClass({
  getInitialState: function() {
    return {
      uploadedFiles: []
    };
  },
  onChange: function(event) {
    var self = this;
    var file = event.target.files[0];

    if (this.state.uploadedFiles.indexOf(file.name) !== -1) {
      console.error("File was already uploaded");
      return;
    }
    this.state.uploadedFiles.push(file.name);

    var reader = new FileReader();
    reader.onloadend = function() {
      self.props.data.handleUploadedImage(reader.result, file.name);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  },
  render: function() {
    return (
      <div className="btn btn-custom btn-file bricker-thumbnail-upload-button" title="Upload your own image">
        Upload<input type="file" onChange={this.onChange}></input>
      </div>
    );
  }
});

module.exports = Uploader;