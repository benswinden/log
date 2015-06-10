var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var async = require('async');
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

app.post('/init',function(req,res){

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    var projects = [];

    db.serialize(function() {

        var entryNum;

        db.get("SELECT Count(*) as num FROM entries", function(err, row) {

            entryNum = row.num;
        });

        var index = 0;
        db.each("SELECT * FROM entries", function(err, row) {

            index++;

            var found = false;

            if (projects.length == 0)
                projects[0] = row.project;

            for (var i = 0; i < projects.length; i++) {

                if (projects[i] == row.project) {
                    found = true;
                    break;
                }
            }

            if (!found) {

                projects.push(row.project);
            }

            // Wait until all entries have been read before proceding
            if (index >= entryNum) {

                db.close();
                res.send(projects);
            }
        });
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
