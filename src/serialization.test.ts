import {encrypt_ballot} from "./simple_elections";
import {get_optional} from "./utils";
import {encrypt_compatible_testing_demo} from "./serialization";

describe("TestDeserialization", () => {

  test('testConvertJsonFileToObj', () => {
    const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    console.log(get_optional(encryped_ballot).crypto_hash);
  });

  test('testConvertObjToJsonFile', () => {
    const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    const JSON_string = encrypt_compatible_testing_demo(get_optional(encryped_ballot));
    console.log(JSON_string);
  })
});
