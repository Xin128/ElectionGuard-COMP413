import { ElGamalKeyPair, elgamal_keypair_from_secret } from "../elgamal";
import { add_q, ElementModQ, ONE_MOD_Q, TWO_MOD_Q } from "../group";
import { elements_mod_q, elements_mod_q_no_zero } from "../groupUtils";
import { encrypt_ballots } from "../simple_elections";
import { CiphertextBallot, PlaintextBallot, PlaintextSelection, PrivateElectionContext } from "../simple_election_data";
import { get_optional } from "../utils";
import { Ballot, BallotItem } from "./typical_ballot_data";

/**
 * Ballot ==> Whole Election 
 * BallotItem ==> A single question on the ballot
 * BallotOption ==> A single option on a question
 */

export function ballot2PlainTextBallots(ballot: Ballot): PlaintextBallot[] {
    let ballots: PlaintextBallot[] = [];
    ballot.ballotItems.forEach((ballotItem) => {
        ballots = [...ballots, ballotItem2PlainTextBallot(ballotItem)];
    });
    return ballots;
}

export function ballotItem2PlainTextBallot(ballotItem: BallotItem): PlaintextBallot {
    let selections: PlaintextSelection[] = ballotItem2Selection(ballotItem);
    return new PlaintextBallot(ballotItem.id, selections);
}

export function ballotItem2Selection(ballotItem: BallotItem): PlaintextSelection[] {
    let plainTextSelections: PlaintextSelection[] = [];
    ballotItem.ballotOptions.forEach((ballotOption) => {
        // MISSING: Candidate name from ballotOption
        // what would be the correct field for the selection? Ours assume a candidate name
        plainTextSelections = [...plainTextSelections, new PlaintextSelection(ballotOption.writeInSelection, ballotOption.selected === true? 1 : 0)]
    });
    return plainTextSelections;
}

export function ballot2Context(ballot: Ballot): PrivateElectionContext {

    // MISSING: candidate name lists
    // construct the names list for candidates from ballot
    // now assume partyName contains all the candidates name
    let names: Set<string> = new Set();
    ballot.partyName.forEach((n) => {
        names.add(n.text);
    });
    let namesArr = [...names.values()];
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
