
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

    // On submit
    $("#form").submit( function(event ) {
        postEntry();
        event.preventDefault();
    });
});

// Query the database all projects for autocomplete and initialize the projects field
function projects() {


    $.post("/projects", function(data){

        if( data != null) {

            console.log(data.tag);

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
    var project = "'" + $("#project").val() + "'";
    var category = "'" + $("#category").val() + "'";
    var tags = "'" + $("#tags").val() + "'";
    var effectiveness = "'" + $("#effectiveness").val() + "'";
    var notes = "'" + $("#notes").val() + "'";

    // Get tags
    var tags = "'" + $('#tags').data('tags') + "'";

    alert(tags);

    $.post("/entry",{date: date,starttime: starttime,endtime: endtime,project: project,category: category,tags: tags,effectiveness: effectiveness,notes: notes}, function(data){

        // Callback
        if( data === 'complete') {

            // Clear the form
            $("#date").val("");
            $("#starttime").val("");
            $("#endtime").val("");
            $("#project").val("");
            $("#category").val("");
            $("#tags").val("");
            $("#effectiveness").val("");
            $("#notes").val("");
        }
    });

}
