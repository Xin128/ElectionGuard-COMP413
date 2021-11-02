import {encrypt_ballot} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo, from_file_to_class, from_file_to_class_manifest, from_file_to_PlaintextBallot, manifest_json, object_log, simple_ballot_json,
  // hex_to_bigint
} from "./serialization";
import { make_ciphertext_election_context, PlaintextBallot } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";
import {InternalManifest} from "./manifest";
import { hash_elems } from "./hash";

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
    const internal_manifest = new InternalManifest(from_file_to_class_manifest(manifest_json));
    const encryption_seed = hash_elems([inputs.manifest_hash, inputs.object_id, inputs.nonce]);
    const encrypted_ballot = encrypt_ballot(plaintextBallot, internal_manifest, context, encryption_seed, inputs.nonce);
    console.log(object_log(encrypted_ballot));
    // console.log(get_optional(encryped_ballot).crypto_hash);
  });

  // test('testConvertObjToJsonFile', () => {
  //   // hex_to_bigint("7FED");
  //   const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
  //   const JSON_string = encrypt_compatible_testing_demo(get_optional(encryped_ballot));
  //   console.log(JSON_string);
  // })

  test('testConvertJsonFileToPlaintextBallot', () => {
    const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    // console.log()
    console.log("plaintextBallot is ", object_log(plaintextBallot));
    // console.log("contests is ", plaintextBallot.contests);
    // console.log("selections are ", plaintextBallot.contests[0].ballot_selections);
  });

  // test('testEncryptContest', () => {
  //   const inputs = from_file_to_class();
  //   const nonce_seed = hash_elems([inputs.manifest_hash,inputs.object_id, inputs.nonce]);
  //   const 
  // });
  
  test('testConvertObjToJsonFile', () => {
    // hex_to_bigint("7FED");
    const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    const JSON_string = encrypt_compatible_testing_demo(get_optional(encryped_ballot));
    console.log(JSON_string);
  })

  test('testConvertManifestJsonFileToObj', () => {
    //manifest JSON input file
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);
    console.log(JSON.stringify(internal_manifest, null, "\t"));
  });
});
