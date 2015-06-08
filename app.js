var express = require('express');
var exphbs  = require('express-handlebars');
var sqlite3 = require("sqlite3").verbose();

var app = express();

  // Database
var fs = require("fs");
var file = "data/data.db";
var exists = fs.existsSync(file);

if(!exists) {
console.log("Creating DB file.");
fs.openSync(file, "w");
}

var db = new sqlite3.Database(file);

db.serialize(function() {
    if(!exists) {

        var query = "CREATE TABLE entries
                  ( entry_id number(10),
                    date DATETIME NOT NULL DEFAULT,
                    start_time 
                  )"

        db.run(query);
    }


// Handlebars-express instance
var hbs = exphbs.create({

    helpers: {
        getEntries : function() {

            var posts = [];
            db.serialize(function() {
                db.each("SELECT * FROM entries", function(err, row) {
                    posts.push({title: row.post_title, date: row.post_date, text: row.post_text})
            }
        }
    }
});


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
    res.render('home');
});

var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");

//Insert random data
var rnd;
for (var i = 0; i < 10; i++) {
  rnd = Math.floor(Math.random() * 10000000);
  stmt.run("Thing #" + rnd);
}

stmt.finalize();
db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
  console.log(row.id + ": " + row.thing);
});
});


var server = app.listen(6001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Timer listening at http://%s:%s', host, port);

});
