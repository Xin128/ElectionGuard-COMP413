import {encrypt_ballot} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo, from_file_to_class, from_file_to_class_manifest, from_file_to_PlaintextBallot, object_log, simple_ballot_json,
  manifest_json, // hex_to_bigint
} from "./serialization";
import { make_ciphertext_election_context, PlaintextBallot } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";
import { hash_elems } from "./hash";

import {InternalManifest} from "./manifest";

describe("TestDeserialization", () => {

  test('testConvertJsonFileToObj', () => {
    // const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    const context = make_ciphertext_election_context(
                  1, 
                  1, 
                  new ElementModP(9n), 
                  new ElementModQ(2),
                  new ElementModQ(14227), 
                  undefined);
    const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    const inputs = from_file_to_class();
    const encryption_seed = hash_elems([inputs.manifest_hash, inputs.object_id, inputs.nonce]);
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);

    console.log("manifest hash", internal_manifest.manifest_hash);
    const encrypted_ballot = encrypt_ballot(plaintextBallot, internal_manifest, context, encryption_seed, get_optional(inputs.nonce));
    // console.log(encrypt_compatible_testing_demo(get_optional(encrypted_ballot)));
  });

  test('testConvertJsonFileToPlaintextBallot', () => {
    const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    // console.log()
    console.log("plaintextBallot is ", object_log(plaintextBallot));
    // console.log("contests is ", plaintextBallot.contests);
    // console.log("selections are ", plaintextBallot.contests[0].ballot_selections);
  });

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
