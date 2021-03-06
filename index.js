var basicAuth = require('basic-auth');

var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var async = require('async');
var sqlite3 = require("sqlite3").verbose();

var app = express();

// Handlebars-express instance
var hbs = exphbs.create({ });

// General Variables
verified = false;


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));

// Authentication
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'ben' && user.pass === 'iron') {
    return next();
  } else {
    return unauthorized(res);
  };
};


// Render the login screen by default
app.get('/', auth, function (req, res, next) {

    res.render('form');
});

app.get('/display', function (req, res) {

    res.render('display');
});

// Display entries from database
app.get('/entries', auth, function (req, res, next) {

    res.render('entries');
});

// Retrieve tables rows, format to html
app.post('/retrieve',function(req,res){

    var amount = req.body.amount;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    var entryNum;
    var out;

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    db.serialize(function() {

        // Get the total number of entries in the database
        db.get("SELECT Count(*) as num FROM entries", function(err, row) {

            entryNum = row.num;

            // Check whether the amount given is larger than the total number of entries
            if (amount > entryNum) {
                amount = entryNum;
            }
        });

        var index = 0;

        var query = "SELECT * FROM entries ORDER BY entryid DESC LIMIT " + amount;

        db.each(query, function(err, row) {

            index++;

            if (row.entryid != null) {

                out += "<tr class=\"table-row\">";

                out += "<td class=\"table-id\">" + row.entryid + "</td>";
                out += "<td class=\"table-date\">" + row.date + "</td>";
                out += "<td class=\"table-start\">" + row.starttime + "</td>";
                out += "<td class=\"table-end\">" + row.endtime + "</td>";
                out += "<td class=\"table-project\">" + row.project + "</td>";
                out += "<td class=\"table-notes\">" + row.notes + "</td>";
                out += "<td class=\"table-tags\">" + row.tags + "</td>";

                out += "</tr>";
            }

            // Wait until all entries have been read before proceding
            if (index >= amount) {

                db.close();

                res.end(out);
            }
        });
    });

});

// Retrieve tables rows, without format to html
app.post('/retrievenohtml',function(req,res){

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    var entryNum;
    var out = [];

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    db.serialize(function() {

        // Get the total number of entries in the database
        db.get("SELECT Count(*) as num FROM entries", function(err, row) {

            entryNum = row.num;
        });

        var index = 0;

        var query = "SELECT * FROM entries ORDER BY entryid DESC";

        db.each(query, function(err, row) {

            index++;

            if (row.entryid != null) {

                out.push(row);
            }

            // Wait until all entries have been read before proceding
            if (index >= entryNum) {

                db.close();
                res.send(out);
            }
        });
    });

});


// Find all entries with the same project name as the one we just entered in the form
// Store all tags previously submitted for this project, omitting duplicates
app.post('/retrievetags',function(req,res){

    var project = req.body.project;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    var entryNum;
    var storedTags = [];

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    db.serialize(function() {

        // Get the total number of entries in the database
        db.get("SELECT Count(*) as num FROM entries", function(err, row) {

            entryNum = row.num;
        });

        var numToAdd = 2;   // The number of recent entries to pull tags from
        var indexToAdd = 0; // Keeps track of how many proper entries we've grabbed tags from

        var index = 0;      // Keeps track of total entries we've checked

        db.each("SELECT * FROM entries ORDER BY entryid DESC", function(err, row) {

            index++;

            // Check each row to see if the project corresponds to the one we are submitting in the form
            if (indexToAdd < numToAdd && row != null && row.entryid != null && row.project == project) {

                indexToAdd++;

                // Make an array for each tag in this particular row
                var currentRowTags = row.tags.split(',');

                // For each tag
                for (var i = 0; i < currentRowTags.length; i++) {

                    if (currentRowTags[i] != "") {

                        var found = false;

                        // Check our stored array of tags to see if we already saved this tag
                        for (var j = 0; j < storedTags.length; j++) {
                            if (currentRowTags[i] == storedTags[j]) {
                                found = true;
                                break;
                            }
                        }

                        // if we didn't find this tag, add it to stored list
                        if (!found) {

                            storedTags.push(currentRowTags[i]);
                        }
                    }
                }
            }

            // Wait until we have grabbed the number of entries we want
            if ( index >= entryNum) {

                db.close();

                var out = "";

                for (var j = 0; j < storedTags.length; j++) {

                    if (j == 0)
                        out += storedTags[j];
                    else
                        out += "," + storedTags[j];
                }

                res.end(out);
            }
        });
    });

});

// Get all project names from the database to be used for autocomplete`
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

        // Get the total number of entries in the database
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

// Submit entry to the database
app.post('/entry',function(req,res){

    var date = req.body.date;
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var project = req.body.project;
    var notes = req.body.notes;
    var tags = req.body.tags;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);



    db.serialize(function() {

        var stmt = "INSERT INTO entries ('date','starttime','endtime','project','notes','tags') VALUES (" + date + "," + starttime + ","+ endtime +","+ project +","+ notes +","+ tags +") ";

        db.run(stmt);
    });

    db.close();

    res.end("complete");
});

// Update an entry already in the database
app.post('/update',function(req,res){

    var entryid = req.body.entryid;
    var date = req.body.date;
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var project = req.body.project;
    var notes = req.body.notes;
    var tags = req.body.tags;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);



    db.serialize(function() {

        var stmt = "UPDATE entries SET date = " + date + ", starttime = " + starttime + ", endtime = " + endtime + ", project = " + project + ", notes = " + notes + ", tags = " + tags + " WHERE entryid = "+ entryid;

        db.run(stmt);
    });

    db.close();

    res.end("complete");
});

// Remove an entry from the database
app.post('/remove',function(req,res){

    var entryid = req.body.entryid;

    var fs = require("fs");
    var file = "data/data.db";
    var exists = fs.existsSync(file);

    if(!exists) {
        console.log("Error : DB file is missing");
    }

    var db = new sqlite3.Database(file);

    db.serialize(function() {

        var stmt = "DELETE FROM entries WHERE entryid = "+ entryid;

        db.run(stmt);
    });

    db.close();

    res.end("complete");
});


var server = app.listen(6001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Log listening at http://%s:%s', host, port);

});
