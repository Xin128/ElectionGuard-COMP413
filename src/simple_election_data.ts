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


export class CiphertextBallot extends CryptoHashCheckable implements ElectionObjectBase{
    // The object id of this specific ballot.
    // Will also appear in any corresponding plaintext of this ballot.
    object_id: string;

    //The `object_id` of the `BallotStyle` in the `Election` Manifest
    style_id: string;

    //Hash of the election manifest
    manifest_hash: ElementModQ;

    //Seed for ballot code
    code_seed: ElementModQ;

    //List of contests for this ballot
    contests: CiphertextBallotContest[];

    //Unique ballot code for this ballo
    code: ElementModQ;

    //Timestamp at which the ballot encryption is generated in tick
    timestamp: number;

    //The hash of the encrypted ballot representation
    crypto_hash: ElementModQ;

    //The nonce used to encrypt this ballot. Sensitive & should be treated as a secret
    nonce: ElementModQ | null | undefined;

    public constructor(ballot_id: string,
                       style_id: string,
                       manifest_hash: ElementModQ,
                       code_seed: ElementModQ,
                       contests: CiphertextBallotContest[],
                       code: ElementModQ,
                       timestamp: number,
                       crypto_hash:ElementModQ,
                       nonce?: ElementModQ) {
        super();
        this.object_id = ballot_id;
        this.style_id = style_id;
        this.manifest_hash = manifest_hash;
        this.code_seed = code_seed;
        this.contests = contests;
        this.code = code;
        this.timestamp = timestamp;
        this.crypto_hash = crypto_hash;
        this.nonce = nonce;
    }

    //return: a representation of the election and the external Id in the nonce's used
    //       to derive other nonce values on the ballot
    public nonce_seed(
      manifest_hash: ElementModQ,
      object_id: string,
      nonce: ElementModQ): ElementModQ{

      return hash_elems([manifest_hash, object_id, nonce])
    }

    //return: a hash value derived from the description hash, the object id, and the nonce value
    //                 suitable for deriving other nonce values on the ballot
    public hashed_ballot_nonce(): ElementModQ | null | undefined{
        if (this.nonce == null) {
            return null;
        }
        return this.nonce_seed(this.manifest_hash, this.object_id, this.nonce);
    }

    //Given an encrypted Ballot, generates a hash, suitable for rolling up
    //         into a hash for an entire ballot / ballot code. Of note, this particular hash examines
    //         the `manifest_hash` and `ballot_selections`, but not the proof.
    //         This is deliberate, allowing for the possibility of ElectionGuard variants running on
    //         much more limited hardware, wherein the Disjunctive Chaum-Pedersen proofs might be computed
    //         later on.
    public crypto_hash_with(encryption_seed: ElementModQ):ElementModQ{
        if (this.contests == null) {
          return ZERO_MOD_Q;
        }
        const contest_hashes = []
        for ( let i = 0; i < this.contests.length; i ++) {
          contest_hashes.push(this.contests[i].crypto_hash);
        }
        return hash_elems([this.object_id, encryption_seed, ...contest_hashes]);
    }

    //Given an encrypted Ballot, validates the encryption state against a specific seed and public key
    //         by verifying the states of this ballot's children (BallotContest's and BallotSelection's).
    //         Calling this function expects that the object is in a well-formed encrypted state
    //         with the `contests` populated with valid encrypted ballot selections,
    //         and the ElementModQ `manifest_hash` also populated.
    //         Specifically, the seed in this context is the hash of the Election Manifest,
    //         or whatever `ElementModQ` was used to populate the `manifest_hash` field.
    //

    // //done, but need supports in contest
    // public  is_valid_encryption(
    //   encryption_seed: ElementModQ,
    //   elgamal_public_key: ElementModP,
    //   crypto_extended_base_hash: ElementModQ,
    // ): boolean{
    //     if (encryption_seed != this.manifest_hash) {
    //         return false;
    //     }
    //     const recalculated_crypto_hash = this.crypto_hash_with(encryption_seed);
    //    if (this.crypto_hash != recalculated_crypto_hash) {
    //         return false;
    //    }
    //
    //    //Check the proofs on the ballot
    //   const valid_proofs: boolean[] = [];
    //    for (const contest of this.contests) {
    //      for (const selection in contest.ballot_selections) {
    //        valid_proofs.push(
    //          selection.is_valid_encryption(
    //            selection.description_hash,
    //            elgamal_public_key,
    //            crypto_extended_base_hash
    //          )
    //        );
    //        valid_proofs.push(
    //          contest.is_valid_encryption(
    //            contest.description_hash,
    //            elgamal_public_key,
    //            crypto_extended_base_hash
    //          )
    //        );
    //      }
    //    }
    //   return valid_proofs.every((elem)=>elem);
    // }

}

export class CiphertextBallotContest extends CryptoHashCheckable implements OrderedObjectBase{

  object_id: string;

  sequence_order: number;

  //Hash from contestDescription
  description_hash: ElementModQ;

  //Collection of ballot selections
  ballot_selections: CiphertextBallotSelection[];

  //The encrypted representation of all of the vote fields (the contest total)
  ciphertext_accumulation: ElGamalCiphertext;

  //Hash of the encrypted values
  crypto_hash: ElementModQ;

  //The nonce used to generate the encryption. Sensitive & should be treated as a secret
  nonce?: ElementModQ = undefined;

  //The proof demonstrates the sum of the selections does not exceed the maximum
  //     available selections for the contest, and that the proof was generated with the nonce
  proof?: ConstantChaumPedersenProof = undefined;

    public constructor(
      object_id: string,
      sequence_order: number,
      description_hash: ElementModQ,
      ballot_selections: CiphertextBallotSelection[],
      ciphertext_accumulation: ElGamalCiphertext,
      crypto_hash: ElementModQ,
      nonce?: ElementModQ,
      proof?: ConstantChaumPedersenProof
      ){
        super();
        this.object_id = object_id;
        this.sequence_order = sequence_order;
        this.description_hash = description_hash;
        this.ballot_selections = ballot_selections;
        this.ciphertext_accumulation = ciphertext_accumulation;
        this.crypto_hash = crypto_hash;
        this.nonce = nonce;
        this.proof = proof;
    }



    // public num_selections(): number{
    //     return this.selections.length;
    // }
    //
    public crypto_hash_with(encryption_seed: ElementModQ): ElementModQ {
        return _ciphertext_ballot_context_crypto_hash(this.object_id,
          this.ballot_selections,
          encryption_seed);
    }

}

//A CiphertextBallotSelection represents an individual encrypted selection on a ballot.
//     This class accepts a `description_hash` and a `ciphertext` as required parameters
//     in its constructor.
//     When a selection is encrypted, the `description_hash` and `ciphertext` required fields must
//     be populated at construction however the `nonce` is also usually provided by convention.
//     After construction, the `crypto_hash` field is populated automatically in the `__post_init__` cycle
//     A consumer of this object has the option to discard the `nonce` and/or discard the `proof`,
//     or keep both values.
//     By discarding the `nonce`, the encrypted representation and `proof`
//     can only be regenerated if the nonce was derived from the ballot's master nonce.  If the nonce
//     used for this selection is truly random, and it is discarded, then the proofs cannot be regenerated.
//     By keeping the `nonce`, or deriving the selection nonce from the ballot nonce, an external system can
//     regenerate the proofs on demand.  This is useful for storage or memory constrained systems.
//     By keeping the `proof` the nonce is not required fotor verify the encrypted selection.
//
export class CiphertextBallotSelection extends CryptoHashCheckable implements OrderedObjectBase{

  object_id: string;

  sequence_order: number;

  //The SelectionDescription hash
  description_hash: ElementModQ;

  //The encrypted representation of the vote field
  ciphertext: ElGamalCiphertext;

  //The hash of the encrypted values
  crypto_hash: ElementModQ;

  //Determines if this is a placeholder selection
  is_placeholder_selection = false;

  //The nonce used to generate the encryption. Sensitive & should be treated as a secret
  nonce?: ElementModQ = undefined;

  //The proof that demonstrates the selection is an encryption of 0 or 1, and was encrypted using the `nonce`
  proof?: DisjunctiveChaumPedersenProof = undefined;

  //encrypted representation of the extended_data field
  extended_data?: ElGamalCiphertext = undefined;

    public constructor(
      object_id: string,
      sequence_order: number,
      description_hash: ElementModQ,
      ciphertext: ElGamalCiphertext,
      crypto_hash: ElementModQ,
      is_placeholder_selection: boolean,
      nonce?: ElementModQ,
      proof?: DisjunctiveChaumPedersenProof
                       ){
        super();
        this.object_id = object_id;
        this.sequence_order = sequence_order;
        this.description_hash = description_hash;
        this.ciphertext = ciphertext;
        this.crypto_hash = crypto_hash;
        this.is_placeholder_selection = is_placeholder_selection;
        this.nonce = nonce;
        this.proof = proof;
    }



    public crypto_hash_with(encryption_seed: ElementModQ): ElementModQ {
        return _ciphertext_ballot_selection_crypto_hash_with(this.object_id, encryption_seed, this.ciphertext)
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
    object_id:string,
    ballot_selections: CiphertextBallotSelection[],
    encryption_seed: ElementModQ):ElementModQ{
    if (ballot_selections.length == 0){
        console.log(
            "mismatching ballot_selections state: {object_id} expected(some), actual(none)");
        return ZERO_MOD_Q;
    }
    const selection_hashes = []
    for ( let i = 0; i < ballot_selections.length; i ++) {
        selection_hashes.push(ballot_selections[i].crypto_hash);
    }
    return hash_elems([object_id, encryption_seed, selection_hashes])
}
export function _ciphertext_ballot_selection_crypto_hash_with(
  object_id: string,
  encryption_seed: ElementModQ,
  ciphertext: ElGamalCiphertext): ElementModQ{
    return hash_elems([object_id, encryption_seed, ciphertext.crypto_hash()]);
}


// export function make_ciphertext_ballot_selection(
//     object_id: string,
//     name: string,
//     seed_nonce: ElementModQ,
//     ciphertext: ElGamalCiphertext,
//     crypto_hash: ElementModQ|null,
//     proof: DisjunctiveChaumPedersenProof):CiphertextBallotSelection{
//     if (crypto_hash == null) {
//         crypto_hash = _ciphertext_ballot_selection_crypto_hash_with(object_id, seed_nonce, ciphertext);
//     }
//     return new CiphertextBallotSelection(name, ciphertext, proof, crypto_hash);
// }

export type AnyElectionContext = PublicElectionContext | PrivateElectionContext;





