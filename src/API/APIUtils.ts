import { PlaintextBallot, PlaintextSelection } from "../simple_election_data";
import { Ballot, BallotItem } from "./typical_ballot_data";

export function ballot2PlainTextBallot(ballot: Ballot): PlaintextBallot {
    let selections: PlaintextSelection[] = [];
    return new PlaintextBallot("", [new PlaintextSelection("", 0)]);
}

export function ballotItem2Selection(ballotItem: BallotItem): PlaintextSelection {
    return new PlaintextSelection("", 0);
}