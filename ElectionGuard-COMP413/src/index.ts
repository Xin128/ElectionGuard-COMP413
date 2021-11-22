<<<<<<< HEAD
import {get_optional} from "./utils";
import {encryptBallot, getQRCode, buildBallot, buildManifest} from "./API/APIUtils";
import { ErrorBallotInput } from "./API/typical_ballot_data";
import encryptedBallot from "./encrypted_result_hex.json";
import * as ballot from './AaronBallot/super_complex_ballot.json';

function downloadJson(exportName: string){
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
    JSON.stringify(encryptedBallot, null, '\t'));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

get_optional(document.getElementById("prev2")).addEventListener("click", function () {
  get_optional(document.getElementById("step_1")).className = "step current";
  get_optional(document.getElementById("step_2")).className = "step";
  get_optional(document.getElementById("screen_1")).style.display = "contents";
  get_optional(document.getElementById("screen_2")).style.display = "none";
});

get_optional(document.getElementById("prev3")).addEventListener("click", function () {
  get_optional(document.getElementById("step_2")).className = "step current";
  get_optional(document.getElementById("step_3")).className = "step";
  if(document.querySelector('input[name="choice"]')){
    document.querySelectorAll('input[name="choice"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
  }
  if(document.querySelector('input[name="secondary"]')){
    document.querySelectorAll('input[name="secondary"]').forEach((elem) => {
      elem.removeAttribute("disabled");
    });
  }
  get_optional(document.getElementById("review-btn")).style.display = "block";
  get_optional(document.getElementById("submit-btn")).style.display = "none";
  get_optional(document.getElementById("previous2")).style.display = "block";
  get_optional(document.getElementById("previous3")).style.display = "none";
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
    document.querySelectorAll('input[name="choice"]').forEach((elem) => {
      elem.setAttribute('disabled', "true");
    });
  }
  if(document.querySelector('input[name="secondary"]')){
    document.querySelectorAll('input[name="secondary"]').forEach((elem) => {
      elem.setAttribute('disabled', "true");
    });
  }
  get_optional(document.getElementById("step_2")).className = "step done";
  get_optional(document.getElementById("step_3")).className = "step current";
  get_optional(document.getElementById("review-btn")).style.display = "none";
  get_optional(document.getElementById("submit-btn")).style.display = "block";
  get_optional(document.getElementById("previous2")).style.display = "none";
  get_optional(document.getElementById("previous3")).style.display = "block";
});


get_optional(document.getElementById("next3")).addEventListener("click", function () {
  console.log('buildBallot');
  const realBallot = buildBallot(ballot);
  console.log('buildManifest');
  const realManifest = buildManifest(ballot);
  console.log(realBallot)
  console.log(realManifest)
  // const fakeBallot = buildFakeBallot();
  const result = encryptBallot(realBallot, realManifest);
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
  alert("Downloading Encrypted Ballot! qwq");
  //Download an encrypted ballot json file.
  downloadJson("encrpted_ballot");


});

=======
// TODO for API TEAM: please uncomment and  fix the compatibility errors 

// import {
//   encrypt_ballot,
// //   decrypt_ballot,
// //   validate_encrypted_ballot,
// //   validate_decrypted_ballot,
// //   encrypt_ballots,
// //   tally_encrypted_ballots,
// //   validate_tallies,
// //   decrypt_tallies,
// //   tally_plaintext_ballots,
// } from "./simple_elections";

// // import {
// //   context_and_ballots,
// //   context_and_arbitrary_ballots,
// //   getRandomNumberInclusive,
// // } from "../../simpleElectionsUtil";

// import {get_optional} from "./utils";

// import {
//   // AnyElectionContext,
//   PlaintextBallotSelection,
//   PrivateElectionContext,
//   // PlaintextBallot,
//   // CiphertextBallotSelection,
//   CiphertextBallot,
//   PlaintextBallot,
//   PlaintextBallotContest,
//   // PlaintextBallotWithProofs,
// } from "./simple_election_data";
// import { elements_mod_q_no_zero,elements_mod_q } from "./groupUtils";
// import { 
//   ElGamalKeyPair, 
//   elgamal_keypair_from_secret } from "./elgamal";

// import { ElementModQ, ONE_MOD_Q, TWO_MOD_Q} from "./group";


// get_optional(document.getElementById("myBtn")).addEventListener("click", function () {
//   console.log('click');
  // eslint-disable-next-line prefer-const
  // const num_candidates = 5;
  // const names = ['James Miller', 'Liam Garcia','Olivia Brown','Charlotte Li', 'Ava Nguyen'];
  // const e:ElementModQ = elements_mod_q_no_zero();
  // const keypair:ElGamalKeyPair = get_optional(elgamal_keypair_from_secret(e.notEqual(ONE_MOD_Q) ? e : TWO_MOD_Q));
  // const base_hash:ElementModQ = elements_mod_q();
  // const context = new PrivateElectionContext('firstTest', names, keypair, base_hash);
  // let selections:PlaintextBallotSelection[] = [];

  // for (let i = 0; i < num_candidates; i++) {
  //   selections = [...selections, new PlaintextBallotSelection(context.names[i], 0)];
  // } 
  // const contests = [new PlaintextBallotContest(selections)];
  // const ballot_id = "001";
  // const ballot:PlaintextBallot = new PlaintextBallot(ballot_id, contests)
  // const seed_nonce:ElementModQ = elements_mod_q_no_zero();
  // const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(context, ballot, seed_nonce));

  // console.log('selections', names);
  // console.log('selections', selections);
  // console.log('seed nonce', seed_nonce);
  //   // console.log("encrypted ballot selections:", encrypted_ballot.selections);
  // // console.log("encrypted ballot proof:", encrypted_ballot.valid_sum_proof);
  // get_optional(document.getElementById("output")).innerHTML =
  // encrypted_ballot.crypto_hash_with(seed_nonce).toString();
  // get_optional(document.getElementById("seed_nonce")).innerHTML =
  //   seed_nonce.elem.toString();
// });
>>>>>>> origin/Xin-Yanyu-Pipeline
