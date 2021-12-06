import {get_optional} from "./utils";
import {encryptBallot, getQRCode, buildBallot, buildManifest, encryptBallot_ballotOut} from "./API/APIUtils";
import { ErrorBallotInput } from "./API/typical_ballot_data";
// import encryptedBallot from "./encrypted_result_hex.json";
import * as ballot from './DemoBallot/demo_ballot_schema.json'
import * as manifest from './DemoBallot/election_manifest_simple.json'
import {CiphertextBallot} from "./simple_election_data";
import {serialize_compatible_CiphertextBallot} from "./serialization_browser";

export function download(content:any, fileName:string, contentType:string) {
  const a = document.createElement("a");
  const file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


// function downloadJson(exportName: string){
//   const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
//     JSON.stringify(encryptedBallot, null, '\t'));
//   const downloadAnchorNode = document.createElement('a');
//   downloadAnchorNode.setAttribute("href",     dataStr);
//   downloadAnchorNode.setAttribute("download", exportName + ".json");
//   document.body.appendChild(downloadAnchorNode); // required for firefox
//   downloadAnchorNode.click();
//   downloadAnchorNode.remove();
// }




function submitCiphertextBallot(voterId: string, encryptedBallot: CiphertextBallot){
  fetch("https://f069-168-5-58-228.ngrok.io" + "/receive/" +voterId, {
    method: "POST",
    mode: "no-cors",
    headers: {'Content-Type': 'application/json'},

    body: serialize_compatible_CiphertextBallot(get_optional(encryptedBallot))
  }).then(res => {
    console.log("Request complete! response:", res);
  });
}

// function submitManifest(voterId: string, manifest: Manifest){
//   fetch("https://6f14-168-5-135-5.ngrok.io" + "/receive/" +voterId, {
//     method: "POST",
//     mode: "no-cors",
//     headers: {'Content-Type': 'application/json'},
//
//     body: encrypt_compatible_testing_demo(get_optional(encryptedBallot))
//   }).then(res => {
//     console.log("Request complete! response:", res);
//   });
// }


get_optional(document.getElementById("prev2")).addEventListener("click", function () {
  get_optional(document.getElementById("step_1")).className = "step current";
  get_optional(document.getElementById("step_2")).className = "step";
  get_optional(document.getElementById("screen_1")).style.display = "contents";
  get_optional(document.getElementById("screen_2")).style.display = "none";
});

get_optional(document.getElementById("prev3")).addEventListener("click", function () {
  get_optional(document.getElementById("step_2")).className = "step current";
  get_optional(document.getElementById("step_3")).className = "step";
  document.querySelectorAll('input[name="choice"]').forEach((elem) => {
    elem.removeAttribute("disabled");
  });
  document.querySelectorAll('input[name="secondary"]').forEach((elem) => {
    elem.removeAttribute("disabled");
  });
  document.querySelectorAll('input[name="tertiary"]').forEach((elem) => {
    elem.removeAttribute("disabled");
  });
  document.querySelectorAll('input[name="quaternary"]').forEach((elem) => {
    elem.removeAttribute("disabled");
  });
  document.querySelectorAll('input[name="writein"]').forEach((elem) => {
    elem.removeAttribute("disabled");
  });
  get_optional(document.getElementById("review-btn")).style.display = "block";
  get_optional(document.getElementById("submit-btn")).style.display = "none";
  get_optional(document.getElementById("previous2")).style.display = "block";
  get_optional(document.getElementById("previous3")).style.display = "none";
});
document.querySelectorAll('input[name="choice"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
    document.querySelectorAll('input[name="secondary"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
    document.querySelectorAll('input[name="tertiary"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
    document.querySelectorAll('input[name="quaternary"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
    document.querySelectorAll('input[name="writein"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
get_optional(document.getElementById("next1")).addEventListener("click", function () {
  get_optional(document.getElementById("step_1")).className = "step done";
  get_optional(document.getElementById("step_2")).className = "step current";
  get_optional(document.getElementById("screen_1")).style.display = "none";
  get_optional(document.getElementById("screen_2")).style.display = "contents";
  if(document.querySelector('input[name="choice"]')){
    document.querySelectorAll('input[name="choice"]').forEach((elem) => {
        elem.addEventListener("click", function(){
          get_optional(document.getElementById("review-btn")).style.display = "block";
        });
    });
  }
});

get_optional(document.getElementById("next2")).addEventListener("click", function () {
  if(document.querySelector('input[name="choice"]')){
    const question1 = document.querySelectorAll('input[name="choice"]')
    for (let i = 0; i < ballot.ballotItems[0].ballotOptions.length; i++) {
      ballot.ballotItems[0].ballotOptions[i].selected = question1[i].checked;
    }
  }
  if(document.querySelector('input[name="secondary"]')){
    const question2 = document.querySelectorAll('input[name="secondary"]')
    for (let i = 0; i < ballot.ballotItems[1].ballotOptions.length; i++) {
      ballot.ballotItems[1].ballotOptions[i].selected = question2[i].checked;
    }
  }
  if(document.querySelector('input[name="tertiary"]')){
    const question3 = document.querySelectorAll('input[name="tertiary"]')
    for (let i = 0; i < ballot.ballotItems[2].ballotOptions.length; i++) {
      ballot.ballotItems[2].ballotOptions[i].selected = question3[i].checked;
    }
  }
  if(document.querySelector('input[name="quaternary"]')){
    const question4 = document.querySelectorAll('input[name="quaternary"]')
    for (let i = 0; i < ballot.ballotItems[3].ballotOptions.length; i++) {
      ballot.ballotItems[3].ballotOptions[i].selected = question4[i].checked;
    }
  }

  // console.log(JSON.stringify(ballot, null, "\t"), 'ballot.json', 'text/plain')
  document.querySelectorAll('input[name="choice"]').forEach((elem) => {
    elem.disabled = true;
  });
  document.querySelectorAll('input[name="secondary"]').forEach((elem) => {
    elem.disabled = true;
  });
  document.querySelectorAll('input[name="tertiary"]').forEach((elem) => {
    elem.disabled = true;
  });
  document.querySelectorAll('input[name="quaternary"]').forEach((elem) => {
    elem.disabled = true;
  });
  document.querySelectorAll('input[name="writein"]').forEach((elem) => {
    elem.disabled = true;
  });

  get_optional(document.getElementById("step_2")).className = "step done";
  get_optional(document.getElementById("step_3")).className = "step current";
  get_optional(document.getElementById("review-btn")).style.display = "none";
  get_optional(document.getElementById("submit-btn")).style.display = "block";
  get_optional(document.getElementById("previous2")).style.display = "none";
  get_optional(document.getElementById("previous3")).style.display = "block";
});


get_optional(document.getElementById("next3")).addEventListener("click", function () {
  // console.log('buildBallot');
  const realBallot = buildBallot(ballot);
  // console.log('buildManifest');
  const realManifest = buildManifest(manifest);
  const json_plain_ballot : string = JSON.stringify(realBallot, null, "\t");
  const json_manifest : string = JSON.stringify(realManifest, null, "\t");

  // console.log(json_manifest)
  // console.log(json_plain_ballot)
  download(json_manifest, 'manifest.json', 'text/plain');
  download(json_plain_ballot,  'plaintextballot.json', 'text/plain');

  // console.log(realBallot)
  console.log(realManifest)

  // const fakeBallot = buildFakeBallot();
  const result = encryptBallot(realBallot, realManifest);
  
  console.log("json plain ballot")
  console.log(json_plain_ballot);
  console.log("encryptBallot here!")
  console.log(result);
  if (result instanceof ErrorBallotInput) {
    console.log("error input!")
    return;
  }
  get_optional(document.getElementById("output")).innerHTML = result.hash;
  get_optional(document.getElementById("seed_nonce")).innerHTML = result.seed;
  get_optional(document.getElementById("qrcodeOutput")).replaceChildren(getQRCode(["Encryption Output: "+result.hash , "Encryption Seed: "+result.seed]));
  get_optional(document.getElementById("step_3")).className = "step done";
  get_optional(document.getElementById("step_4")).className = "step current";
  get_optional(document.getElementById("screen_2")).style.display = "none";
  get_optional(document.getElementById("screen_4")).style.display = "contents";

  const voterId = Math.floor(Math.random() * 100).toString();
  console.log("Generated random voterID: " + voterId);
  const encryptedballot = encryptBallot_ballotOut(realBallot, realManifest);
  console.log("encryptedballot");
  console.log(encryptedballot);
  submitCiphertextBallot(voterId, encryptedballot);


});

