import {encrypt_ballot} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo, object_log,
  // hex_to_bigint
} from "./serialization";
import { make_ciphertext_election_context } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";

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
    console.log(object_log(context));
    // console.log(get_optional(encryped_ballot).crypto_hash);
  });

  // test('testConvertObjToJsonFile', () => {
  //   // hex_to_bigint("7FED");
  //   const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
  //   const JSON_string = encrypt_compatible_testing_demo(get_optional(encryped_ballot));
  //   console.log(JSON_string);
  // })
});
