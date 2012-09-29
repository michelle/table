var express = require('express');
var fs = require('fs');
var app =  express.createServer();
var util = require('./util.js');
var db = util.db

// Initialize main server
app.use(express.bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// homepage will display a random map.
app.get('/', function(req, res){
  res.render('index');
});

// create on frontend, corresponding to name
app.get('/initmap/:name', function(req, res) {
  res.render('add');
});

// post a json of the coordinates to draw later.
app.post('/initmap/:name', function(req, res) {
  db.collection('maps').insert({
    'name': req.params.name,
    'secret': req.body.secret,
    'data': req.body.data
  }, function(err, doc) {
    console.log(doc);
    res.redirect('/map/' + req.params.name);
  });
});

// view a map.
app.get('/map/:name', function(req, res) {
  db.collection('maps').findOne(
    { 'name': req.params.name },
    function(err, doc) {
      if (!err) {
        res.render('map', { map: doc[0].data });
      }
    }
  );
});

// add a node.
// use fb authentication eventually.
app.get('/topsecretedit/:name', function(req, res) {
  db.collection('maps').findOne(
    { 'name': req.params.name },
    function(err, doc) {
      if (!err) {
        res.render('edit', { map: doc[0].data });
      }
    }
  );
});

// saves added node.
app.post('/topsecretedit/:name', function(req, res) {
  db.collection('maps').findAndModify(
    { 'name': req.params.name, 'secret': req.body.secret },
    { 'data': req.body.data },
    function(err, doc) {
      console.log(err, doc);
      res.redirect('/map/' + req.params.name);
    });
});


app.listen(8000);
