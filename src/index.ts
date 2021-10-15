
// import {
//   encrypt_ballot, 
//   decrypt_ballot,
//   validate_encrypted_ballot,
//   validate_decrypted_ballot,
//   encrypt_ballots,
//   tally_encrypted_ballots,
//   validate_tallies,
//   decrypt_tallies,
//   tally_plaintext_ballots,
// } from "./simple_elections";

// import {
//   context_and_ballots,
//   context_and_arbitrary_ballots,
//   getRandomNumberInclusive,
// } from "../../simpleElectionsUtil";

import {get_optional} from "./utils";

// import {
//   AnyElectionContext,
//   PlaintextSelection,
//   PrivateElectionContext,
//   PlaintextBallot,
//   CiphertextSelection,
//   CiphertextBallot,
//   PlaintextBallotWithProofs,
// } from "./simple_election_data";
// import { elements_mod_q_no_zero,elements_mod_q } from "./groupUtils";
// import { elements_mod_q_no_zero } from "./groupUtils";
// import { 
//   ElGamalKeyPair, 
//   elgamal_keypair_from_secret } from "./elgamal";
// import { add_q, ElementModQ } from "./group";
// import { ElementModQ, ONE_MOD_Q, TWO_MOD_Q } from "./group";
import { Ballot, BallotItem, BallotOption, LanguageText } from "./API/typical_ballot_data";
import { ballot2Context, ballot2JSON, ballot2PlainTextBallots } from "./API/APIUtils";



// get_optional(document.getElementById("myBtn")).addEventListener("click", function () {
//   console.log('click');
//   // eslint-disable-next-line prefer-const
//   const num_candidates = 5;
//   const names = ['James Miller', 'Liam Garcia','Olivia Brown','Charlotte Li', 'Ava Nguyen'];
//   const e:ElementModQ = elements_mod_q_no_zero();
//   const keypair:ElGamalKeyPair = get_optional(elgamal_keypair_from_secret(e.notEqual(ONE_MOD_Q) ? e : TWO_MOD_Q));
//   const base_hash:ElementModQ = elements_mod_q();
//   const context = new PrivateElectionContext('firstTest', names, keypair, base_hash);
//   let selections:PlaintextSelection[] = [];

//   for (let i = 0; i < num_candidates; i++) {
//     selections = [...selections, new PlaintextSelection(context.names[i], 0)];
//   } 
//   const ballot_id = "001";
//   const ballot:PlaintextBallot = new PlaintextBallot(ballot_id, selections)
//   const seed_nonce:ElementModQ = elements_mod_q_no_zero();
//   const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(context, ballot, seed_nonce));

//   console.log('selections', names);
//   console.log('selections', selections);
//   console.log('seed nonce', seed_nonce);
//   console.log("encrypted ballot selections:", encrypted_ballot.selections);
//   console.log("encrypted ballot proof:", encrypted_ballot.valid_sum_proof);
//   get_optional(document.getElementById("output")).innerHTML =
//     encrypted_ballot.valid_sum_proof.data.elem.toString();
//   get_optional(document.getElementById("seed_nonce")).innerHTML =
//     seed_nonce.elem.toString();
// });

get_optional(document.getElementById("myBtn")).addEventListener("click", function () {
  console.log('click');
  // eslint-disable-next-line prefer-const
  // const num_candidates = 10;
  const names = ['James Miller', 'Liam Garcia','Olivia Brown','Charlotte Li', 'Ava Nguyen', 'Mizu Sawa', 'Park Shu', 'Van Darkholme', 'Wang Jo Jo', 'Ted Budd'];
  
  // build a ballot
  let electionBallot = new Ballot();
  electionBallot.id = "001";
  let txt = new LanguageText();
  txt.text = "firstTest";
  electionBallot.electionName = [txt];
  electionBallot.partyName = [];
  electionBallot.ballotItems = [];

  // build a fake ballot item
  let ballot1 = new BallotItem();
  let ballot2 = new BallotItem();
  ballot1.ballotOptions = [];
  ballot2.ballotOptions = [];
  names.forEach((name, idx) => {
    if (idx < names.length / 2) {
      let ballotOption = new BallotOption();
      ballotOption.writeInSelection = name;
      console.log("ballot1 ballotoptions ", ballot1.ballotOptions);
      ballot1.ballotOptions = [...ballot1.ballotOptions, ballotOption];
    } else {
      let ballotOption = new BallotOption();
      ballotOption.writeInSelection = name;
      ballot2.ballotOptions = [...ballot2.ballotOptions, ballotOption];
    }
    // add candidate name to electionBallot
    let langTxt = new LanguageText();
    langTxt.text = name;
    electionBallot.partyName = [...electionBallot.partyName, langTxt];
  });
  ballot1.ballotOptions[0].selected = true;
  ballot2.ballotOptions[0].selected = true;
  // add ballotItem to electionBallot
  electionBallot.ballotItems = [...electionBallot.ballotItems, ballot1, ballot2];
  
  // convert Ballot to a list of plaintextballot and extract the context of the election
  const ballots = ballot2PlainTextBallots(electionBallot);
  const context = ballot2Context(electionBallot); 
  const jsonObj = ballot2JSON(ballots, context);

  // const seed_nonce:ElementModQ = elements_mod_q_no_zero();
  // const encrypted_ballots: CiphertextBallot[] = get_optional(encrypt_ballots(context, ballots, seed_nonce));
  // let final_hash = new ElementModQ(0n);
  // encrypted_ballots.forEach(eBallot => {
  //   final_hash = add_q(final_hash, eBallot.crypto_hash_with(seed_nonce));
  // });

  console.log('selections', names);
  // console.log('selections', selections);
  // console.log('seed nonce', seed_nonce);
  // console.log("encrypted ballot selections:", encrypted_ballot.selections);
  // console.log('hash result of encrypted ballot', encrypted_ballot.crypto_hash_with(seed_nonce).toString());
  // get_optional(document.getElementById("output")).innerHTML =
  //   final_hash.elem.toString();
  // get_optional(document.getElementById("seed_nonce")).innerHTML =
  //   seed_nonce.elem.toString();
  get_optional(document.getElementById("output")).innerHTML =
    jsonObj.hash;
  get_optional(document.getElementById("seed_nonce")).innerHTML =
    jsonObj.seed;
});
