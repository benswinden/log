
$(document).ready(function(){

    $("#form").submit( function(event ) {
        postEntry();
        event.preventDefault();
    });
});

function postEntry() {

    var date,starttime,end,project,category,subcategory,tags,effect,notes;

    date = $("#date").val();
    starttime = $("#start").val();

    $.post("http://localhost:6001/entry",{date: date,starttime: starttime}, function(data){

        if( data === 'yes') {
            //alert("login success");
        }
    });

}
