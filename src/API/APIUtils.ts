import { ElGamalKeyPair, elgamal_keypair_from_secret } from "../elgamal";
import { add_q, ElementModQ, ONE_MOD_Q, TWO_MOD_Q } from "../group";
import { elements_mod_q, elements_mod_q_no_zero } from "../groupUtils";
import { encrypt_ballot, encrypt_ballots } from "../simple_elections";
import { CiphertextBallot, PlaintextBallot, PlaintextBallotContest, PlaintextBallotSelection, PrivateElectionContext } from "../simple_election_data";
import { get_optional } from "../utils";
import { Ballot, BallotItem, BallotOption, EncryptBallotOutput} from "./typical_ballot_data";
import {QRCode, ErrorCorrectLevel} from "qrcode-generator-ts";

/**
 * Ballot ==> Whole Election 
 * BallotItem ==> A single question on the ballot
 * BallotOption ==> A single option on a question
 */

// Entry point of the API, give a Ballot item, return the seed and the hash
export function encryptBallot(inputBallot: Ballot): EncryptBallotOutput {
    // const electionBallot = buildFakeBallot();
    const ballot = ballot2PlainTextBallot(inputBallot);
    const context = ballot2Context(inputBallot); 
    const seed_nonce:ElementModQ = elements_mod_q_no_zero();
    const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(context, ballot, seed_nonce));
    return new EncryptBallotOutput(seed_nonce.elem.toString(), encrypted_ballot.crypto_hash_with(seed_nonce).toString());
}

export function getQRCode(str:string):any {
    let qr = new QRCode();
    qr.setTypeNumber(5);
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L);
    qr.addData(str);
    qr.make();

    let img = document.createElement('img');
    img.setAttribute('src', qr.toDataURL() );

    return img;
}

export function ballot2PlainTextBallot(ballot: Ballot): PlaintextBallot {
    let ballotContests: PlaintextBallotContest[] = [];
    ballot.ballotItems.forEach((ballotItem) => {
        ballotContests = [...ballotContests, ballotItem2PlainTextBallotContest(ballotItem)];
    });

    return new PlaintextBallot(ballot.id, ballotContests);
}

export function ballotItem2PlainTextBallotContest(ballotItem: BallotItem): PlaintextBallotContest {
    const selections: PlaintextBallotSelection[] = ballotItem2Selection(ballotItem);
    return new PlaintextBallotContest(selections);
}

export function ballotItem2Selection(ballotItem: BallotItem): PlaintextBallotSelection[] {
    let plainTextSelections: PlaintextBallotSelection[] = [];
    ballotItem.ballotOptions.forEach((ballotOption) => {
        // MISSING: Candidate name from ballotOption
        // what would be the correct field for the selection? Ours assume a candidate name
        plainTextSelections = [...plainTextSelections, new PlaintextBallotSelection(ballotOption.writeInSelection, ballotOption.selected === true? 1 : 0)]
    });
    return plainTextSelections;
}

export function ballot2Context(ballot: Ballot): PrivateElectionContext {

    // construct the names list for candidates from ballot
    const names: Set<string> = new Set();
    ballot.ballotItems.forEach((ballotItem) => {
        ballotItem.ballotOptions.forEach((ballotOption) => names.add(ballotOption.title[0].text));
    });
    const namesArr = [...names.values()];
    const e:ElementModQ = elements_mod_q_no_zero();
    const keypair:ElGamalKeyPair = get_optional(elgamal_keypair_from_secret(e.notEqual(ONE_MOD_Q) ? e : TWO_MOD_Q));
    const base_hash:ElementModQ = elements_mod_q();

    return new PrivateElectionContext(ballot.electionName[0].text, namesArr, keypair, base_hash);
}



export function ballot2JSON(ballots: PlaintextBallot[], context: PrivateElectionContext) : any {

    // Is type any safe
    const seed_nonce:ElementModQ = elements_mod_q_no_zero();
    const encrypted_ballots: CiphertextBallot[] = get_optional(encrypt_ballots(context, ballots, seed_nonce));
    let final_hash = new ElementModQ(0n);
    encrypted_ballots.forEach(eBallot => {
        final_hash = add_q(final_hash, eBallot.crypto_hash_with(seed_nonce));
    });

    return JSON.parse(JSON.stringify({seed: seed_nonce.elem.toString(), hash: final_hash.elem.toString()}));
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
