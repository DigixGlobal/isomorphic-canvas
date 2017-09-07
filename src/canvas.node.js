/* eslint-env node */

var fs = require('fs');
var path = require('path');

var Canvas = require('canvas');
var Image = Canvas.Image;

var imageProvider = null;
/**
 *
 * @param {number} width - px
 * @param {number} height - px
 * @param {string} mode - 'pdf' or 'svg'
 * @return {HTMLCanvasElement}
 */
function canvas(width, height, mode) {
  return new Canvas(width, height, mode);
}

function createImgFromBuffer(buffer) {
  var img = new Image();
  img.src = buffer;
  return img;
}

var base64Str = 'base64,';

function createImgFromBase64(url) {
  var from = url.indexOf(base64Str) + base64Str.length;
  var buf = new Buffer(url.substr(from), 'base64');
  return createImgFromBuffer(buf);
}

/**
 *
 * @param {(String|Buffer)} img - or path, buffer or base64
 * @param {Function} callback
 * @return {Image}
 */
canvas.getImage = function getImage(img, callback) {
  if (Buffer.isBuffer(img)) {
    callback(null, createImgFromBuffer(img));
  } else if (img.substr(0, 5) === 'data:') {
    process.nextTick(function () {
      callback(null, createImgFromBase64(img));
    });
  } else {
    imageProvider.getImage(img, callback);
  }
};

canvas.setImageProvider = function (imgProvider) {
  imageProvider = imgProvider;
};

function FSImageProvider(rootPath) {
  this.root = rootPath;
}

canvas.FSImageProvider = FSImageProvider;

FSImageProvider.prototype.getImage = function getImage(url, callback) {
  var filePath = path.join(this.root, url);
  fs.readFile(filePath, function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    var img = createImgFromBuffer(data);
    callback(null, img);
  });
};

module.exports = canvas;
