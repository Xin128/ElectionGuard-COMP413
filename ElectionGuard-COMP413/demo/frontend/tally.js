function readTextFile() {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./tally_output.json", true);
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
    document.getElementById("temp").innerHTML = "";

    Object.keys(data["tally_result"]).forEach((contest, index)=>{
      var styleClass = (index%2 == 0) ? "contestA" : "contestB";
      var head = document.createElement('tr');
      var result = document.createElement('tr');
      var total = 0;
      
      var contestName = document.createElement('td');
      contestName.innerHTML = contest;
      contestName.setAttribute("rowspan","2");
      contestName.setAttribute("class", styleClass);
      head.appendChild(contestName);
      
      var contest_dict = data["tally_result"][contest];
      
      Object.keys(contest_dict).forEach((candidate)=>{
        var candidateName = document.createElement('td');
        candidateName.innerHTML = candidate;
        candidateName.setAttribute("class", styleClass);
        head.appendChild(candidateName);
        
        var candidateCount = document.createElement('td');
        candidateCount.innerHTML = contest_dict[candidate];
        result.appendChild(candidateCount);

        total += parseInt(contest_dict[candidate]);
      });

      var candidateName = document.createElement('td');
      candidateName.innerHTML = "Total";
      candidateName.setAttribute("class", "contestTotal");
      head.appendChild(candidateName);

      var candidateCount = document.createElement('td');
      candidateCount.innerHTML = total;
      result.appendChild(candidateCount);

      document.getElementById("tally_table").appendChild(head);
      document.getElementById("tally_table").appendChild(result);
    });

    data["ballot_hash"].forEach((ballot)=>{
      Object.keys(ballot).forEach((entry)=>{
        var oneLine = document.createElement('tr');
        var id = document.createElement('td');
        var hash = document.createElement('td');
        id.innerHTML = entry;
        hash.innerHTML = BigInt(ballot[entry]).toString();
        oneLine.appendChild(id);
        oneLine.appendChild(hash);
        document.getElementById("hash_table").appendChild(oneLine);
      });
    });

});
