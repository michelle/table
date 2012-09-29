var mongo = require('mongoskin');
var db = mongo.db('mongodb://map:hack@alex.mongohq.com:10053/map');

exports.db = db;
