var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var sqlite3 = require("sqlite3").verbose();

var app = express();

  // Database
var fs = require("fs");
var file = "data/data.db";
var exists = fs.existsSync(file);

if(!exists) {
    console.log("Error : DB file is missing");
}

// Handlebars-express instance
var hbs = exphbs.create({ });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res, next) {
    res.render('home', {

        helpers: {

        }
    });
});

app.post('/entry',function(req,res){

    var user_name = req.body.date;
    var password = req.body.starttime;

    var db = new sqlite3.Database(file);

    db.serialize(function() {

        // var date = db.date();

        db.run("INSERT INTO entries VALUES ('date',5,6,'project','category','sub-category','tags',1,'notes') ");
    });

    db.close();

    console.log("Entry posted.");

    res.end("yes");
});

var server = app.listen(6001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Timer listening at http://%s:%s', host, port);

});
