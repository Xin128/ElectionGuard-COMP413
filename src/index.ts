
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
// } from "../../simple_elections";

// import {
//   context_and_ballots,
//   context_and_arbitrary_ballots,
//   getRandomNumberInclusive,
// } from "../../simpleElectionsUtil";

import {get_optional} from "./utils";

import {
  // AnyElectionContext,
  PlaintextSelection,
  PrivateElectionContext,
  // PlaintextBallot,
  // CiphertextSelection,
  // CiphertextBallot,
  // PlaintextBallotWithProofs,
} from "./simple_election_data";
import { elements_mod_q_no_zero,elements_mod_q } from "./groupUtils";
import { 
  ElGamalKeyPair, 
  elgamal_keypair_from_secret } from "./elgamal";

import { ElementModQ, ONE_MOD_Q, TWO_MOD_Q } from "./group";



get_optional(document.getElementById("myBtn")).addEventListener("click", function () {
  console.log('click');
  // eslint-disable-next-line prefer-const
  const num_candidates = 5;
  const names = ['James Miller', 'Liam Garcia','Olivia Brown','Charlotte Li', 'Ava Nguyen'];
  const e:ElementModQ = elements_mod_q_no_zero();
  const keypair:ElGamalKeyPair = get_optional(elgamal_keypair_from_secret(e.notEqual(ONE_MOD_Q) ? e : TWO_MOD_Q));
  const base_hash:ElementModQ = elements_mod_q();
  const context = new PrivateElectionContext('firstTest', names, keypair, base_hash);
  let selections:PlaintextSelection[] = [];

  for (let i = 0; i < num_candidates; i++) {
    selections = [...selections, new PlaintextSelection(context.names[i], 0)];
  } 
  const seed_nonce:ElementModQ = elements_mod_q_no_zero();
  console.log('selections', names);
  console.log('selections', selections);
  console.log('seed nonce', seed_nonce);
  get_optional(document.getElementById("output")).innerHTML =
    "4E88B37B6887A8AD04885850A9E3F33A267E8907F16446506B3566F2B1177819";
});
