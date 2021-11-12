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

import { InternalManifest, Manifest, Party, Candidate, GeopoliticalUnit, ContestDescription, BallotStyle, ElectionType, ReportingUnitType, InternationalizedText, Language, VoteVariationType, SelectionDescription} from "../manifest"

/**
 * Ballot ==> Whole Election 
 * BallotItem ==> A single question on the ballot
 * BallotOption ==> A single option on a question
 */

// Entry point of the API, give a Ballot item, return the seed and the hash
// Return an ErrorBallotInput in case some fields that are required in encryption in Ballot is missing
export function encryptBallot(inputBallot: Ballot, manifest: Manifest): EncryptBallotOutput | ErrorBallotInput {
    // TODO: First check if the ballot has all the fields we need
    // let validatedBallot = validateBallot(inputBallot);
    // if (validatedBallot instanceof ErrorBallotInput) return validatedBallot;
    const ballot = ballot2PlainTextBallot(inputBallot);
    const internalManifest: InternalManifest = new InternalManifest(manifest);
    const context = ballot2Context(inputBallot, internalManifest);
    const seed_nonce:ElementModQ = elements_mod_q_no_zero();
    const encryption_seed: ElementModQ = new ElementModQ(20343378051997977565960425890866293516410954491475728746271781721241589089163);

    const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(ballot, internalManifest, context, encryption_seed, seed_nonce));
    return new EncryptBallotOutput(seed_nonce.elem.toString(), encrypted_ballot.crypto_hash_with(seed_nonce).toString());
}

export function getQRCode(strs:string[]):any {
    const qr = new QRCode();
    // size difference found over here: https://snyk.io/advisor/npm-package/qr-code-typescript
    qr.setTypeNumber(8);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
    strs.forEach((str) => qr.addData(str));
    qr.make();

    const img = document.createElement('img');
    img.setAttribute('src', qr.toDataURL() );

    return img;
}

export function ballot2PlainTextBallot(ballot: Ballot): PlaintextBallot {
    let ballotContests: PlaintextBallotContest[] = [];
    ballot.ballotItems.forEach((ballotItem) => {
        ballotContests = [...ballotContests, ballotItem2PlainTextBallotContest(ballotItem)];
    });
    const style_id = ballot.electionName[0].text;

    return new PlaintextBallot(ballot.id, style_id, ballotContests);
}

export function ballotItem2PlainTextBallotContest(ballotItem: BallotItem): PlaintextBallotContest {
    const selections: PlaintextBallotSelection[] = ballotItem2Selection(ballotItem);
    return new PlaintextBallotContest(ballotItem.id, ballotItem.order, selections);
}

export function ballotItem2Selection(ballotItem: BallotItem): PlaintextBallotSelection[] {
    let plainTextSelections: PlaintextBallotSelection[] = [];
    ballotItem.ballotOptions.forEach((ballotOption) => {
        // MISSING: Candidate name from ballotOption
        // what would be the correct field for the selection? Ours assume a candidate name
        plainTextSelections = [...plainTextSelections, new PlaintextBallotSelection(ballotOption.id, ballotOption.order, ballotOption.selected? 1 : 0, false)]
    });
    return plainTextSelections;
}

export function ballot2Context(ballot: Ballot, internalManifest: InternalManifest): CiphertextElectionContext {

    // construct the names list for candidates from ballot
    const names: Set<string> = new Set();
    ballot.ballotItems.forEach((ballotItem) => {
        ballotItem.ballotOptions.forEach((ballotOption) => names.add(ballotOption.title[0].text));
    });

    const number_of_guardians = 1;
    const quorum = 1;
    const elgamal_public_key:ElementModP = new ElementModP(BigInt("830647157921994533723221005688631837480749398093445682001345686145740504886693557419420287148894620628327687420710726184348492930161894426493567555053596304649756865662220152329151716691934339041489536445247808117192732474571762845305844818677676027235934920872239155120388422503195221344180333410127696131933518090047779221829662472818614236336581270341516530022704420443521097772128662124700211839211210908721533915110539300139766705909309815876793687494911116485149385267865330061438844344021027447760903959136805223414385040803151787918988887581567106728305638458450493532895134074416008333717556907440325422540005263755609440349926174900556055858298011233206372856463781327705746366049681672365068236528055877038951830996931086933850260432495637363415002875938135062292231445719262483613467991371369722352993560079282071699535196245817558663511296549603008092897623602899067100100046991701043923308908034328428840035795408907896272755397659393862126111128719708642351119960293861305660688827861839076070133848354823436507263419927109258160045333741762936765504361331647521583134171766657762829386224953145958922580767709905067103552647337580390689696044087562378269531673703889514970340624863075080886563924366245877576117478210"));
    const commitment_hash: ElementModQ = new ElementModQ(2);
    const manifest_hash: ElementModQ = internalManifest.manifest.crypto_hash();
    const extended_data = undefined;



    return make_ciphertext_election_context(number_of_guardians, quorum, elgamal_public_key, commitment_hash, manifest_hash, extended_data);
}




export function ballot2JSON(ballot: PlaintextBallot, context: CiphertextElectionContext, manifest: Manifest) : any {

    // Is type any safe
    const seed_nonce:ElementModQ = elements_mod_q_no_zero();
    const internalManifest: InternalManifest = new InternalManifest(manifest);
    const encryption_seed: ElementModQ = new ElementModQ(20343378051997977565960425890866293516410954491475728746271781721241589089163);
    const encrypted_ballots: CiphertextBallot[] = [get_optional(encrypt_ballot(ballot, internalManifest, context, encryption_seed, seed_nonce))];
    let final_hash = new ElementModQ(0n);
    encrypted_ballots.forEach(eBallot => {
        final_hash = add_q(final_hash, eBallot.crypto_hash_with(seed_nonce));
    });

    return JSON.parse(JSON.stringify({seed: seed_nonce.elem.toString(), hash: final_hash.elem.toString()}));
}


export function buildBallot(ballot: any): Ballot {
    let contests:BallotItem[] = [];
    for(let i = 0; i < ballot.ballotItems.length; i++) {
        let ballotOptions: BallotOption[] = [];
        for(let j = 0; j < ballot.ballotItems[i].ballotOptions.length; j++) {
            const ballotOption = new BallotOption(ballot.ballotItems[i].ballotOptions[j].title[0].text, ballot.ballotItems[i].ballotOptions[j].selected);
            ballotOptions = [...ballotOptions, ballotOption];
        }
        const contest: BallotItem = new BallotItem(ballotOptions);
        contests = [...contests, contest];
    }
    const electionBallot = new Ballot(ballot.id, ballot.electionName[0].text, contests);

    return electionBallot;
}

// this function builds a manifest from given ballot
export function buildManifest(ballot: any): Manifest {

    // same as name of this election
    const election_scope_id: string = ballot.electionName[0].text;
    // we do not have spec version in our code
    const spec_version = "spec_version";
    // we do not have the election type from the ballot
    const type: ElectionType = ElectionType.unknown;
    // we assume start date and end date are the same since we only have start date from the ballot
    const start_date: Date = new Date(ballot.text1[0].text);
    const end_date: Date = new Date(ballot.text1[0].text);

    let geopolitical_units: GeopoliticalUnit[] = [];
    let parties: Party[] = [];
    let candidates: Candidate[] = [];
    let contests: ContestDescription[] = [];
    let ballot_styles: BallotStyle[] = [];

    // same as name of this election
    const name = ballot.electionName[0].text;

    geopolitical_units = buildGeopoliticalUnit(ballot);
    parties = buildParty(ballot);
    candidates = buildCandidate(ballot);
    contests = buildContest(ballot);
    ballot_styles = buildBallotStyle(ballot);

    return new Manifest(election_scope_id, spec_version, type, start_date, end_date, geopolitical_units, parties, candidates, contests, ballot_styles, name);
}

export function buildGeopoliticalUnit(ballot: any): GeopoliticalUnit[] {
    const object_id = ballot.precinctId;
    const name = ballot.precinctName;
    const type : ReportingUnitType = ReportingUnitType.precinct;

    return [new GeopoliticalUnit(object_id, name, type)];
}

export function buildParty(ballot: any): Party[] {
    const object_id = ballot.partyId;
    const languageName = new Language(ballot.partyName[0].text, "en");
    const name = new InternationalizedText([languageName]);
    return [new Party(object_id, name)]
}

export function buildCandidate(ballot: any): Candidate[] {
    const candidates: Candidate[] = [];
    for (let i = 0; i < ballot.ballotItems.length; i++) {
        for (let j = 0; j < ballot.ballotItems[i].ballotOptions.length; j++) {
            // we do not have candidate id, object_id same as candidate name
            const object_id = ballot.ballotItems[i].ballotOptions[j].title[0].text;
            const candidateName = new Language(ballot.ballotItems[i].ballotOptions[j].title[0].text, "en");
            const name = new InternationalizedText([candidateName]);
            const candidate = new Candidate(object_id, name);
            candidates.push(candidate);
        }
    }
    return candidates;
}

export function buildContest(ballot: any): ContestDescription[] {
    const descriptions: ContestDescription[] = [];
    for (let i = 0; i < ballot.ballotItems.length; i++) {
        const object_id = ballot.ballotItems[i].id;
        const sequence_order = ballot.ballotItems[i].order;
        const electoral_district_id = ballot.precinctId;
        const vote_variation = VoteVariationType.unknown;
        // number of candidates are elected
        //TODO: double check with Aaron on how this can be extrapolated from the
        const number_elected = 0;
        const votes_allowed = undefined;
        const name = ballot.ballotItems[i].title[0].text;
        const ballot_selections: SelectionDescription[] = [];
        for (let j = 0; j < ballot.ballotItems[i].ballotOptions.length; j++) {
            const option_object_id = ballot.ballotItems[i].ballotOptions[j].id;
            const option_sequence_order = ballot.ballotItems[i].ballotOptions[j].order;
            const option_candidate_id = ballot.ballotItems[i].ballotOptions[j].title[0].text;
            const selection = new SelectionDescription(option_object_id, option_sequence_order, option_candidate_id);
            ballot_selections.push(selection);
        }
        const description = new ContestDescription(object_id, sequence_order, electoral_district_id, vote_variation, number_elected, name, ballot_selections, votes_allowed, undefined, undefined);
        descriptions.push(description);
    }
    return descriptions;
}

export function buildBallotStyle(ballot: any): BallotStyle[] {
    const object_id = ballot.electionName[0].text;
    const geopolitical_unit_ids = [ballot.precinctId];
    const party_ids = [ballot.partyId];
    return [new BallotStyle(object_id, geopolitical_unit_ids, party_ids)];
}

// Only used for testing
export function buildFakeBallot(): Ballot {
    const names = ['James Miller', 'Liam Garcia','Olivia Brown','Charlotte Li', 'Ava Nguyen', 'Mizu Sawa', 'Park Shu', 'Van Darkholme', 'Wang Jo Jo', 'Ted Budd'];

    // build a fake ballot item
    let ballotOptions1: BallotOption[] = [];
    let ballotOptions2: BallotOption[] = [];
    names.forEach((name, idx) => {
        if (idx < names.length / 2) {
            const ballotOption = new BallotOption(name, false);
            // console.log("ballot1 ballotoptions ", ballotOptions1);
            ballotOptions1 = [...ballotOptions1, ballotOption];
        } else {
            const ballotOption = new BallotOption(name, false);
            ballotOptions2 = [...ballotOptions2, ballotOption];
        }
    });
    const contest1 = new BallotItem(ballotOptions1);
    const contest2 = new BallotItem(ballotOptions2);
    // hard code the selected options, the second contest doesn't select anything
    contest1.ballotOptions[0].selected = true;
    

    // add ballotItem to electionBallot
    // build a ballot
    const electionBallot = new Ballot("001", "firstTest", [contest1, contest2]);
    console.log("the current ballot is ", electionBallot);
    return electionBallot;
}

export function buildLargeFakeBallot(count: number): Ballot {

    const names = ['James Miller', 'Liam Garcia', 'Olivia Brown', 'Charlotte Li', 'Ava Nguyen', 'Mizu Sawa', 'Park Shu', 'Van Darkholme', 'Wang Jo Jo', 'Ted Budd'];
    const contests: BallotItem[] = [];
    for (let i = 0; i < count; i++) {
        let ballotOptions1: BallotOption[] = [];
        names.forEach((name) => {
            const ballotOption = new BallotOption(name, false);
            // console.log("ballot1 ballotoptions ", ballotOptions1);
            ballotOptions1 = [...ballotOptions1, ballotOption];
        });
        const contest1 = new BallotItem(ballotOptions1);
        contests.push(contest1);
    }

    // add ballotItem to electionBallot
    // build a ballot
    const electionBallot = new Ballot("001", "firstTest", contests);

    console.log("the current ballot is ", electionBallot);

    return electionBallot;
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
