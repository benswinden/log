
var editing = false;
var editNumber = 0;
var currentNumEntries = 12;  // Save this to a cookie

$(document).ready(function(){

    projects();

    // Get the current date
    var currentDate = new Date();
    var dd = currentDate.getDate();
    var mm = currentDate.getMonth()+1; //January is 0!
    var yyyy = currentDate.getFullYear();

    if(dd < 10 ) {
        dd = '0' + dd;
    }

    if(mm < 10) {
        mm = '0' + mm;
    }

    currentDate = yyyy + '.' + mm + '.' + dd;

    $('#date').val(currentDate);

    //Populate the display table with a certain number of the latest entries
    //retrieveEntries(currentNumEntries);

    // Check for a change to the number of entries
    $('#numEntriesSubmit').click(function() {
        currentNumEntries = $('#numEntries').val();
        retrieveEntries(currentNumEntries);
    });

    // Click the remove button
    $('#remove').click(function() {
        if (editing) {
            $.post("/remove",{entryid: editNumber}, function(data){

                // Callback
                if( data === 'complete') {

                    window.location.href = '/';
                }
            });
        }
    });

    // Focus lost from PROJECT entry, auto fill the tags
    $('#project').focusout(function() {
        if (!editing)
            fillTags($("#project").val());
    });


    // On submit entry
    $("#form").submit( function(event ) {

        if (!editing)
            postEntry();
        else
            updateEntry();

        event.preventDefault();
    });

    if (!editing)
        $('#editlabel').css('display', 'none');
});

// Query the database all projects for autocomplete and initialize the projects field
function projects() {


    $.post("/projects", function(data){

        if( data != null) {

            $( "#project" ).autocomplete({
                source: data.projects
            });

            $('#tags').tagThis({
                autocompleteSource : data.tag,
                defaultText : ''
            });

            $("#form").css("display", "block");
        }
    });
}

function postEntry() {

    var date = "'" +  $("#date").val() + "'";
    var starttime = "'" + $("#starttime").val() + "'";
    var endtime = "'" + $("#endtime").val() + "'";
    var project = "'" + $("#project").val().replace("'", "''") + "'";
    var notes = "'" + $("#notes").val().replace("'", "''") + "'";
    var tags = "";

    // Get tags
    var tagsArray = $('#tags').data('tags');

    if (tagsArray) {
        for (var i = 0; i < tagsArray.length; i++) {

            if (i == 0)
                tags += tagsArray[i].text;
            else
                tags += "," + tagsArray[i].text;
        }
    }

    tags = "'" + tags + "'";

    $.post("/entry",{date: date,starttime: starttime,endtime: endtime,project: project,notes: notes,tags: tags}, function(data){

        // Callback
        if( data === 'complete') {

            window.location.href = '/';
        }
    });

}


function beginEdit(rowelement) {

    editing = true;
    editNumber = rowelement.children('.table-id').html();

    $('#tags').clearAllTags();

    $('#editlabel').css('display', 'block');
    $('#editlabel').html('* editing : ' + editNumber + ' *');

    // Enter values into form
    $("#date").val( rowelement.children('.table-date').html());
    $("#starttime").val( rowelement.children('.table-start').html());
    $("#endtime").val( rowelement.children('.table-end').html());
    $("#project").val( rowelement.children('.table-project').html());
    $("#notes").val( rowelement.children('.table-notes').html());

    var tagArray = rowelement.children('.table-tags').html().split(',');

    for (var i = 0; i < tagArray.length; i++) {

        $('#tags').addTag(tagArray[i]);
    }
}

function updateEntry() {

    var date = "'" +  $("#date").val() + "'";
    var starttime = "'" + $("#starttime").val() + "'";
    var endtime = "'" + $("#endtime").val() + "'";
    var project = "'" + $("#project").val().replace("'", "''") + "'";
    var notes = "'" + $("#notes").val().replace("'", "''") + "'";
    var tags = "";

    // Get tags
    var tagsArray = $('#tags').data('tags');

    if (tagsArray) {
        for (var i = 0; i < tagsArray.length; i++) {

            if (i == 0)
                tags += tagsArray[i].text;
            else
                tags += "," + tagsArray[i].text;
        }
    }

    tags = "'" + tags + "'";

    $.post("/update",{entryid: "'" + editNumber + "'", date: date,starttime: starttime,endtime: endtime,project: project,notes: notes,tags: tags}, function(data){

        // Callback
        if( data === 'complete') {

            window.location.href = '/';
        }
    });
}

// Get tags and populate the tag section
function fillTags(project) {

    $.post("/retrievetags",{project: project}, function(data){

        // Callback
        if( data != null) {

            var tagArray = data.split(',');

            for (var i = 0; i < tagArray.length; i++) {

                $('#tags').addTag(tagArray[i]);
            }

            $('#notes').focus();
        }
    });
}

// Retrieve tables rows already html formated to enter into the display tables
function retrieveEntries(amount) {

    $.post("/retrieve",{amount : amount}, function(data){

        // Callback
        if( data != null) {

            $("#table-body").html(data);

            $('.table-row').click(function() {

                var rowelement = $(this);
                beginEdit(rowelement);
            });
        }
    });
}
