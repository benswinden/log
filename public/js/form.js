
$(document).ready(function(){

    init();

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

// Query the database and initialize all elements that use information from it
function init() {


    $.post("/init", function(data){

        if( data != null) {

            $( "#project" ).autocomplete({
                source: data
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
