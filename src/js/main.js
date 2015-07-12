"use strict";
/* jshint globalstrict: true */

/* global $, require, React */

var Toolbar = require('./toolbar');
var Diagram = require('./diagram');

$(document).ready(function() {
  var thumbnails = [
    { src: "img/thirdparty/starry-night.jpg", title: "The Starry Night" },
    { src: "img/thirdparty/kanagawa.jpg", title: "The Great Wave off Kanagawa", colors: [1, 5, 23, 24, 26, 194, 199] },
    { src: "img/thirdparty/carpet.jpg", title: "Ukrainian carpet" },
    { src: "img/thirdparty/lenna.jpg", title: "Lenna" },
    { src: "img/thirdparty/lego.png", title: "LEGO", colors: [1, 21, 24, 26, 199] },
    { src: "img/thirdparty/stanford.png", title: "Stanford", colors: [1, 21, 28] },
    { src: "img/thirdparty/firefox.jpg", title: "Firefox", colors: [1, 21, 23, 24, 26, 106, 192] }
  ];

  $('#about-link').on('click', function(event) {
    $(document.body).animate({
      scrollTop: $('#about').offset().top
    }, 400);
    event.preventDefault();
  });

  $('#back-link').on('click', function(event) {
    $(document.body).animate({
      scrollTop: $('#header').offset().top
    }, 400);
    event.preventDefault();
  });

  var diagram = React.render(
    <Diagram />,
    document.getElementById('diagram')
  );

  var img = $('.bricker-original');
  img.one('load', function() {
    React.render(
      <Toolbar colorsURL="csv/lego.csv" image={img} initialThumbnails={thumbnails} diagram={diagram} />,
      document.getElementById('toolbar')
    );
  });
});