
$(document).ready(function(){

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


    $("#form").submit( function(event ) {
        postEntry();
        event.preventDefault();
    });
});

function postEntry() {

    var date = "'" +  $("#date").val() + "'";
    var starttime = "'" + $("#starttime").val() + "'";
    var endtime = "'" + $("#endtime").val() + "'";
    var project = "'" + $("#project").val() + "'";
    var category = "'" + $("#category").val() + "'";
    var subcategory = "'" + $("#subcategory").val() + "'";
    var tags = "'" + $("#tags").val() + "'";
    var effectiveness = "'" + $("#effectiveness").val() + "'";
    var notes = "'" + $("#notes").val() + "'";

    //alert(document.domain);

    $.post("/entry",{date: date,starttime: starttime,endtime: endtime,project: project,category: category,subcategory: subcategory,tags: tags,effectiveness: effectiveness,notes: notes}, function(data){

        // Callback
        if( data === 'complete') {
            //alert("Complete");
        }
    });

}
