import {CiphertextBallot} from "./simple_election_data";
import { plainToClass } from "class-transformer";
import {get_optional} from "./utils";

const json_string = "{\n" +
  "    \"object_id\": \"some-external-id-string-123\",\n" +
  "    \"style_id\": \"jefferson-county-ballot-style\",\n" +
  "    \"manifest_hash\": 9973,\n" +
  "    \"code_seed\": 52523,\n" +
  "    \"contests\": [\n" +
  "        {\n" +
  "            \"object_id\": \"justice-supreme-court\",\n" +
  "            \"sequence_order\": 0,\n" +
  "            \"description_hash\": 26196,\n" +
  "            \"ballot_selections\": [\n" +
  "                {\n" +
  "                    \"object_id\": \"john-adams-selection\",\n" +
  "                    \"sequence_order\": 0,\n" +
  "                    \"description_hash\": 11775,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"12134001671678771851\",\n" +
  "                        \"data\": \"1502770863777469358\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 39529,\n" +
  "                    \"is_placeholder_selection\": false,\n" +
  "                    \"nonce\": 50246,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"16923428534602348243\",\n" +
  "                        \"proof_zero_data\": \"17570393965625676549\",\n" +
  "                        \"proof_one_pad\": \"10341002050983186017\",\n" +
  "                        \"proof_one_data\": \"17215719614163014940\",\n" +
  "                        \"proof_zero_challenge\": 4951,\n" +
  "                        \"proof_one_challenge\": 37371,\n" +
  "                        \"challenge\": 42322,\n" +
  "                        \"proof_zero_response\": 18357,\n" +
  "                        \"proof_one_response\": 7010,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"benjamin-franklin-selection\",\n" +
  "                    \"sequence_order\": 1,\n" +
  "                    \"description_hash\": 51671,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"3917837127134651645\",\n" +
  "                        \"data\": \"5314367008433655299\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 8417,\n" +
  "                    \"is_placeholder_selection\": false,\n" +
  "                    \"nonce\": 22491,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"13136678010011016740\",\n" +
  "                        \"proof_zero_data\": \"2165135364934198121\",\n" +
  "                        \"proof_one_pad\": \"3922526953898330832\",\n" +
  "                        \"proof_one_data\": \"1255969695179565188\",\n" +
  "                        \"proof_zero_challenge\": 61959,\n" +
  "                        \"proof_one_challenge\": 54277,\n" +
  "                        \"challenge\": 50715,\n" +
  "                        \"proof_zero_response\": 34757,\n" +
  "                        \"proof_one_response\": 24225,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"john-hancock-selection\",\n" +
  "                    \"sequence_order\": 2,\n" +
  "                    \"description_hash\": 1054,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"255844785366588188\",\n" +
  "                        \"data\": \"8583070084640768030\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 43225,\n" +
  "                    \"is_placeholder_selection\": false,\n" +
  "                    \"nonce\": 31347,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"10235258317480349978\",\n" +
  "                        \"proof_zero_data\": \"7256985595115661952\",\n" +
  "                        \"proof_one_pad\": \"10175758013699893708\",\n" +
  "                        \"proof_one_data\": \"14720976612885448488\",\n" +
  "                        \"proof_zero_challenge\": 32445,\n" +
  "                        \"proof_one_challenge\": 20055,\n" +
  "                        \"challenge\": 52500,\n" +
  "                        \"proof_zero_response\": 22302,\n" +
  "                        \"proof_one_response\": 40828,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"write-in-selection\",\n" +
  "                    \"sequence_order\": 3,\n" +
  "                    \"description_hash\": 50863,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"9299912383351265113\",\n" +
  "                        \"data\": \"212954059271314761\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 60333,\n" +
  "                    \"is_placeholder_selection\": false,\n" +
  "                    \"nonce\": 60200,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"15826453124332148024\",\n" +
  "                        \"proof_zero_data\": \"6585726058992680212\",\n" +
  "                        \"proof_one_pad\": \"1457762078489557579\",\n" +
  "                        \"proof_one_data\": \"18230008489562257330\",\n" +
  "                        \"proof_zero_challenge\": 11400,\n" +
  "                        \"proof_one_challenge\": 29068,\n" +
  "                        \"challenge\": 40468,\n" +
  "                        \"proof_zero_response\": 56882,\n" +
  "                        \"proof_one_response\": 49013,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"justice-supreme-court-4-placeholder\",\n" +
  "                    \"sequence_order\": 4,\n" +
  "                    \"description_hash\": 41361,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"11224162101144585914\",\n" +
  "                        \"data\": \"1613948550166977864\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 60598,\n" +
  "                    \"is_placeholder_selection\": true,\n" +
  "                    \"nonce\": 52438,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"12293112453131972810\",\n" +
  "                        \"proof_zero_data\": \"17487731825999790825\",\n" +
  "                        \"proof_one_pad\": \"13776221093905079620\",\n" +
  "                        \"proof_one_data\": \"4713734307765350282\",\n" +
  "                        \"proof_zero_challenge\": 50361,\n" +
  "                        \"proof_one_challenge\": 11059,\n" +
  "                        \"challenge\": 61420,\n" +
  "                        \"proof_zero_response\": 22100,\n" +
  "                        \"proof_one_response\": 8240,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"justice-supreme-court-5-placeholder\",\n" +
  "                    \"sequence_order\": 5,\n" +
  "                    \"description_hash\": 61706,\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"8212879103348661976\",\n" +
  "                        \"data\": \"17731780476479972322\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": 55827,\n" +
  "                    \"is_placeholder_selection\": true,\n" +
  "                    \"nonce\": 44427,\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"16960465299284500181\",\n" +
  "                        \"proof_zero_data\": \"14180973964672850931\",\n" +
  "                        \"proof_one_pad\": \"14485228182275779767\",\n" +
  "                        \"proof_one_data\": \"13079974115890844967\",\n" +
  "                        \"proof_zero_challenge\": 20131,\n" +
  "                        \"proof_one_challenge\": 28676,\n" +
  "                        \"challenge\": 48807,\n" +
  "                        \"proof_zero_response\": 45828,\n" +
  "                        \"proof_one_response\": 50620,\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                }\n" +
  "            ],\n" +
  "            \"ciphertext_accumulation\": {\n" +
  "                \"pad\": \"2538487341775279615\",\n" +
  "                \"data\": \"16332417304602615325\"\n" +
  "            },\n" +
  "            \"crypto_hash\": 53689,\n" +
  "            \"nonce\": 34874,\n" +
  "            \"proof\": {\n" +
  "                \"pad\": \"15654954763222468051\",\n" +
  "                \"data\": \"15815819070899634924\",\n" +
  "                \"challenge\": 29600,\n" +
  "                \"response\": 28284,\n" +
  "                \"constant\": 2,\n" +
  "                \"usage\": \"Prove value within selection's limit\"\n" +
  "            }\n" +
  "        }\n" +
  "    ],\n" +
  "    \"code\": 27676,\n" +
  "    \"timestamp\": 1634941785,\n" +
  "    \"crypto_hash\": 25101,\n" +
  "    \"nonce\": 28676\n" +
  "}";

export function from_file_to_class(): CiphertextBallot{
  const result = JSON.parse(json_string, (key, value) => {
    if (key === "pad") {
      return BigInt(value);
    } else if (key === "data") {
      return BigInt(value);
    } else if (key === "proof_zero_pad") {
      return BigInt(value);
    } else if (key === "proof_zero_data") {
      return BigInt(value);
    } else if (key === "proof_one_pad") {
      return BigInt(value);
    } else if (key === "proof_one_data") {
      return BigInt(value);
    } else if (typeof value === 'number') {
      console.log(key);
      return value;
    }
    else {
      return value;
    }
  });
  console.log(result);
  console.log(result.contests[0].proof.pad);
  const newEncryptedBallot= plainToClass(CiphertextBallot, result as CiphertextBallot);
  console.log(newEncryptedBallot);
  console.log(get_optional(newEncryptedBallot.contests[0].proof).pad);
  return newEncryptedBallot;


}

export function encrypt_compatible_testing_demo(encrypted_ballot: CiphertextBallot): string{
  return JSON.stringify(encrypted_ballot, (key, value) => {
    key;
    if (typeof value === "bigint") {
      return value.toString();
    }
    else if (typeof value === "number") {
      return value.toString(16);
    }
    return value;
  }, '\t');
}


