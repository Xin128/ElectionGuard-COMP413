import { DisjunctiveChaumPedersenProof,
    ChaumPedersenDecryptionProof,
    ConstantChaumPedersenProof } from "./chaum_pedersen"

import {ElGamalCiphertext, ElGamalKeyPair} from "./elgamal"
import {ElementModP, ElementModQ} from "./group"


export class PlaintextBallot {
    ballot_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding encryption of this ballot.
    contests: PlaintextBallotContest[];
    // The list of contests for this ballot
    public constructor(ballot_id: string, contests: PlaintextBallotContest[]){
        this.ballot_id = ballot_id;
        this.contests = contests;
    }
}

export class PlaintextBallotContest{

    selections: PlaintextBallotSelection[];
    // The voter's selections. 1 implies a vote for. 0 implies no vote.

    public constructor(selections: PlaintextBallotSelection[]){
        this.selections = selections;
    }

    public num_selections(): number{
        return this.selections.length;
    }

    public is_overvoted(): boolean{
        let votes_cast = 0;
        for(const selection of this.selections){
            votes_cast += selection.choice;
        }
        return votes_cast > 1 ;
    }
}


export class PlaintextBallotSelection{
    name: string;
    // Candidate name

    public choice: number;
    // 1 implies a vote for. 0 implies no vote.
    public constructor(name: string, choice: number){
        this.name = name;
        this.choice = choice;
    }

    public equals(any: PlaintextBallotSelection): boolean {
        return this.name === any.name && this.choice === any.choice;
    }
}

export class CiphertextBallotSelectionTally{
    name: string;
    // Candidate name, or `PLACEHOLDER` for a placeholder selection.

    total: ElGamalCiphertext;
    // Tally of encrypted selections.
    public constructor(name: string, total: ElGamalCiphertext){
        this.name = name;
        this.total = total;
    }
}


export class CiphertextBallot {
    ballot_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot.
    contests: CiphertextBallotContest[];

    public constructor(ballot_id: string, contests: CiphertextBallotContest[]) {
        this.ballot_id = ballot_id;
        this.contests = contests;
    }
}

export class CiphertextBallotContest{

    selections: CiphertextBallotSelection[];
    // Encrypted selections. This will include a "placeholder" selection (with `selection_id` == "PLACEHOLDER"),
    // such that the sum of the encrypted selections is exactly one.

    valid_sum_proof: ConstantChaumPedersenProof;
    // Proof that the sum of the selections (including the placeholder) is exactly one.

    public constructor(selections: CiphertextBallotSelection[], valid_sum_proof: ConstantChaumPedersenProof){
        this.selections = selections;
        this.valid_sum_proof = valid_sum_proof;
    }

    public num_selections(): number{
        return this.selections.length;
    }
}

export class CiphertextBallotSelection{
    name: string;
    // Candidate name, or `PLACEHOLDER` for a placeholder selection.

    ciphertext: ElGamalCiphertext;
    // Encrypted selection.

    zero_or_one_proof: DisjunctiveChaumPedersenProof;
    // Proof that the encrypted selection is either zero or one.
    public constructor(name: string, ciphertext: ElGamalCiphertext, zero_or_one_proof: DisjunctiveChaumPedersenProof){
        this.name = name;
        this.ciphertext = ciphertext;
        this.zero_or_one_proof = zero_or_one_proof;
    }
}

export class PlaintextBallotSelectionWithProof {
    selection: PlaintextBallotSelection;
    // The decrypted version of a ciphertext

    decryption_proof: ChaumPedersenDecryptionProof;
    // Proof that the decrypted version is consistent with the ciphertext

    public constructor(selection: PlaintextBallotSelection, decryption_proof: ChaumPedersenDecryptionProof){
        this.selection = selection;
        this.decryption_proof = decryption_proof;
    }
}

export class PlaintextBallotWithProofs {
    ballot_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot.

    selections: PlaintextBallotSelectionWithProof[];
    // Each selection along with its proof

    public constructor(ballot_id: string, selections: PlaintextBallotSelectionWithProof[]){
        this.ballot_id = ballot_id;
        this.selections = selections;
    }

    public  num_selections(): number {
        return this.selections.length;
    }
}

export class PublicElectionContext {
    // Election context that would be available to any observer of the election.

    election_name: string;
    // Unique string defining the name of the election.

    names: string[];
    // Candidate names for a simple, 1-of-n election.

    public_key: ElementModP;
    // Public encryption key for the election.

    base_hash: ElementModQ;
    // A constant used throughout the election.

    public constructor(election_name: string, names: string[], public_key: ElementModP, base_hash: ElementModQ){
        this.election_name = election_name;
        this.names = names;
        this.public_key = public_key;
        this.base_hash = base_hash;
    }

    public to_public_election_context(): PublicElectionContext {
        return this;
    }

    public get_public_key(): ElementModP{
        return this.public_key;
    }
}

export class PrivateElectionContext {
    // Election context that would only be available to an election administrator.

    election_name: string;
    // Unique string defining the name of the election.

    names: string[];
    // Candidate names for a simple, 1-of-n election.

    keypair: ElGamalKeyPair;
    // Public and private keys used for the election.

    base_hash: ElementModQ;
    // A constant used throughout the election.

    public constructor(election_name: string, names: string[], keypair: ElGamalKeyPair, base_hash: ElementModQ){
        this.election_name = election_name;
        this.names = names;
        this.keypair = keypair;
        this.base_hash = base_hash;
    }

    public to_public_election_context(): PublicElectionContext{
        return new PublicElectionContext(
            this.election_name,
            this.names,
            this.keypair.public_key,
            this.base_hash
        )
    }

    public get_public_key(): ElementModP{
        return this.keypair.public_key
    }


}

export type AnyElectionContext = PublicElectionContext | PrivateElectionContext;





