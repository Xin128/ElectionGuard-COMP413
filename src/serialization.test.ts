import {contest_from, create_ballot_hash, encrypt_ballot, encrypt_selection} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo, from_file_to_class, from_file_to_class_manifest, from_file_to_PlaintextBallot, object_log, simple_ballot_json,
  manifest_json, // hex_to_bigint
} from "./serialization";
import { CiphertextBallotSelection, make_ciphertext_ballot, make_ciphertext_election_context, PlaintextBallot } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";
import { hash_elems } from "./hash";

import {InternalManifest} from "./manifest";

describe("TestDeserialization", () => {

  test('testConvertJsonFileToObj', () => {
    // const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    const context = make_ciphertext_election_context(
                  1, 
                  1, 
                  new ElementModP(11621479678980606145n), 
                  new ElementModQ(2),
                  new ElementModQ(9973),//python manifest hash
                  // new ElementModQ(14227), 
                  undefined);
    const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    const inputs = from_file_to_class();
    // const encryption_seed = hash_elems([inputs.manifest_hash, inputs.object_id, inputs.nonce]);
    // console.log("encryption seed!", encryption_seed)
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);

    // TODO: Need to change this !!!!!!!!!!!!!! Now hard coded!!!!!!!
    // context.crypto_extended_base_hash = new ElementModQ(60911n);
    console.log("manifest hash", internal_manifest.manifest_hash);
    console.log("context.crypto_extended_base_hash is ", context.crypto_extended_base_hash);
    
    const encrypted_ballot = encrypt_ballot(plaintextBallot, internal_manifest, context, inputs.code_seed, get_optional(inputs.nonce));
    console.log(encrypt_compatible_testing_demo(get_optional(encrypted_ballot)));
  });

  // test('testConvertJsonFileToPlaintextBallot', () => {
  //   const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
  //   console.log("plaintextBallot is ", object_log(plaintextBallot));
  // });

  // test('testConvertObjToJsonFile', () => {
  //   // hex_to_bigint("7FED");
  //   const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
  //   const JSON_string = encrypt_compatible_testing_demo(get_optional(encryped_ballot));
  //   console.log(JSON_string);
  // })

  test('testConvertManifestJsonFileToObj', () => {
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);
    console.log(JSON.stringify(internal_manifest, null, "\t"));
  });
});
