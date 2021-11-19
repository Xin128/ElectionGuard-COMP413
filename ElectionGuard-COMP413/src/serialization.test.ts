import {
  // contest_from,
  // create_ballot_hash,
  encrypt_ballot,
  // encrypt_selection
} from "./simple_elections";
import {get_optional} from "./utils";
import {
  encrypt_compatible_testing_demo,
  from_file_to_class,
  from_file_to_class_manifest,
  from_file_to_PlaintextBallot,
  // object_log,
  simple_ballot_json,
  manifest_json,
  export2File,
  from_file_to_PlaintextBallots,
  object_log,
  from_test_file_to_valid_inputs,
  EncryptInput, // hex_to_bigint
} from "./serialization";
import {
  // CiphertextBallotSelection,
  // make_ciphertext_ballot,
  make_ciphertext_election_context,
  PlaintextBallot } from "./simple_election_data";
import { ElementModQ,ElementModP } from "./group";
// import { hash_elems } from "./hash";

import {InternalManifest} from "./manifest";
import fs from 'fs';

describe("TestDeserialization", () => {

  test('testConvertJsonFileToObj', () => {
    if (!fs.existsSync('encrypted_data/' )){
      fs.mkdirSync('encrypted_data/');
    }
   fs.readdirSync('generated_data').forEach(ballotNum => {
    // const encryped_ballot = encrypt_ballot(undefined, undefined, undefined, undefined, undefined);
    // let ballotNum = `106`;
    const plaintextBallots: PlaintextBallot[] = from_file_to_PlaintextBallots("generated_data/" + ballotNum + "/ballot.json");
    // let encrypted_ballots: string[] = [];

    // const plaintextBallot: PlaintextBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    const inputs = from_file_to_class();
    // const encryption_seed = hash_elems([inputs.manifest_hash, inputs.object_id, inputs.nonce]);
    // console.log("encryption seed!", encryption_seed)
    const readin_manifest = from_file_to_class_manifest("generated_data/"  + ballotNum + "/manifest.json");
    // console.log("readin manifest ", readin_manifest.crypto_hash());
    const internal_manifest = new InternalManifest(readin_manifest);
    const context = make_ciphertext_election_context(
      1,
      1,
      new ElementModP(BigInt("830647157921994533723221005688631837480749398093445682001345686145740504886693557419420287148894620628327687420710726184348492930161894426493567555053596304649756865662220152329151716691934339041489536445247808117192732474571762845305844818677676027235934920872239155120388422503195221344180333410127696131933518090047779221829662472818614236336581270341516530022704420443521097772128662124700211839211210908721533915110539300139766705909309815876793687494911116485149385267865330061438844344021027447760903959136805223414385040803151787918988887581567106728305638458450493532895134074416008333717556907440325422540005263755609440349926174900556055858298011233206372856463781327705746366049681672365068236528055877038951830996931086933850260432495637363415002875938135062292231445719262483613467991371369722352993560079282071699535196245817558663511296549603008092897623602899067100100046991701043923308908034328428840035795408907896272755397659393862126111128719708642351119960293861305660688827861839076070133848354823436507263419927109258160045333741762936765504361331647521583134171766657762829386224953145958922580767709905067103552647337580390689696044087562378269531673703889514970340624863075080886563924366245877576117478210")),
      new ElementModQ(2),
      internal_manifest.manifest.crypto_hash(),
      // new ElementModQ(BigInt("88136692332113344175662474900446441286169260372780056734314948839391938984061")),//python manifest hash
      // new ElementModQ(14227),
      undefined);
    // console.log("context is ", context);
    const encryption_seed = new ElementModQ(BigInt('88136692332113344175662474900446441286169260372780056734314948839391938984061'));
    let idx = 0;
    for (let plaintextBallot of plaintextBallots) {
      const encrypted_ballot = encrypt_ballot(plaintextBallot, internal_manifest, context, encryption_seed, get_optional(inputs.nonce));
      if (!fs.existsSync('encrypted_data/' + ballotNum)){
        fs.mkdirSync('encrypted_data/' + ballotNum);
      }
      fs.writeFileSync(`encrypted_data/${ballotNum}/encrypted_ballot_${ballotNum}-${idx}.json`, encrypt_compatible_testing_demo(get_optional(encrypted_ballot)));
      idx++;
      // console.log(encrypt_compatible_testing_demo(get_optional(encrypted_ballot)));
    }

    // output encrypted_ballot to json file
    // fs.writeFileSync('test_json_testing.json', JSON.stringify(encrypt_compatible_testing_demo(get_optional(encrypted_ballot))));
    // fs.writeFileSync(`electionguard_typescript\\encrypted_ballot_${ballotNum}.json`, encrypted_ballots.toString());

   });
  });

  test('testConvertManifestJsonFileToObj', () => {
    const readin_manifest = from_file_to_class_manifest(manifest_json);
    const internal_manifest = new InternalManifest(readin_manifest);
    // console.log(JSON.stringify(internal_manifest, null, "\t"));
    console.log(internal_manifest.manifest_hash);
  });

  test('testConvertTestVectorsJsonFileToObj', () => {
    let testFolder = `generated_test_inputs`;
    fs.readdirSync(testFolder).forEach(file => {
      const path2TestVector = testFolder + "\\" + file;
      console.log("path2TestVector is ", path2TestVector);
      const encryptInputs: EncryptInput[] = from_test_file_to_valid_inputs(path2TestVector);
      for (let input of encryptInputs) {
          // console.log("encrypt input manifest is ", input.manifest);
          // console.log("encrypt input ballot is ", input.plaintextBallot);
          // console.log("encrypt input output is ", input.output);
          const inputs = from_file_to_class();
          const internal_manifest = new InternalManifest(input.manifest);
          const context = make_ciphertext_election_context(
          1,
          1,
          new ElementModP(BigInt("830647157921994533723221005688631837480749398093445682001345686145740504886693557419420287148894620628327687420710726184348492930161894426493567555053596304649756865662220152329151716691934339041489536445247808117192732474571762845305844818677676027235934920872239155120388422503195221344180333410127696131933518090047779221829662472818614236336581270341516530022704420443521097772128662124700211839211210908721533915110539300139766705909309815876793687494911116485149385267865330061438844344021027447760903959136805223414385040803151787918988887581567106728305638458450493532895134074416008333717556907440325422540005263755609440349926174900556055858298011233206372856463781327705746366049681672365068236528055877038951830996931086933850260432495637363415002875938135062292231445719262483613467991371369722352993560079282071699535196245817558663511296549603008092897623602899067100100046991701043923308908034328428840035795408907896272755397659393862126111128719708642351119960293861305660688827861839076070133848354823436507263419927109258160045333741762936765504361331647521583134171766657762829386224953145958922580767709905067103552647337580390689696044087562378269531673703889514970340624863075080886563924366245877576117478210")),
          new ElementModQ(2),
          internal_manifest.manifest.crypto_hash(),
          undefined);
          // console.log("internal manifest is ", internal_manifest);
          // console.log("input nounce is ", inputs.nonce);
          const encryption_seed = new ElementModQ(BigInt('88136692332113344175662474900446441286169260372780056734314948839391938984061'));
          const encrypted_ballot = get_optional(encrypt_ballot(input.plaintextBallot, internal_manifest, context, encryption_seed, get_optional(inputs.nonce)));
          // console.log("encrypted ballot crypto hash is ", get_optional(encrypted_ballot).crypto_hash);
          expect(encrypted_ballot.crypto_hash.equals(input.output)).toBe(true);
      }
    });

  });

  test('testWriteJson2File', async () => {
    export2File();
  });

  test('testReadFromFile', () => {
    let compareBallot = from_file_to_PlaintextBallot(simple_ballot_json);
    console.log("compare ballot is ", object_log(compareBallot));

    let ballots = from_file_to_PlaintextBallots("generated_data/ballots.json");
    for (let ballot of ballots) {
      console.log("plaintextballots are ", object_log(ballot));
      // for (let contest of ballot.contests) {
      //   for (let selection of contest.ballot_selections) {
      //     console.log("selections are ", selection);
      //   }
      // }

    }
  });

  test('testReadDirectory', () => {
    let folderName = `generated_test_inputs`;
    fs.readdirSync(folderName).forEach((file) => {
      console.log("filename is ", file)
      console.log("path is ", folderName + "\\" + file);
    })
  })
});
