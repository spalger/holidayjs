require('strong-agent');
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'AKIAITKO2CTUN6WMLYJQ', secretAccessKey: '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'});
var s3 = new AWS.S3();
var uuid = require('uuid');

var _ = require('lodash');

var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var dotenv = require('dotenv');
var rel = require('path').join.bind(null, __dirname);

dotenv.load();

var authenticate = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

app.configure(function () {
  // Request body parsing middleware should be above methodOverride
  app.use(express.bodyParser());
  app.use(express.urlencoded());
  app.use(express.json());

  app.use('/secured', authenticate);
  app.use(express.static(rel('public')));
  app.use('/bower_components', express.static(rel('bower_components')));

  app.use(app.router);
});


app.get('/ping', function(req, res) {
  res.send(200, {text: "All good. You don't need to be authenticated to call this"});
});

app.get('/get-sweaters', function(req, res) {
  s3.listObjects({Bucket : 'sweater-designer'}, function(err, data) {
    var imageNames = [];
    _.each(data.Contents, function(image) {
      imageNames.push(image.Key);
    });

    console.log(imageNames);

    res.send(200, { images : imageNames });
  });
});


// Write Base64 to File
var data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}


app.post('/image-upload', function (req, res) {
   //s3.putObject(req.body, function (newImageUrl`) {
   //  res.send(newImageUrl);
   //});

  var random = _.random(1, 100000000);
  var body = new Buffer(req.body, 'base64');
  var params = {Bucket: 'sweater-designer', Key: 'myKey-' + uuid.v4() + '.jpg', Body: body,
    ACL:'public-read',
  };

  s3.putObject(params, function(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("Successfully uploaded data to myBucket/myKey");
    }
  });

});

app.get('/secured/ping', function(req, res) {
  res.send(200, {text: "All good. You only get this message if you're authenticated"});
});

var port = process.env.PORT || 3001;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});
