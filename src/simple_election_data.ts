import { DisjunctiveChaumPedersenProof,
    ChaumPedersenDecryptionProof,
    ConstantChaumPedersenProof,
    } from "./chaum_pedersen"

import {ElGamalCiphertext, ElGamalKeyPair} from "./elgamal"
import {P, Q, G, ElementModP, ElementModQ, ZERO_MOD_Q } from "./group"
import { hash_elems, CryptoHashCheckable } from "./hash";
import {ElectionObjectBase, OrderedObjectBase} from "./election_object_base";


//!!! Caution: This operation do sort in place! It mutates the compared arrays' order!
/**
 * We want to compare lists of election objects as if they're sets. We fake this by first
 * sorting them on their object ids, then using regular list comparison.
 * @param list1 list of election objects that need to be compared with
 * @param list2 list of election objects that need to be compared with
 */
export function _list_eq(list1: ElectionObjectBase[], list2: ElectionObjectBase[]): boolean{
  list1.sort((a, b) => (a.object_id < b.object_id) ? -1:1);
  list2.sort((a, b) => (a.object_id < b.object_id) ? -1:1);
  if (list1 === list2) return true;
  if (list1 == null || list2 == null) return false;
  if (list1.length !== list2.length) return false;
  for (let i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]) {
      return false;
    }
  }
  return true;
}

export class PlaintextBallot implements ElectionObjectBase{
    object_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding encryption of this ballot.
    contests: PlaintextBallotContest[];
    // The list of contests for this ballot
    public constructor(object_id: string, contests: PlaintextBallotContest[]){
        this.object_id = object_id;
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

export class CiphertextSelectionTally{
    name: string;
    // Candidate name, or `PLACEHOLDER` for a placeholder selection.

    total: ElGamalCiphertext;
    // Tally of encrypted selections.
    public constructor(name: string, total: ElGamalCiphertext){
        this.name = name;
        this.total = total;
    }
}


export class CiphertextBallot extends CryptoHashCheckable{
    ballot_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot.
    contests: CiphertextBallotContest[];

    crypto_hash: ElementModQ;

    public constructor(ballot_id: string, contests: CiphertextBallotContest[], crypto_hash:ElementModQ) {
        super();
        this.ballot_id = ballot_id;
        this.contests = contests;
        this.crypto_hash = crypto_hash;
    }
    public crypto_hash_with(encryption_seed: ElementModQ):ElementModQ{
        if (this.contests == null) {
            return ZERO_MOD_Q;
        }
        const contest_hashes = []
        for ( let i = 0; i < this.contests.length; i ++) {
            contest_hashes.push(this.contests[i].crypto_hash);
        }
        return hash_elems([this.ballot_id, encryption_seed, contest_hashes]);
    }


}

export class CiphertextBallotContest extends CryptoHashCheckable {


    selections: CiphertextBallotSelection[];
    // Encrypted selections. This will include a "placeholder" selection (with `selection_id` == "PLACEHOLDER"),
    // such that the sum of the encrypted selections is exactly one.

    valid_sum_proof: ConstantChaumPedersenProof;
    // Proof that the sum of the selections (including the placeholder) is exactly one.

    crypto_hash:ElementModQ;
    //Hash of the encrypted values.
   
    public constructor(selections: CiphertextBallotSelection[], valid_sum_proof: ConstantChaumPedersenProof, crypto_hash:ElementModQ){
        super();
        this.selections = selections;
        this.valid_sum_proof = valid_sum_proof;
        this.crypto_hash = crypto_hash;
    }
    

    public num_selections(): number{
        return this.selections.length;
    }

    public crypto_hash_with(encryption_seed: ElementModQ): ElementModQ {
        return _ciphertext_ballot_context_crypto_hash(this.selections, encryption_seed)
    }

}

export class CiphertextBallotSelection extends CryptoHashCheckable{
    name: string;
    // Candidate name, or `PLACEHOLDER` for a placeholder selection.

    ciphertext: ElGamalCiphertext;
    // Encrypted selection.

    zero_or_one_proof: DisjunctiveChaumPedersenProof;
    // Proof that the encrypted selection is either zero or one.

    crypto_hash: ElementModQ;
    public constructor(name: string, ciphertext: ElGamalCiphertext, zero_or_one_proof: DisjunctiveChaumPedersenProof, crypto_hash:ElementModQ){
        super();
        this.name = name;
        this.ciphertext = ciphertext;
        this.zero_or_one_proof = zero_or_one_proof;
        this.crypto_hash = crypto_hash;
    }

    crypto_hash_with(encryption_seed: ElementModQ): ElementModQ {
        return _ciphertext_ballot_selection_crypto_hash_with(encryption_seed, this.ciphertext)
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

export class PlaintextContestWithProofs {

    selections: PlaintextBallotSelectionWithProof[];
    // Each selection along with its proof

    public constructor(selections: PlaintextBallotSelectionWithProof[]){
        this.selections = selections;
    }

    public num_selections(): number {
        return this.selections.length;
    }
}

export class PlaintextBallotWithProofs {
    ballot_id: string;
    // The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot.

    contests: PlaintextContestWithProofs[];
    // Each selection along with its proof

    public constructor(ballot_id: string, contests: PlaintextContestWithProofs[]){
        this.ballot_id = ballot_id;
        this.contests = contests;
    }

    public  num_contests(): number {
        return this.contests.length;
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

export class CiphertextElectionContext  {
    //    """`CiphertextElectionContext` is the ElectionGuard representation of a specific election.
    number_of_guardians: number;
    //    The number of guardians necessary to generate the public key

    quorum:number;
    // The quorum of guardians necessary to decrypt an election.  Must be less than `number_of_guardians`

    elgamal_public_key:ElementModP;
    // the `joint public key (K)` in the specification

    commitment_hash: ElementModQ;

    manifest_hash: ElementModQ;

    crypto_base_hash: ElementModQ;

    crypto_extended_base_hash: ElementModQ;

    extended_data: Map<string, string>|null;

    public constructor(
        number_of_guardians: number,
        quorum: number,
        elgamal_public_key:ElementModP,
        commitment_hash: ElementModQ,
        manifest_hash: ElementModQ,
        crypto_base_hash: ElementModQ,
        crypto_extended_base_hash: ElementModQ,
        extended_data: Map<string, string>|null
    ){
        this.number_of_guardians = number_of_guardians;
        this.quorum = quorum;
        this.elgamal_public_key = elgamal_public_key;
        this.commitment_hash = commitment_hash;
        this.manifest_hash = manifest_hash;
        this.crypto_base_hash = crypto_base_hash;
        this.crypto_extended_base_hash = crypto_extended_base_hash;
        this.extended_data = extended_data;
    }
}

export function make_ciphertext_election_context(
    number_of_guardians: number,
        quorum: number,
        elgamal_public_key:ElementModP,
        commitment_hash: ElementModQ,
        manifest_hash: ElementModQ,
        extended_data: Map<string, string>|null
): CiphertextElectionContext{
    const crypto_base_hash = hash_elems(
        [new ElementModP(P), new ElementModQ(Q), new ElementModP(G) ,number_of_guardians,quorum,
        manifest_hash]);
    const crypto_extended_base_hash = hash_elems([crypto_base_hash, commitment_hash]);
    return new CiphertextElectionContext(number_of_guardians,
        quorum,
        elgamal_public_key,
        commitment_hash,
        manifest_hash,
        crypto_base_hash,
        crypto_extended_base_hash,
        extended_data);
}

// Notes for Arthur: I deleted all object-id for now for simplicity. Let me know if it is required and I can add it later.
export function _ciphertext_ballot_context_crypto_hash(
    ballot_selections: CiphertextBallotSelection[], encryption_seed: ElementModQ):ElementModQ{
    if (ballot_selections.length == 0){
        console.log(
            "mismatching ballot_selections state: {object_id} expected(some), actual(none)");
        return ZERO_MOD_Q;
    }
    const selection_hashes = []
    for ( let i = 0; i < ballot_selections.length; i ++) {
        selection_hashes.push(ballot_selections[i].crypto_hash);
    }
    return hash_elems([encryption_seed, selection_hashes])
}
export function _ciphertext_ballot_selection_crypto_hash_with(encryption_seed: ElementModQ, ciphertext: ElGamalCiphertext): ElementModQ{
    return hash_elems([encryption_seed, ciphertext.crypto_hash()]);
}


export function make_ciphertext_ballot_selection(
    name: string,
    seed_nonce: ElementModQ,
    ciphertext: ElGamalCiphertext,
    crypto_hash: ElementModQ|null,
    proof: DisjunctiveChaumPedersenProof):CiphertextBallotSelection{
    if (crypto_hash == null) {
        crypto_hash = _ciphertext_ballot_selection_crypto_hash_with(seed_nonce, ciphertext);
    }
    return new CiphertextBallotSelection(name, ciphertext, proof, crypto_hash);
}

export type AnyElectionContext = PublicElectionContext | PrivateElectionContext;





