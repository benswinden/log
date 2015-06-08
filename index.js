var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var sqlite3 = require("sqlite3").verbose();

var app = express();

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

    var date = req.body.date;
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var project = req.body.project;
    var category = req.body.category;

    var tags = req.body.tags;
    var effectiveness = req.body.effectiveness;
    var notes = req.body.notes;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);



    db.serialize(function() {

        var stmt = "INSERT INTO entries ('date','start-time','end-time','project','category','tags','effectiveness','notes') VALUES (" + date + "," + starttime + ","+ endtime +","+ project +","+ category +","+ tags +","+ effectiveness +","+ notes +") ";

        db.run(stmt);
    });

    db.close();

    res.end("complete");
});

var server = app.listen(6001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Timer listening at http://%s:%s', host, port);

});
