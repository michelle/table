var secret = require('./secret.js');
var express = require('express');
var app =  express.createServer();

var db = require('mongoskin').db('localhost:27017/table?auto_reconnect=true',
    { safe: true });
var Map = db.collection('maps');

var nodemailer = require('nodemailer');
var email = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: secret.email_username,
      pass: secret.email_password
    }
});


// Initialize main server
app.use(express.bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// TODO: Homepage will display a random map.
app.get('/', function(req, res) {
  res.render('index');
});

// Create a new map. TODO: Must be logged in.
app.get('/create', function(req, res) {
  res.render('create');
});


// Edit MAP. TODO: Check map permissions first. Only one editor at a time.
app.get('/:map/edit', function(req, res) {

});

app.post('/:map/edit', function(req, res) {
  Map.updateById(req.params.map, {

  }, function(err, doc) {
    res.redirect('/' + req.params.id);
  });
});


// Move point on MAP. TODO: Check map permissions first.
app.get('/:map/move', function(req, res) {

});

app.post('/:map/move', function(req, res) {
  Map.updateById(req.params.map, {

  }, function(err, doc) {
    res.redirect('/' + req.params.id);
  });
});


// Delete point on MAP. TODO: Check map permissions first.
app.get('/:map/:point/delete', function(req, res) {

});

app.post('/:map/move', function(req, res) {
  Map.updateById(req.params.map, {

  }, function(err, doc) {
    res.redirect('/' + req.params.id);
  });
});


// Delete MAP. TODO: Creator only.
app.post('/:map/delete', function(req, res) {

});


// Plot a point on MAP. TODO: Check map permissions first.
app.get('/:map/add', function(req, res) {

});

app.post('/:map/add', function(req, res) {
  Map.updateById(req.params.map, {

  }, function(err, doc) {
    res.redirect('/' + req.params.id);
  });
});


// View a map. TODO: Check map permissions first.
app.get('/:map', function(req, res) {
  Map.findById(req.params.map, function(err, doc) {
    if (doc) {
      console.log(doc);
      res.render('map', { mapname: req.params.name, map: doc.data, people: doc.people });
    } else {
      res.redirect('/');
    }
  });
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
