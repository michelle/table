var express = require('express');
var fs = require('fs');
var app =  express.createServer();
var util = require('./util.js');
var db = util.db;
DEBUG = true;

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
app.get('/add/:name', function(req, res) {
  if (DEBUG) {
    console.log(req.params.name);
  }
  db.collection('maps').findOne(
    { 'name': req.params.name },
    function(err, doc) {
      if (!doc) {
        res.render('add', { mapname: req.params.name, data: doc });
      } else {
        res.redirect('/');
      }
    }
  );
});

// post a json of the coordinates to draw later.
app.post('/add/:name', function(req, res) {
  console.log(req.body.data);
  db.collection('maps').insert({
    'name': req.params.name,
    'secret': req.body.secret,
    'data': req.body.data,
    'people': []
  }, function(err, doc) {
    console.log(doc);
    res.redirect('/map/' + req.params.name);
  });
});

// view a map.
app.get('/map/:name', function(req, res) {
  if (DEBUG) {
    console.log(req.params.name);
  }
  db.collection('maps').findOne(
    { 'name': req.params.name },
    function(err, doc) {
      if (doc) {
        console.log(doc);
        res.render('map', { mapname: req.params.name, map: doc.data, people: doc.people });
      } else {
        res.redirect('/');
      }
    }
  );
});

/** people node format: { computer: randomgenhash, name: str,
 * contact: { gchat, facebook, email, phone, other }, picture: url, x: num, y: num }
 */
// add a node.
// use fb authentication eventually.
app.get('/edit/:name', function(req, res) {
  if (DEBUG) {
    console.log(req.params.name);
  }
  db.collection('maps').findOne(
    { 'name': req.params.name },
    function(err, doc) {
      if (doc) {
        res.render('edit', { mapname: req.params.name, map: doc.data, people: doc.people });
      }
    }
  );
});

// saves added node.
app.post('/edit/:name', function(req, res) {
  db.collection('maps').findAndModify(
    { 'name': req.params.name, 'secret': req.body.secret },
    {},
    { $set: { 'people': req.body.people } },
    function(err, doc) {
      console.log(err, doc);
      res.redirect('/map/' + req.params.name);
    });
});


app.listen(process.env.PORT || 8000);
