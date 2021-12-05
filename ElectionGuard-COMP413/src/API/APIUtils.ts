import {add_q, ElementModP, ElementModQ} from "../group";
import {elements_mod_q_no_zero } from "../groupUtils";
import { encrypt_ballot } from "../simple_elections";
import {
    CiphertextBallot,
    CiphertextElectionContext, make_ciphertext_election_context,
    PlaintextBallot,
    PlaintextBallotContest,
    PlaintextBallotSelection,
} from "../simple_election_data";
import { get_optional } from "../utils";
import { Ballot, BallotItem, BallotOption, EncryptBallotOutput, ErrorBallotInput, ErrorType} from "./typical_ballot_data";
import {QRCode, ErrorCorrectLevel} from "qrcode-generator-ts";

import {
    InternalManifest,
    Manifest,
    Party,
    Candidate,
    GeopoliticalUnit,
    ContestDescription,
    BallotStyle,
    ElectionType,
    ReportingUnitType,
    InternationalizedText,
    Language,
    VoteVariationType,
    SelectionDescription,
    ContactInformation, AnnotatedString
} from "../manifest"
import {download} from "../index";
import {deserialize_toHex_banlist} from "../serialization_browser";
/**
 * Ballot ==> Whole Election
 * BallotItem ==> A single question on the ballot
 * BallotOption ==> A single option on a question
 */

// Give a Ballot item, return the ciphertext ballot
export function encryptBallot_ballotOut(inputBallot: Ballot,
                                        manifest: Manifest):  CiphertextBallot{
  const ballot = ballot2PlainTextBallot(inputBallot);
  const internalManifest: InternalManifest = new InternalManifest(manifest);
  const context = ballot2Context(inputBallot, internalManifest);
  const seed_nonce:ElementModQ =  new ElementModQ(BigInt("40358"));
  const encryption_seed: ElementModQ = new ElementModQ(BigInt("88136692332113344175662474900446441286169260372780056734314948839391938984061"));
  // console.log("before encrypt_ballot!")
  // console.log(ballot);
  const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(ballot, internalManifest, context, encryption_seed, seed_nonce));
  return encrypted_ballot;
}

export function cipherTextBallot_to_EncryptBallotOutput(encrypted_ballot: CiphertextBallot, seed_nonce:ElementModQ) {
  return new EncryptBallotOutput(seed_nonce.elem.toString(), encrypted_ballot.crypto_hash_with(seed_nonce).toString());
}
// Entry point of the API, give a Ballot item, return the seed and the hash
// Return an ErrorBallotInput in case some fields that are required in encryption in Ballot is missing
export function encryptBallot(inputBallot: Ballot, manifest: Manifest): EncryptBallotOutput | ErrorBallotInput {
    // let validatedBallot = validateBallot(inputBallot);
    // if (validatedBallot instanceof ErrorBallotInput) return validatedBallot;
    const ballot = ballot2PlainTextBallot(inputBallot);
    // console.log(ballot);
    const internalManifest: InternalManifest = new InternalManifest(manifest);
    const context = ballot2Context(inputBallot, internalManifest);
    const seed_nonce:ElementModQ =  new ElementModQ(BigInt("40358"));
    const encryption_seed: ElementModQ = new ElementModQ(BigInt("88136692332113344175662474900446441286169260372780056734314948839391938984061"));

    const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(ballot, internalManifest, context, encryption_seed, seed_nonce));
    // console.log("plaintextballot");
    // console.log(ballot);
    // console.log("encrypted_ballot");
    // console.log(encrypted_ballot);
    // console.log("internal manifest");
    // console.log(internalManifest)

    // download(JSON.stringify(ballot, (key, value) => {
    //     if (typeof value === "bigint") {
    //         return value.toString();
    //     }
    //     else if (typeof value === "number" && !deserialize_toHex_banlist.includes(key)) {
    //         return value.toString(10);
    //     } else if (typeof value === "boolean") {
    //         return value == false ? "00" : "01";
    //     }
    //     return value;
    // }, '\t'), 'plaintext_ballot.json', 'text/plain');

    // download(JSON.stringify(encrypted_ballot, (key, value) => {
    //     if (typeof value === "bigint") {
    //         return value.toString();
    //     }
    //     else if (typeof value === "number" && !deserialize_toHex_banlist.includes(key)) {
    //         return value.toString(10);
    //     } else if (typeof value === "boolean") {
    //         return value == false ? "00" : "01";
    //     }
    //     return value;
    // }, '\t'), 'encrypted_ballot.json', 'text/plain');


    return new EncryptBallotOutput(seed_nonce.elem.toString(), encrypted_ballot.crypto_hash.to_hex().toString());
}

/**
 * This function will take in a string and generate a QR code
 * @param strs strings that will be represented in QR code
 */
export function getQRCode(strs:string[]):any {
    const qr = new QRCode();
    // size difference found over here: https://snyk.io/advisor/npm-package/qr-code-typescript
    qr.setTypeNumber(9);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
    strs.forEach((str) => qr.addData(str));
    qr.make();

    const img = document.createElement('img');
    img.setAttribute('src', qr.toDataURL() );

    return img;
}

/**
 * Convert a Ballot defined in typical_ballot_data.ts to internal PlaintextBallot data structure
 * @param ballot a ballot defined in typical_ballot_data.ts
 */
export function ballot2PlainTextBallot(ballot: Ballot): PlaintextBallot {
    let ballotContests: PlaintextBallotContest[] = [];
    for (let k = 0; k < ballot.ballotItems.length; k++) {
        console.log(ballot.ballotItems[k]);
    }

    ballot.ballotItems.forEach((ballotItem) => {
        ballotContests = [...ballotContests, ballotItem2PlainTextBallotContest(ballotItem)];
    });
    const style_id = ballot.electionName[0].text;

    return new PlaintextBallot(ballot.id, style_id, ballotContests);
}

/**
 * Convert a BallotItem defined in typical_ballot_data.ts to internal PlaintextBallotContest
 * @param ballotItem a BallotItem defined in typical_ballot_data.ts
 */
export function ballotItem2PlainTextBallotContest(ballotItem: BallotItem): PlaintextBallotContest {
    const selections: PlaintextBallotSelection[] = ballotItem2Selection(ballotItem);

    return new PlaintextBallotContest(ballotItem.id, ballotItem.order, selections);
}

/**
 * Convert a BallotItem defined in typical_ballot_data.ts to a list of internal PlaintextBallotSelection
 * @param ballotItem defined in typical_ballot_data.ts that contains a list of selections
 */
export function ballotItem2Selection(ballotItem: BallotItem): PlaintextBallotSelection[] {
    let plainTextSelections: PlaintextBallotSelection[] = [];
    ballotItem.ballotOptions.forEach((ballotOption) => {
        if (ballotOption.selected) {
            plainTextSelections = [new PlaintextBallotSelection(ballotOption.object_id, ballotOption.order, ballotOption.selected? 1 : 0, false)]
        }
        // plainTextSelections = [...plainTextSelections, new PlaintextBallotSelection(ballotOption.object_id, ballotOption.order, ballotOption.selected? 1 : 0, false)]
    });
    return plainTextSelections;
}

/**
 * Construct a internal CiphertextElectionContext with Ballot and InternalManifest
 * @param ballot a ballot defined in typical_ballot_data.ts
 * @param internalManifest an InternalManifest build by Manifest
 */
export function ballot2Context(ballot: Ballot, internalManifest: InternalManifest): CiphertextElectionContext {

    // construct the names list for candidates from ballot
    const names: Set<string> = new Set();
    ballot.ballotItems.forEach((ballotItem) => {
        ballotItem.ballotOptions.forEach((ballotOption) => {
            names.add(ballotOption.object_id);
        });
    });

    const number_of_guardians = 1;
    const quorum = 1;
    const elgamal_public_key:ElementModP = new ElementModP(BigInt("830647157921994533723221005688631837480749398093445682001345686145740504886693557419420287148894620628327687420710726184348492930161894426493567555053596304649756865662220152329151716691934339041489536445247808117192732474571762845305844818677676027235934920872239155120388422503195221344180333410127696131933518090047779221829662472818614236336581270341516530022704420443521097772128662124700211839211210908721533915110539300139766705909309815876793687494911116485149385267865330061438844344021027447760903959136805223414385040803151787918988887581567106728305638458450493532895134074416008333717556907440325422540005263755609440349926174900556055858298011233206372856463781327705746366049681672365068236528055877038951830996931086933850260432495637363415002875938135062292231445719262483613467991371369722352993560079282071699535196245817558663511296549603008092897623602899067100100046991701043923308908034328428840035795408907896272755397659393862126111128719708642351119960293861305660688827861839076070133848354823436507263419927109258160045333741762936765504361331647521583134171766657762829386224953145958922580767709905067103552647337580390689696044087562378269531673703889514970340624863075080886563924366245877576117478210"));
    const commitment_hash: ElementModQ = new ElementModQ(2);
    const manifest_hash: ElementModQ = internalManifest.manifest.crypto_hash();
    const extended_data = undefined;
    return make_ciphertext_election_context(number_of_guardians, quorum, elgamal_public_key, commitment_hash, manifest_hash, extended_data);
}


/**
 * Convert a PlaintextBallot to JSON
 * @param ballot a ballot defined in typical_ballot_data.ts
 * @param context a context of type CiphertextElectionContext
 * @param manifest a manifest of type Manifest
 */
export function ballot2JSON(ballot: PlaintextBallot, context: CiphertextElectionContext, manifest: Manifest) : any {

    // Is type any safe
    const seed_nonce:ElementModQ =  new ElementModQ(BigInt("40358"));
    const internalManifest: InternalManifest = new InternalManifest(manifest);
    const encryption_seed: ElementModQ = new ElementModQ(BigInt("88136692332113344175662474900446441286169260372780056734314948839391938984061"));
    const encrypted_ballots: CiphertextBallot[] = [get_optional(encrypt_ballot(ballot, internalManifest, context, encryption_seed, seed_nonce))];
    let final_hash = new ElementModQ(0n);
    encrypted_ballots.forEach(eBallot => {
        final_hash = add_q(final_hash, eBallot.crypto_hash_with(seed_nonce));
    });

    return JSON.parse(JSON.stringify({seed: seed_nonce.elem.toString(), hash: final_hash.elem.toString()}));
}

/**
 * Build a Ballot from a JSON defined by Aaron
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildBallot(ballot: any): Ballot {
    let contests:BallotItem[] = [];
    for(let i = 0; i < ballot.ballotItems.length; i++) {
        let ballotOptions: BallotOption[] = [];
        for(let j = 0; j < ballot.ballotItems[i].ballotOptions.length; j++) {
            const ballotOption = new BallotOption(ballot.ballotItems[i].ballotOptions[j].id, ballot.ballotItems[i].ballotOptions[j].selected,  ballot.ballotItems[i].ballotOptions[j].order);
            ballotOptions = [...ballotOptions, ballotOption];
        }
        const contest: BallotItem = new BallotItem(ballot.ballotItems[i].id, ballot.ballotItems[i].order, ballotOptions);
        contests = [...contests, contest];
    }
    const electionBallot = new Ballot(makeId(15), ballot.electionName[0].text, contests);
    // print(electionBallot)

    return electionBallot;
}

/**
 * Construct a Manifest using JSON ballot
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildManifest(manifest: any): Manifest {

    // same as name of this election
    const election_scope_id: string = manifest.election_scope_id;
    // we do not have spec version in our code
    const spec_version = manifest.spec_version;
    // we do not have the election type from the ballot
    const type: ElectionType = ElectionType.unknown;
    // we assume start date and end date are the same since we only have start date from the ballot
    const start_date: Date = manifest.start_date;
    const end_date: Date = manifest.end_date;

    let geopolitical_units: GeopoliticalUnit[] = [];
    let parties: Party[] = [];
    let candidates: Candidate[] = [];
    let contests: ContestDescription[] = [];
    let ballot_styles: BallotStyle[] = [];

    const language : Language = new Language(manifest.name.text[0].value, 'en');
    const interText: InternationalizedText = new InternationalizedText([language]);
    // same as name of this election
    const name = interText;

    const emailAnnotation : AnnotatedString = new AnnotatedString("office", "a@b.c");
    const phoneAnnotation : AnnotatedString = new AnnotatedString("office", "111-111-1111");
    const contactInfo : ContactInformation = new ContactInformation(["6100 Main St, Houston, TX"], [emailAnnotation], [phoneAnnotation], "Rice University");



    geopolitical_units = buildGeopoliticalUnit(manifest);
    parties = buildParty(manifest);
    candidates = buildCandidate(manifest);
    contests = buildContest(manifest);
    ballot_styles = buildBallotStyle(manifest);

    return new Manifest(election_scope_id, spec_version, type, start_date, end_date, geopolitical_units, parties, candidates, contests, ballot_styles, name, contactInfo);
}

/**
 * Construct list of GeopoliticalUnit from ballot. We only take the precinctId and precinctName at Ballot level.
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildGeopoliticalUnit(manifest: any): GeopoliticalUnit[] {
    const object_id = manifest.geopolitical_units[0].object_id;
    const name = manifest.geopolitical_units[0].name;
    const type : ReportingUnitType = ReportingUnitType.precinct;

    return [new GeopoliticalUnit(object_id, name, type)];
}

/**
 * Construct list of Party from ballot. We only take the partyId and partyName at Ballot level.
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildParty(manifest: any): Party[] {
    const object_id = manifest.parties[0].object_id;
    const languageName = new Language(manifest.parties[0].name.text[0].value, "en");
    const name = new InternationalizedText([languageName]);
    return [new Party(object_id, name)]
}

/**
 * Construct list of Candidate from ballot. We take in BallotOption titles in every BallotItem as Candidate names. Notice
 * this will include "Yes" and "No" if a binary choice question appears. However, since the sole purpose of this function
 * is to provide information in hashing, the difference of actual candidates and answer choice does not matter.
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildCandidate(manifest: any): Candidate[] {
    const candidates: Candidate[] = [];
    for (let i = 0; i < manifest.candidates.length; i++) {
        // we do not have candidate id, object_id same as candidate name
        const object_id = manifest.candidates[i].object_id;
        const candidateName = new Language(manifest.candidates[i].name.text[0].value, "en");
        const name = new InternationalizedText([candidateName]);
        const candidate = new Candidate(object_id, name);
        candidates.push(candidate);

    }
    return candidates;
}

/**
 * Construct a ContestDescription from ballot.
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildContest(manifest: any): ContestDescription[] {
    const descriptions: ContestDescription[] = [];
    for (let i = 0; i < manifest.contests.length; i++) {
        const object_id = manifest.contests[i].object_id;
        const sequence_order = manifest.contests[i].sequence_order;
        const electoral_district_id = manifest.contests[i].electoral_district_id;
        const vote_variation = VoteVariationType.unknown;
        // number of candidates are elected
        const number_elected = manifest.contests[i].number_elected;
        const votes_allowed = manifest.contests[i].votes_allowed;
        const name = manifest.contests[i].name;
        const ballot_selections: SelectionDescription[] = [];
        for (let j = 0; j < manifest.contests[i].ballot_selections.length; j++) {
            const option_object_id = manifest.contests[i].ballot_selections[j].object_id;
            const option_sequence_order = manifest.contests[i].ballot_selections[j].sequence_order;
            const option_candidate_id = manifest.contests[i].ballot_selections[j].candidate_id;
            const selection = new SelectionDescription(option_object_id, option_sequence_order, option_candidate_id);
            ballot_selections.push(selection);
        }
        const description = new ContestDescription(object_id, sequence_order, electoral_district_id, vote_variation, number_elected, name, ballot_selections, votes_allowed, undefined, undefined);
        descriptions.push(description);
    }
    return descriptions;
}

/**
 * Construct BallotStyle from ballot
 * @param ballot a ballot of JSON file, currently compatible with Aaron's example
 */
export function buildBallotStyle(manifest: any): BallotStyle[] {
    const object_id = manifest.ballot_styles[0].object_id;
    const geopolitical_unit_ids = [manifest.ballot_styles[0].geopolitical_unit_ids[0]];
    const party_ids = [manifest.ballot_styles[0].party_ids[0]];
    return [new BallotStyle(object_id, geopolitical_unit_ids, party_ids)];
}

export function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export function validateBallot(ballot: Ballot): ErrorBallotInput | null {
    if (ballot.electionName === undefined || ballot.electionName.length === 0) return new ErrorBallotInput(ErrorType.MissingElectionName, "Missing Election Name");
    if (ballot.partyId === undefined) return new ErrorBallotInput(ErrorType.MissingBallotPartyId, "Missing Ballot Party ID");
    if (ballot.partyName === undefined || ballot.partyName.length === 0) return new ErrorBallotInput(ErrorType.MissingBallotPartyName, "Missing Ballot Party Name");
    if (ballot.precinctName === undefined || ballot.partyName.length === 0) return new ErrorBallotInput(ErrorType.MissingPrecinctName, "Missing Precinct Name");
    if (ballot.precinctId === undefined) return new ErrorBallotInput(ErrorType.MissingPrecintId, "Missing Precint ID");
    if (ballot.id === undefined) return new ErrorBallotInput(ErrorType.MissingBallotId, "Missing Ballot ID");
    if (ballot.ballotItems === undefined || ballot.ballotItems.length === 0) return new ErrorBallotInput(ErrorType.MissingBallotItems, "Missing BallotItems");

    ballot.ballotItems.forEach((ballotItem) => {
        if (ballotItem.ballotOptions === undefined || ballotItem.ballotOptions.length === 0) return new ErrorBallotInput(ErrorType.MissingBallotOptions, "Missing BallotOptions");
        ballotItem.ballotOptions.forEach((ballotOption) => {
            if (ballotOption.candidateId === undefined) return new ErrorBallotInput(ErrorType.MissingCandidateId, "Missing Candidate Id");
            if (ballotOption.title === undefined || ballotOption.title.length === 0) return new ErrorBallotInput(ErrorType.MissingCandidateName, "Missing Candidate Name");
            if (ballotOption.partyId === undefined) return new ErrorBallotInput(ErrorType.MissingCandidatePartyId, "Missing Candidate Party ID");
            if (ballotOption.partyName === undefined || ballotOption.partyName.length === 0) return new ErrorBallotInput(ErrorType.MissingCandidatePartyName, "Missing Candidate Party Name");
        });
    });

    return null;
}
