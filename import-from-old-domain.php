<?php
    header("Access-Control-Allow-Origin: *");
?>

<!-- I am wordle.ruinelli.ch: -->
<!-- <p id=inbox></p> -->


<script type="text/javascript">
window.addEventListener('message', function(event) {
//     console.log(event.data)
//     document.getElementById("inbox").innerText = event.data;
    
    var data = JSON.parse(JSON.parse(event.data));
                
    // Write to local storage
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });
    console.log("Imported local storage from file into new domain wordle.ruinelli.ch")
//     alert("Deine Enstellungen und Statistik wurden zur neuen Domain portiert!")

});

</script> 
