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

app.post('/projects',function(req,res){

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    var dbData = new Object();
    dbData.projects = [];
    dbData.tag = [];

    db.serialize(function() {

        var entryNum;

        db.get("SELECT Count(*) as num FROM entries", function(err, row) {

            entryNum = row.num;
        });

        var index = 0;
        db.each("SELECT * FROM entries", function(err, row) {

            index++;

                // Grab the project and check whether it has been stored already
            if (row.project != '') {

                var found = false;

                if (dbData.projects.length == 0)
                dbData.projects[0] = row.project;

                for (var i = 0; i < dbData.projects.length; i++) {

                    if (dbData.projects[i] == row.project) {
                        found = true;
                        break;
                    }
                }

                if (!found) {

                    dbData.projects.push(row.project);
                }
            }

                // Grab the tag and check whether it has been stored already

            // Split the tag string coming from the database since it contains many tags
            var tagList = row.tags.split(',');

            // Iterate through each tag found in the DB
            for (var tagListIndex = 0; tagListIndex < tagList.length; tagListIndex++) {

                if (tagList[tagListIndex] != '') {

                    var found = false;

                    if (dbData.tag.length == 0)
                    dbData.tag[0] = tagList[tagListIndex];

                    // Check against all tags already found and listed
                    for (var storedTagListIndex = 0; storedTagListIndex < dbData.tag.length; storedTagListIndex++) { 

                        if (dbData.tag[storedTagListIndex] == tagList[tagListIndex]) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        console.log(tagList[tagListIndex]);
                        dbData.tag.push(tagList[tagListIndex]);
                    }
                }
            }

            // Wait until all entries have been read before proceding
            if (index >= entryNum) {

                db.close();
                res.send(dbData);
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
