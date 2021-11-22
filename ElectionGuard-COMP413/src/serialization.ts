/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {CiphertextBallot,
  // CiphertextBallotContest,
  PlaintextBallot} from "./simple_election_data";
import {plainToClass} from "class-transformer";
import {Manifest} from "./manifest";
// import {ElementModP, ElementModQ} from "./group";
// import {ProofUsage} from "./chaum_pedersen";

const json_string = "{\n" +
  "    \"object_id\": \"some-external-id-string-123\",\n" +
  "    \"style_id\": \"jefferson-county-ballot-style\",\n" +
  "    \"manifest_hash\": \"26F5\",\n" +
  "    \"code_seed\": \"CD2B\",\n" +
  "    \"contests\": [\n" +
  "        {\n" +
  "            \"object_id\": \"justice-supreme-court\",\n" +
  "            \"sequence_order\": \"00\",\n" +
  "            \"description_hash\": \"6654\",\n" +
  "            \"ballot_selections\": [\n" +
  "                {\n" +
  "                    \"object_id\": \"john-adams-selection\",\n" +
  "                    \"sequence_order\": \"00\",\n" +
  "                    \"description_hash\": \"2DFF\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"15432452611067669264\",\n" +
  "                        \"data\": \"15616222367556762890\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"85F9\",\n" +
  "                    \"is_placeholder_selection\": \"00\",\n" +
  "                    \"nonce\": \"3298\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"8442157498440623226\",\n" +
  "                        \"proof_zero_data\": \"18335962429120460393\",\n" +
  "                        \"proof_one_pad\": \"15711130229203582655\",\n" +
  "                        \"proof_one_data\": \"17487616188833869553\",\n" +
  "                        \"proof_zero_challenge\": \"4510\",\n" +
  "                        \"proof_one_challenge\": \"976A\",\n" +
  "                        \"challenge\": \"DC7A\",\n" +
  "                        \"proof_zero_response\": \"4E8A\",\n" +
  "                        \"proof_one_response\": \"3B18\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"benjamin-franklin-selection\",\n" +
  "                    \"sequence_order\": \"01\",\n" +
  "                    \"description_hash\": \"C9D7\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"11884679765322039846\",\n" +
  "                        \"data\": \"3504487674681685196\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"CD4C\",\n" +
  "                    \"is_placeholder_selection\": \"00\",\n" +
  "                    \"nonce\": \"BDE6\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"6681702374317616247\",\n" +
  "                        \"proof_zero_data\": \"5919121084903920119\",\n" +
  "                        \"proof_one_pad\": \"6490626824174500658\",\n" +
  "                        \"proof_one_data\": \"13415779466211002491\",\n" +
  "                        \"proof_zero_challenge\": \"95CB\",\n" +
  "                        \"proof_one_challenge\": \"A97A\",\n" +
  "                        \"challenge\": \"3F54\",\n" +
  "                        \"proof_zero_response\": \"7681\",\n" +
  "                        \"proof_one_response\": \"0C33\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"john-hancock-selection\",\n" +
  "                    \"sequence_order\": \"02\",\n" +
  "                    \"description_hash\": \"041E\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"6134421457232408437\",\n" +
  "                        \"data\": \"12600733893791391007\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"39EA\",\n" +
  "                    \"is_placeholder_selection\": \"00\",\n" +
  "                    \"nonce\": \"019C\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"7854032639703357939\",\n" +
  "                        \"proof_zero_data\": \"9337455329456383521\",\n" +
  "                        \"proof_one_pad\": \"9793828469395635107\",\n" +
  "                        \"proof_one_data\": \"3799002493802499905\",\n" +
  "                        \"proof_zero_challenge\": \"D7EF\",\n" +
  "                        \"proof_one_challenge\": \"4A37\",\n" +
  "                        \"challenge\": \"2235\",\n" +
  "                        \"proof_zero_response\": \"2964\",\n" +
  "                        \"proof_one_response\": \"5332\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"write-in-selection\",\n" +
  "                    \"sequence_order\": \"03\",\n" +
  "                    \"description_hash\": \"C6AF\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"74463669552307256\",\n" +
  "                        \"data\": \"14614819038667367626\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"DED6\",\n" +
  "                    \"is_placeholder_selection\": \"00\",\n" +
  "                    \"nonce\": \"5434\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"10122665376204940651\",\n" +
  "                        \"proof_zero_data\": \"842639258061841682\",\n" +
  "                        \"proof_one_pad\": \"5931810232150118510\",\n" +
  "                        \"proof_one_data\": \"10835937530364904234\",\n" +
  "                        \"proof_zero_challenge\": \"EAE4\",\n" +
  "                        \"proof_one_challenge\": \"E540\",\n" +
  "                        \"challenge\": \"D033\",\n" +
  "                        \"proof_zero_response\": \"1E33\",\n" +
  "                        \"proof_one_response\": \"B0CC\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"justice-supreme-court-4-placeholder\",\n" +
  "                    \"sequence_order\": \"04\",\n" +
  "                    \"description_hash\": \"A191\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"1052732449890201973\",\n" +
  "                        \"data\": \"14660837509959826160\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"D3EF\",\n" +
  "                    \"is_placeholder_selection\": \"01\",\n" +
  "                    \"nonce\": \"BAB4\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"4556120865590037854\",\n" +
  "                        \"proof_zero_data\": \"189865597233188454\",\n" +
  "                        \"proof_one_pad\": \"11320751153538246476\",\n" +
  "                        \"proof_one_data\": \"11495273652826841791\",\n" +
  "                        \"proof_zero_challenge\": \"8F98\",\n" +
  "                        \"proof_one_challenge\": \"943D\",\n" +
  "                        \"challenge\": \"23E4\",\n" +
  "                        \"proof_zero_response\": \"F09A\",\n" +
  "                        \"proof_one_response\": \"5723\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                },\n" +
  "                {\n" +
  "                    \"object_id\": \"justice-supreme-court-5-placeholder\",\n" +
  "                    \"sequence_order\": \"05\",\n" +
  "                    \"description_hash\": \"F10A\",\n" +
  "                    \"ciphertext\": {\n" +
  "                        \"pad\": \"1541960870979102681\",\n" +
  "                        \"data\": \"3444294116341284344\"\n" +
  "                    },\n" +
  "                    \"crypto_hash\": \"E14A\",\n" +
  "                    \"is_placeholder_selection\": \"01\",\n" +
  "                    \"nonce\": \"88B1\",\n" +
  "                    \"proof\": {\n" +
  "                        \"proof_zero_pad\": \"1462678916131973416\",\n" +
  "                        \"proof_zero_data\": \"13341797395390433377\",\n" +
  "                        \"proof_one_pad\": \"2152839272861723245\",\n" +
  "                        \"proof_one_data\": \"539979633487837164\",\n" +
  "                        \"proof_zero_challenge\": \"1978\",\n" +
  "                        \"proof_one_challenge\": \"CC9C\",\n" +
  "                        \"challenge\": \"E614\",\n" +
  "                        \"proof_zero_response\": \"3755\",\n" +
  "                        \"proof_one_response\": \"EF6D\",\n" +
  "                        \"usage\": \"Prove selection's value (0 or 1)\"\n" +
  "                    },\n" +
  "                    \"extended_data\": null\n" +
  "                }\n" +
  "            ],\n" +
  "            \"ciphertext_accumulation\": {\n" +
  "                \"pad\": \"18270637542198392056\",\n" +
  "                \"data\": \"18377930743374613968\"\n" +
  "            },\n" +
  "            \"crypto_hash\": \"2B76\",\n" +
  "            \"nonce\": \"6D12\",\n" +
  "            \"proof\": {\n" +
  "                \"pad\": \"1943371427765234972\",\n" +
  "                \"data\": \"4717085759009076609\",\n" +
  "                \"challenge\": \"7FED\",\n" +
  "                \"response\": \"013A\",\n" +
  "                \"constant\": \"02\",\n" +
  "                \"usage\": \"Prove value within selection's limit\"\n" +
  "            }\n" +
  "        }\n" +
  "    ],\n" +
  "    \"code\": \"084F\",\n" +
  "    \"timestamp\": 1635015400,\n" +
  "    \"crypto_hash\": \"3B2A\",\n" +
  "    \"nonce\": \"9DA6\"\n" +
  "}";

export const simple_ballot_json = `
  {
    "object_id": "some-external-id-string-123",
    "style_id": "jefferson-county-ballot-style",
    "contests": [
      {
        "object_id": "justice-supreme-court",
        "sequence_order": 0,
        "ballot_selections": [
          {
            "object_id": "john-adams-selection",
            "sequence_order": 0,
            "vote": 1
          },
          {
            "object_id": "write-in-selection",
            "sequence_order": 3,
            "vote": 1,
            "extended_data": {
              "value": "Susan B. Anthony",
              "length": 16
            }
          }
        ]
      },
      { "object_id": "referendum-pineapple",
        "sequence_order": 1,
        "ballot_selections": [
              {
                  "object_id": "referendum-pineapple-affirmative-selection",
                  "sequence_order": 0,
                  "vote": 1
                }
          ]
      }
    ]
  }`

export const manifest_json = `{
  "spec_version": "v0.95",
  "geopolitical_units": [
    {
      "object_id": "jefferson-county",
      "name": "Jefferson County",
      "type": "county",
      "contact_information": {
        "address_line": ["1234 Samuel Adams Way", "Jefferson, Hamilton 999999"],
        "name": "Jefferson County Clerk",
        "email": [
          {
            "annotation": "inquiries",
            "value": "inquiries@jefferson.hamilton.state.gov"
          }
        ],
        "phone": [
          {
            "annotation": "domestic",
            "value": "123-456-7890"
          }
        ]
      }
    },
    {
      "object_id": "harrison-township",
      "name": "Harrison Township",
      "type": "township",
      "contact_information": {
        "address_line": ["1234 Thorton Drive", "Harrison, Hamilton 999999"],
        "name": "Harrison Town Hall",
        "email": [
          {
            "annotation": "inquiries",
            "value": "inquiries@harrison.hamilton.state.gov"
          }
        ],
        "phone": [
          {
            "annotation": "domestic",
            "value": "123-456-7890"
          }
        ]
      }
    },
    {
      "object_id": "harrison-township-precinct-east",
      "name": "Harrison Township Precinct",
      "type": "township",
      "contact_information": {
        "address_line": ["1234 Thorton Drive", "Harrison, Hamilton 999999"],
        "name": "Harrison Town Hall",
        "email": [
          {
            "annotation": "inquiries",
            "value": "inquiries@harrison.hamilton.state.gov"
          }
        ],
        "phone": [
          {
            "annotation": "domestic",
            "value": "123-456-7890"
          }
        ]
      }
    },
    {
      "object_id": "rutledge-elementary",
      "name": "Rutledge Elementary School district",
      "type": "school",
      "contact_information": {
        "address_line": ["1234 Wolcott Parkway", "Harrison, Hamilton 999999"],
        "name": "Rutledge Elementary School",
        "email": [
          {
            "annotation": "inquiries",
            "value": "inquiries@harrison.hamilton.state.gov"
          }
        ],
        "phone": [
          {
            "annotation": "domestic",
            "value": "123-456-7890"
          }
        ]
      }
    }
  ],
  "parties": [
    {
      "object_id": "whig",
      "abbreviation": "WHI",
      "color": "AAAAAA",
      "logo_uri": "http://some/path/to/whig.svg",
      "name": {
        "text": [
          {
            "value": "Whig Party",
            "language": "en"
          }
        ]
      }
    },
    {
      "object_id": "federalist",
      "abbreviation": "FED",
      "color": "CCCCCC",
      "logo_uri": "http://some/path/to/federalist.svg",
      "name": {
        "text": [
          {
            "value": "Federalist Party",
            "language": "en"
          }
        ]
      }
    },
    {
      "object_id": "democratic-republican",
      "abbreviation": "DEMREP",
      "color": "EEEEEE",
      "logo_uri": "http://some/path/to/democratic-repulbican.svg",
      "name": {
        "text": [
          {
            "value": "Democratic Republican Party",
            "language": "en"
          }
        ]
      }
    }
  ],
  "candidates": [
    {
      "object_id": "benjamin-franklin",
      "name": {
        "text": [
          {
            "value": "Benjamin Franklin",
            "language": "en"
          }
        ]
      },
      "party_id": "whig"
    },
    {
      "object_id": "john-adams",
      "name": {
        "text": [
          {
            "value": "John Adams",
            "language": "en"
          }
        ]
      },
      "party_id": "federalist"
    },
    {
      "object_id": "john-hancock",
      "name": {
        "text": [
          {
            "value": "John Hancock",
            "language": "en"
          }
        ]
      },
      "party_id": "democratic-republican"
    },
    {
      "object_id": "write-in",
      "name": {
        "text": [
          {
            "value": "Write In Candidate",
            "language": "en"
          },
          {
            "value": "Escribir en la candidata",
            "language": "es"
          }
        ]
      },
      "is_write_in": true
    },
    {
      "object_id": "referendum-pineapple-affirmative",
      "name": {
        "text": [
          {
            "value": "Pineapple should be banned on pizza",
            "language": "en"
          }
        ]
      }
    },
    {
      "object_id": "referendum-pineapple-negative",
      "name": {
        "text": [
          {
            "value": "Pineapple should not be banned on pizza",
            "language": "en"
          }
        ]
      }
    }
  ],
  "contests": [
    {
      "object_id": "justice-supreme-court",
      "sequence_order": 0,
      "ballot_selections": [
        {
          "object_id": "john-adams-selection",
          "sequence_order": 0,
          "candidate_id": "john-adams"
        },
        {
          "object_id": "benjamin-franklin-selection",
          "sequence_order": 1,
          "candidate_id": "benjamin-franklin"
        },
        {
          "object_id": "john-hancock-selection",
          "sequence_order": 2,
          "candidate_id": "john-hancock"
        },
        {
          "object_id": "write-in-selection",
          "sequence_order": 3,
          "candidate_id": "write-in"
        }
      ],
      "ballot_title": {
        "text": [
          {
            "value": "Justice of the Supreme Court",
            "language": "en"
          },
          {
            "value": "Juez de la corte suprema",
            "language": "es"
          }
        ]
      },
      "ballot_subtitle": {
        "text": [
          {
            "value": "Please choose up to two candidates",
            "language": "en"
          },
          {
            "value": "Uno",
            "language": "es"
          }
        ]
      },
      "vote_variation": "n_of_m",
      "electoral_district_id": "jefferson-county",
      "name": "Justice of the Supreme Court",
      "number_elected": 2,
      "votes_allowed": 2
    },
    {
      "object_id": "referendum-pineapple",
      "sequence_order": 1,
      "ballot_selections": [
        {
          "object_id": "referendum-pineapple-affirmative-selection",
          "sequence_order": 0,
          "candidate_id": "referendum-pineapple-affirmative"
        },
        {
          "object_id": "referendum-pineapple-negative-selection",
          "sequence_order": 1,
          "candidate_id": "referendum-pineapple-negative"
        }
      ],
      "ballot_title": {
        "text": [
          {
            "value": "Should pineapple be banned on pizza?",
            "language": "en"
          },
          {
            "value": "¿Debería prohibirse la piña en la pizza?",
            "language": "es"
          }
        ]
      },
      "ballot_subtitle": {
        "text": [
          {
            "value": "The township considers this issue to be very important",
            "language": "en"
          },
          {
            "value": "El municipio considera que esta cuestión es muy importante",
            "language": "es"
          }
        ]
      },
      "vote_variation": "one_of_m",
      "electoral_district_id": "harrison-township",
      "name": "The Pineapple Question",
      "number_elected": 1,
      "votes_allowed": 1
    }
  ],
  "ballot_styles": [
    {
      "object_id": "jefferson-county-ballot-style",
      "geopolitical_unit_ids": ["jefferson-county", "harrison-township"]
    },
    {
      "object_id": "harrison-township-ballot-style",
      "geopolitical_unit_ids": ["jefferson-county", "harrison-township"]
    },
    {
      "object_id": "harrison-township-precinct-east-ballot-style",
      "geopolitical_unit_ids": [
        "jefferson-county",
        "harrison-township",
        "harrison-township-precinct-east",
        "rutledge-elementary"
      ]
    },
    {
      "object_id": "rutledge-elementary-ballot-style",
      "geopolitical_unit_ids": [
        "jefferson-county",
        "harrison-township",
        "rutledge-elementary"
      ]
    }
  ],
  "name": {
    "text": [
      {
        "value": "Jefferson County Spring Primary",
        "language": "en"
      },
      {
        "value": "Primaria de primavera del condado de Jefferson",
        "language": "es"
      }
    ]
  },
  "contact_information": {
    "address_line": ["1234 Paul Revere Run", "Jefferson, Hamilton 999999"],
    "name": "Hamilton State Election Commission",
    "email": [
      {
        "annotation": "press",
        "value": "inquiries@hamilton.state.gov"
      },
      {
        "annotation": "federal",
        "value": "commissioner@hamilton.state.gov"
      }
    ],
    "phone": [
      {
        "annotation": "domestic",
        "value": "123-456-7890"
      },
      {
        "annotation": "international",
        "value": "+1-123-456-7890"
      }
    ]
  },
  "start_date": "2020-03-01T08:00:00-05:00",
  "end_date": "2020-03-01T20:00:00-05:00",
  "election_scope_id": "jefferson-county-primary",
  "type": "primary"
}
`



const numberList: string[] = ["timestamp", "sequence_order"];
const booleanList: string[] = ["is_placeholder_selection"];
const banList: string[] = ["object_id", "style_id"];

export function from_file_to_class(): CiphertextBallot{
  const result = JSON.parse(json_string, (key, value) => {
    //the purpose of this reviver is to replace string inputs into appropriate primitive objects
    //like number, boolean, and string. More complicated objects are handled at by plainToClass method
    if (banList.includes(key)) {
      return value;
    } else if (numberList.includes(key)) {
      return parseInt(value);
    } else if (booleanList.includes(key)) {
      return value !== "00";
    } else {
      //default case
      return value;
    }
  }
  );
  return plainToClass(CiphertextBallot, result as CiphertextBallot);

}

export function from_file_to_PlaintextBallot(jsonString: string): PlaintextBallot {
  const result = JSON.parse(jsonString, (key, value) => {
    //the purpose of this reviver is to replace string inputs into appropriate primitive objects
    //like number, boolean, and string. More complicated objects are handled at by plainToClass method
    if (banList.includes(key)) {
      return value;
    } else if (numberList.includes(key)) {
      return parseInt(value);
    } else if (booleanList.includes(key)) {
      return value !== "00";
    } else {
      //default case
      return value;
    }
  }
  );
  return plainToClass(PlaintextBallot, result as PlaintextBallot);
}
export function from_file_to_class_manifest(manifest_JSON: string):Manifest {
  const result = JSON.parse(manifest_JSON);
  return plainToClass(Manifest, result as Manifest);
}

export function hex_to_bigint(numstr: string): bigint {
  console.log("numstr: " + numstr + "\n");
  return BigInt("0x" + numstr);
}

const deserialize_toHex_banlist:string[] = ["timestamp"];

export function encrypt_compatible_testing_demo(encrypted_ballot: CiphertextBallot): string{
  return JSON.stringify(encrypted_ballot, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    else if (typeof value === "number" && !deserialize_toHex_banlist.includes(key)) {
      return value.toString(16);
    } else if (typeof value === "boolean") {
      return value == false ? "00" : "01";
    }
    return value;
  }, '\t');
}


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function object_log(object_to_log: any): string{
  return JSON.stringify(object_to_log, (key, value) => {
    key;
    if (typeof value === "bigint") {
      return value.toString();
    }
    // else if (typeof value === "number" && !deserialize_toHex_banlist.includes(key)) {
    //   return value.toString(16);
    // } else if (typeof value === "boolean") {
    //   return value == false ? "00" : "01";
    // }
    return value;
  }, '\t');
}
