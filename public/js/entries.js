$(document).ready(function(){

    $('#numEntries')
        .focusout(function() {

            var amount = $('#numEntries').val();
            retrieveEntries(amount);
        });

    retrieveEntries(3);

    $('numEntriesSubmit').click(function() {
        var amount = $('#numEntries').val();
        retrieveEntries(amount);
    });
});

function retrieveEntries(amount) {

    $.post("/retrieve",{amount : amount}, function(data){

        // Callback
        if( data != null) {

            $("#table-body").html(data);
        }
    });
}
