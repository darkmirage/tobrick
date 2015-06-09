"use strict";
/* jshint globalstrict: true */

/* global $, require, React */

var App = require('./app');

$(document).ready(function() {
  var thumbnails = [
    { src: "img/thirdparty/starry-night.jpg", title: "The Starry Night" },
    { src: "img/thirdparty/kanagawa.jpg", title: "The Great Wave off Kanagawa", colors: [1, 5, 23, 24, 26, 194, 199] },
    { src: "img/thirdparty/carpet.jpg", title: "Ukrainian carpet" },
    { src: "img/thirdparty/lenna.png", title: "Lenna" },
    { src: "img/thirdparty/lego.png", title: "LEGO", colors: [1, 21, 24, 26, 199] },
    { src: "img/thirdparty/stanford.png", title: "Stanford", colors: [1, 21, 28] },
    { src: "img/thirdparty/firefox.jpg", title: "Firefox", colors: [1, 21, 23, 24, 26, 106, 192] }
  ];

  var img = $('.bricker-original');
  img.one('load', function() {
    React.render(
      <App colorsURL="csv/lego.csv" image={img} thumbnails={thumbnails} />,
      document.getElementById('toolbar')
    );
  });
});