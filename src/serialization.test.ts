import {encrypt_ballot} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo, from_file_to_class_manifest, from_file_to_PlaintextBallot, object_log, simple_ballot_json,
  // hex_to_bigint
} from "./serialization";
import { make_ciphertext_election_context, PlaintextBallot } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";
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
    console.log(object_log(context));
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
    const manifest_json = "{\n" +
      "  \"spec_version\": \"v0.95\",\n" +
      "  \"geopolitical_units\": [\n" +
      "    {\n" +
      "      \"object_id\": \"jefferson-county\",\n" +
      "      \"name\": \"Jefferson County\",\n" +
      "      \"type\": \"county\",\n" +
      "      \"contact_information\": {\n" +
      "        \"address_line\": [\"1234 Samuel Adams Way\", \"Jefferson, Hamilton 999999\"],\n" +
      "        \"name\": \"Jefferson County Clerk\",\n" +
      "        \"email\": [\n" +
      "          {\n" +
      "            \"annotation\": \"inquiries\",\n" +
      "            \"value\": \"inquiries@jefferson.hamilton.state.gov\"\n" +
      "          }\n" +
      "        ],\n" +
      "        \"phone\": [\n" +
      "          {\n" +
      "            \"annotation\": \"domestic\",\n" +
      "            \"value\": \"123-456-7890\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"harrison-township\",\n" +
      "      \"name\": \"Harrison Township\",\n" +
      "      \"type\": \"township\",\n" +
      "      \"contact_information\": {\n" +
      "        \"address_line\": [\"1234 Thorton Drive\", \"Harrison, Hamilton 999999\"],\n" +
      "        \"name\": \"Harrison Town Hall\",\n" +
      "        \"email\": [\n" +
      "          {\n" +
      "            \"annotation\": \"inquiries\",\n" +
      "            \"value\": \"inquiries@harrison.hamilton.state.gov\"\n" +
      "          }\n" +
      "        ],\n" +
      "        \"phone\": [\n" +
      "          {\n" +
      "            \"annotation\": \"domestic\",\n" +
      "            \"value\": \"123-456-7890\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"harrison-township-precinct-east\",\n" +
      "      \"name\": \"Harrison Township Precinct\",\n" +
      "      \"type\": \"township\",\n" +
      "      \"contact_information\": {\n" +
      "        \"address_line\": [\"1234 Thorton Drive\", \"Harrison, Hamilton 999999\"],\n" +
      "        \"name\": \"Harrison Town Hall\",\n" +
      "        \"email\": [\n" +
      "          {\n" +
      "            \"annotation\": \"inquiries\",\n" +
      "            \"value\": \"inquiries@harrison.hamilton.state.gov\"\n" +
      "          }\n" +
      "        ],\n" +
      "        \"phone\": [\n" +
      "          {\n" +
      "            \"annotation\": \"domestic\",\n" +
      "            \"value\": \"123-456-7890\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"rutledge-elementary\",\n" +
      "      \"name\": \"Rutledge Elementary School district\",\n" +
      "      \"type\": \"school\",\n" +
      "      \"contact_information\": {\n" +
      "        \"address_line\": [\"1234 Wolcott Parkway\", \"Harrison, Hamilton 999999\"],\n" +
      "        \"name\": \"Rutledge Elementary School\",\n" +
      "        \"email\": [\n" +
      "          {\n" +
      "            \"annotation\": \"inquiries\",\n" +
      "            \"value\": \"inquiries@harrison.hamilton.state.gov\"\n" +
      "          }\n" +
      "        ],\n" +
      "        \"phone\": [\n" +
      "          {\n" +
      "            \"annotation\": \"domestic\",\n" +
      "            \"value\": \"123-456-7890\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    }\n" +
      "  ],\n" +
      "  \"parties\": [\n" +
      "    {\n" +
      "      \"object_id\": \"whig\",\n" +
      "      \"abbreviation\": \"WHI\",\n" +
      "      \"color\": \"AAAAAA\",\n" +
      "      \"logo_uri\": \"http://some/path/to/whig.svg\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Whig Party\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"federalist\",\n" +
      "      \"abbreviation\": \"FED\",\n" +
      "      \"color\": \"CCCCCC\",\n" +
      "      \"logo_uri\": \"http://some/path/to/federalist.svg\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Federalist Party\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"democratic-republican\",\n" +
      "      \"abbreviation\": \"DEMREP\",\n" +
      "      \"color\": \"EEEEEE\",\n" +
      "      \"logo_uri\": \"http://some/path/to/democratic-repulbican.svg\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Democratic Republican Party\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    }\n" +
      "  ],\n" +
      "  \"candidates\": [\n" +
      "    {\n" +
      "      \"object_id\": \"benjamin-franklin\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Benjamin Franklin\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"party_id\": \"whig\"\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"john-adams\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"John Adams\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"party_id\": \"federalist\"\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"john-hancock\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"John Hancock\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"party_id\": \"democratic-republican\"\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"write-in\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Write In Candidate\",\n" +
      "            \"language\": \"en\"\n" +
      "          },\n" +
      "          {\n" +
      "            \"value\": \"Escribir en la candidata\",\n" +
      "            \"language\": \"es\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"is_write_in\": true\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"referendum-pineapple-affirmative\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Pineapple should be banned on pizza\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"referendum-pineapple-negative\",\n" +
      "      \"name\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Pineapple should not be banned on pizza\",\n" +
      "            \"language\": \"en\"\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    }\n" +
      "  ],\n" +
      "  \"contests\": [\n" +
      "    {\n" +
      "      \"object_id\": \"justice-supreme-court\",\n" +
      "      \"sequence_order\": 0,\n" +
      "      \"ballot_selections\": [\n" +
      "        {\n" +
      "          \"object_id\": \"john-adams-selection\",\n" +
      "          \"sequence_order\": 0,\n" +
      "          \"candidate_id\": \"john-adams\"\n" +
      "        },\n" +
      "        {\n" +
      "          \"object_id\": \"benjamin-franklin-selection\",\n" +
      "          \"sequence_order\": 1,\n" +
      "          \"candidate_id\": \"benjamin-franklin\"\n" +
      "        },\n" +
      "        {\n" +
      "          \"object_id\": \"john-hancock-selection\",\n" +
      "          \"sequence_order\": 2,\n" +
      "          \"candidate_id\": \"john-hancock\"\n" +
      "        },\n" +
      "        {\n" +
      "          \"object_id\": \"write-in-selection\",\n" +
      "          \"sequence_order\": 3,\n" +
      "          \"candidate_id\": \"write-in\"\n" +
      "        }\n" +
      "      ],\n" +
      "      \"ballot_title\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Justice of the Supreme Court\",\n" +
      "            \"language\": \"en\"\n" +
      "          },\n" +
      "          {\n" +
      "            \"value\": \"Juez de la corte suprema\",\n" +
      "            \"language\": \"es\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"ballot_subtitle\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Please choose up to two candidates\",\n" +
      "            \"language\": \"en\"\n" +
      "          },\n" +
      "          {\n" +
      "            \"value\": \"Uno\",\n" +
      "            \"language\": \"es\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"vote_variation\": \"n_of_m\",\n" +
      "      \"electoral_district_id\": \"jefferson-county\",\n" +
      "      \"name\": \"Justice of the Supreme Court\",\n" +
      "      \"number_elected\": 2,\n" +
      "      \"votes_allowed\": 2\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"referendum-pineapple\",\n" +
      "      \"sequence_order\": 1,\n" +
      "      \"ballot_selections\": [\n" +
      "        {\n" +
      "          \"object_id\": \"referendum-pineapple-affirmative-selection\",\n" +
      "          \"sequence_order\": 0,\n" +
      "          \"candidate_id\": \"referendum-pineapple-affirmative\"\n" +
      "        },\n" +
      "        {\n" +
      "          \"object_id\": \"referendum-pineapple-negative-selection\",\n" +
      "          \"sequence_order\": 1,\n" +
      "          \"candidate_id\": \"referendum-pineapple-negative\"\n" +
      "        }\n" +
      "      ],\n" +
      "      \"ballot_title\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"Should pineapple be banned on pizza?\",\n" +
      "            \"language\": \"en\"\n" +
      "          },\n" +
      "          {\n" +
      "            \"value\": \"¿Debería prohibirse la piña en la pizza?\",\n" +
      "            \"language\": \"es\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"ballot_subtitle\": {\n" +
      "        \"text\": [\n" +
      "          {\n" +
      "            \"value\": \"The township considers this issue to be very important\",\n" +
      "            \"language\": \"en\"\n" +
      "          },\n" +
      "          {\n" +
      "            \"value\": \"El municipio considera que esta cuestión es muy importante\",\n" +
      "            \"language\": \"es\"\n" +
      "          }\n" +
      "        ]\n" +
      "      },\n" +
      "      \"vote_variation\": \"one_of_m\",\n" +
      "      \"electoral_district_id\": \"harrison-township\",\n" +
      "      \"name\": \"The Pineapple Question\",\n" +
      "      \"number_elected\": 1,\n" +
      "      \"votes_allowed\": 1\n" +
      "    }\n" +
      "  ],\n" +
      "  \"ballot_styles\": [\n" +
      "    {\n" +
      "      \"object_id\": \"jefferson-county-ballot-style\",\n" +
      "      \"geopolitical_unit_ids\": [\"jefferson-county\"]\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"harrison-township-ballot-style\",\n" +
      "      \"geopolitical_unit_ids\": [\"jefferson-county\", \"harrison-township\"]\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"harrison-township-precinct-east-ballot-style\",\n" +
      "      \"geopolitical_unit_ids\": [\n" +
      "        \"jefferson-county\",\n" +
      "        \"harrison-township\",\n" +
      "        \"harrison-township-precinct-east\",\n" +
      "        \"rutledge-elementary\"\n" +
      "      ]\n" +
      "    },\n" +
      "    {\n" +
      "      \"object_id\": \"rutledge-elementary-ballot-style\",\n" +
      "      \"geopolitical_unit_ids\": [\n" +
      "        \"jefferson-county\",\n" +
      "        \"harrison-township\",\n" +
      "        \"rutledge-elementary\"\n" +
      "      ]\n" +
      "    }\n" +
      "  ],\n" +
      "  \"name\": {\n" +
      "    \"text\": [\n" +
      "      {\n" +
      "        \"value\": \"Jefferson County Spring Primary\",\n" +
      "        \"language\": \"en\"\n" +
      "      },\n" +
      "      {\n" +
      "        \"value\": \"Primaria de primavera del condado de Jefferson\",\n" +
      "        \"language\": \"es\"\n" +
      "      }\n" +
      "    ]\n" +
      "  },\n" +
      "  \"contact_information\": {\n" +
      "    \"address_line\": [\"1234 Paul Revere Run\", \"Jefferson, Hamilton 999999\"],\n" +
      "    \"name\": \"Hamilton State Election Commission\",\n" +
      "    \"email\": [\n" +
      "      {\n" +
      "        \"annotation\": \"press\",\n" +
      "        \"value\": \"inquiries@hamilton.state.gov\"\n" +
      "      },\n" +
      "      {\n" +
      "        \"annotation\": \"federal\",\n" +
      "        \"value\": \"commissioner@hamilton.state.gov\"\n" +
      "      }\n" +
      "    ],\n" +
      "    \"phone\": [\n" +
      "      {\n" +
      "        \"annotation\": \"domestic\",\n" +
      "        \"value\": \"123-456-7890\"\n" +
      "      },\n" +
      "      {\n" +
      "        \"annotation\": \"international\",\n" +
      "        \"value\": \"+1-123-456-7890\"\n" +
      "      }\n" +
      "    ]\n" +
      "  },\n" +
      "  \"start_date\": \"2020-03-01T08:00:00-05:00\",\n" +
      "  \"end_date\": \"2020-03-01T20:00:00-05:00\",\n" +
      "  \"election_scope_id\": \"jefferson-county-primary\",\n" +
      "  \"type\": \"primary\"\n" +
      "}\n";
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);
    console.log(JSON.stringify(internal_manifest, null, "\t"));
  });
});
