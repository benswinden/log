
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


    // On submit entry
    $("#form").submit( function(event ) {
        postEntry();
        event.preventDefault();
    });
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

            window.location.href = '/entries';
        }
    });

}
