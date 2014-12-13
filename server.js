require('strong-agent');
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'AKIAITKO2CTUN6WMLYJQ', secretAccessKey: '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'});
var s3 = new AWS.S3();

var http = require('http');
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

s3.listObjects({Bucket : 'sweater-designer'}, function(err, data) {
  console.log(err, data);
})

s3.getObject({Bucket: 'sweater-designer', Key: 'holiday1.png'}, function (err, data) {
	console.log(err, data);
});


//app.post('/image-upload', function (req, res) {
//   s3.uploadImage(req.body, function (newImageUrl`) {
//     res.send(newImageUrl);
//   });
//});

app.get('/secured/ping', function(req, res) {
  res.send(200, {text: "All good. You only get this message if you're authenticated"});
});

var port = process.env.PORT || 3001;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});
