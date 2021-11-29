var data;

function readTextFile() {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./tally.json", true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4) {
        var allText = rawFile.responseText;
        document.getElementById("temp").innerHTML = allText;
      }
    }
    rawFile.send();

}

readTextFile();

document.getElementById("get").addEventListener("click", function() {
    var data = JSON.parse(document.getElementById("temp").innerHTML);
    document.getElementById("temp").innerHTML="";
    for (var contest = 0; contest < 4; contest++){
        var total = 0;
        var postEls = document.getElementsByClassName('contest-'+contest),
        postElsCount = postEls.length;
        for (var i = 0; i < postElsCount; i++) {
            document.getElementById(postEls[i].id).innerHTML = data[postEls[i].id];
            total += parseInt(data[postEls[i].id]);
        }
        document.getElementById("total-"+contest).innerHTML = total;
    }
});
