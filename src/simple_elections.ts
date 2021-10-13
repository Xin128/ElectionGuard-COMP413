import {
    CiphertextBallot,
    PlaintextBallot,
    PlaintextSelection,
    CiphertextSelection,
    PrivateElectionContext,
    CiphertextSelectionTally,
    AnyElectionContext,
    PlaintextSelectionWithProof,
    PlaintextBallotWithProofs,
} from "./simple_election_data"
import { ElGamalCiphertext } from "./elgamal"
import { ElementModQ, TWO_MOD_Q, add_q } from "./group"
import {Nonces} from "./nonces"
import * as el from "./elgamal"
import * as cp from "./chaum_pedersen"
import {get_optional} from "./utils";

const PLACEHOLDER_NAME = "PLACEHOLDER"

export function encrypt_selection(context: AnyElectionContext,
                                  selection: PlaintextSelection,
                                  seed_nonce: ElementModQ):
    ([CiphertextSelection, ElementModQ] | null) {
    //Given a selection and the necessary election context, encrypts the selection and returns the
    //     encrypted selection plus the encryption nonce. If anything goes wrong, `None` is returned.
    const public_key = context.get_public_key();
    const encryption = el.elgamal_encrypt(BigInt(selection.choice), seed_nonce, public_key);
    if (!(encryption instanceof el.ElGamalCiphertext)){
        return null;
    }
    const zero_or_one_pad = cp.make_disjunctive_chaum_pedersen(
        encryption,
        seed_nonce,
        public_key,
        context.base_hash,
        seed_nonce,
        selection.choice
    )
    const cipher = new CiphertextSelection(selection.name, encryption, zero_or_one_pad)
    return [cipher, seed_nonce]
}

export function encrypt_ballot(context: AnyElectionContext,
                               ballot: PlaintextBallot,
                               seed_nonce: ElementModQ):
    (CiphertextBallot | null) {
    //Given a ballot and the necessary election context, encrypts the ballot and returns the
    //     ciphertext. If anything goes wrong, `None` is returned.
    if (ballot.is_overvoted()){
        return null;
    }

    const num_selection = ballot.selections.length;
    const nonces = [];
    const n = new Nonces(seed_nonce);
    for (let i = 0; i < num_selection + 1; i++){
        nonces.push(n.get(i));
    }

    const public_key = context.get_public_key();
    const ciphered_selections: CiphertextSelection[] = [];
    let start = true;
    let total_constant_int: number;
    total_constant_int = 0;
    let agg_seed: ElementModQ | null = null;
    let overall_encryption: ElGamalCiphertext | null = null;
    for(let selection_idx=0; selection_idx < num_selection; selection_idx++) {
        const plain_selection = ballot.selections[selection_idx];
        const encrypted_tuple = encrypt_selection(
            context, plain_selection, nonces[selection_idx]
        );
        if (encrypted_tuple == null) {
            return null;
        }
        const encrypted_text = encrypted_tuple[0];
        if (!(encrypted_text instanceof CiphertextSelection)){
            return null;
        }
        ciphered_selections.push(encrypted_text);
        if(start) {
            overall_encryption = encrypted_text.ciphertext;
            agg_seed = nonces[selection_idx];
            start = false;
        } else {
            if((overall_encryption instanceof ElGamalCiphertext) && (agg_seed instanceof ElementModQ)) {
                overall_encryption = el.elgamal_add(overall_encryption, encrypted_text.ciphertext);
                agg_seed = add_q(agg_seed, nonces[selection_idx]);
            }
        }
        total_constant_int += plain_selection.choice;
    }
    let placeholder_choice: number;
    if (total_constant_int === 0){
        placeholder_choice = 1;
    } else {
        placeholder_choice = 0;
    }
    const placeHolderSelection = new PlaintextSelection(PLACEHOLDER_NAME, placeholder_choice);
    const placeholder_encrypt_selection: ([CiphertextSelection, ElementModQ] | null) = encrypt_selection(context, placeHolderSelection, seed_nonce);
    if (placeholder_encrypt_selection === null){
        return null;
    }
    const placeholder_encrypt_text: CiphertextSelection | null = placeholder_encrypt_selection[0]
    if (!(placeholder_encrypt_text instanceof CiphertextSelection)) {
        return null;
    }
    ciphered_selections.push(placeholder_encrypt_text);
    const overall_encryption_elgamal_encryption = placeholder_encrypt_text.ciphertext;
    if (overall_encryption_elgamal_encryption == null) {
        return null;
    }
    overall_encryption = el.elgamal_add(get_optional(overall_encryption), overall_encryption_elgamal_encryption);
    if((seed_nonce instanceof ElementModQ) && (agg_seed instanceof ElementModQ)) {
        agg_seed = add_q(agg_seed, seed_nonce);
    } else {
        return null;
    }

    total_constant_int = total_constant_int + placeholder_choice;
    const chaum_proof: cp.ConstantChaumPedersenProof = cp.make_constant_chaum_pedersen(
        overall_encryption,
        BigInt(total_constant_int),
        agg_seed,
        public_key,
        seed_nonce,
        context.base_hash,
    );
    const cipher: CiphertextBallot = new CiphertextBallot(ballot.ballot_id, ciphered_selections, chaum_proof);
    return cipher;
}

export function encrypt_ballots(
    context: AnyElectionContext,
    ballots: PlaintextBallot[],
    seed_nonce: ElementModQ):
    (CiphertextBallot[] | null) {

    const encrypted_ballots: CiphertextBallot[] = [];
    const num_ballots: number = ballots.length;
    const n = new Nonces(seed_nonce);
    const nonces: ElementModQ[] = [];
    for (let i = 0; i < num_ballots; i++) {
        const value:ElementModQ = n.get(i);
        nonces.push(value);
    }
    for(let ballot_idx = 0; ballot_idx < num_ballots; ballot_idx++) {
        const ballot_encrypted: CiphertextBallot | null = encrypt_ballot(context, ballots[ballot_idx], nonces[ballot_idx]);
        if(ballot_encrypted == null) {
            return null;
        }
        encrypted_ballots.push(ballot_encrypted);
    }
    return encrypted_ballots;
}

export function validate_encrypted_selection(context: AnyElectionContext, selection: CiphertextSelection): boolean {
    //Validates the proof on an encrypted selection. Returns true if everything is good.
    const message = selection.ciphertext;
    const public_key = context.get_public_key();
    const base_hash = context.base_hash;
    return selection.zero_or_one_proof.is_valid(message, public_key, base_hash);
}

export function validate_encrypted_ballot(context: AnyElectionContext, ballot: CiphertextBallot): boolean {
    //Validates all the proofs on the encrypted ballot. Returns true if everything is good.
    let message: ElGamalCiphertext | null = null;
    for(const selection of ballot.selections) {
        if(!validate_encrypted_selection(context, selection)) {
            return false;
        } else {
            if (message === null) {
                message = selection.ciphertext;
            } else {
                message = el.elgamal_add(message, selection.ciphertext);
            }
        }
    }
    if (message instanceof ElGamalCiphertext) {
        return ballot.valid_sum_proof.is_valid(message, context.get_public_key(), context.base_hash);
    } else {
        return false;
    }
}

export function decrypt_selection(
    context: PrivateElectionContext,
    selection: CiphertextSelection,
    seed: ElementModQ):PlaintextSelectionWithProof {
    //Given an encrypted selection and the necessary crypto context, decrypts it, returning
    //     the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
    //     ciphertext. The optional seed is used for computing the proof.
    const secret_key = context.keypair.secret_key;
    const choice = selection.ciphertext.decrypt(secret_key);
    const plaintextSelection = new PlaintextSelection(selection.name, choice);
    const descryption_proof = cp.make_chaum_pedersen_decryption_proof(selection.ciphertext, secret_key, seed, context.base_hash);
    return new PlaintextSelectionWithProof(plaintextSelection, descryption_proof);
}

export function decrypt_ballot(
    context: PrivateElectionContext,
    ballot: CiphertextBallot,
    seed: ElementModQ): PlaintextBallotWithProofs {
    //Given an encrypted ballot and the necessary crypto context, decrypts it. Each
    //     decryption includes the necessary Chaum-Pedersen decryption proofs as well.
    const num_selection = ballot.selections.length;
    const n = new Nonces(seed);
    const nonces:ElementModQ[] = [];
    for (let i = 0; i < num_selection; i++) {
        const value:ElementModQ = n.get(i);
        nonces.push(value);
    }
    const ballot_decrypted_lst: PlaintextSelectionWithProof[] = [];
    for(let selection_idx = 0; selection_idx < num_selection - 1; selection_idx++) {
        ballot_decrypted_lst.push(decrypt_selection(context, ballot.selections[selection_idx], nonces[selection_idx]));
    }
    return new PlaintextBallotWithProofs(ballot.ballot_id, ballot_decrypted_lst);
}

export function validate_decrypted_selection(
    context: AnyElectionContext,
    plaintext: PlaintextSelectionWithProof,
    ciphertext: CiphertextSelection): boolean {
    //Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good.
    const plaintext_msg = plaintext.selection.choice;
    const public_key = context.get_public_key();
    const base_hash = context.base_hash;
    const is_valid = plaintext.decryption_proof.is_valid(BigInt(plaintext_msg), ciphertext.ciphertext, public_key, base_hash);
    return is_valid
}

export function validate_decrypted_ballot(
    context: AnyElectionContext,
    plaintext: PlaintextBallotWithProofs,
    ciphertext: CiphertextBallot): boolean {
    const num_selections: number = plaintext.selections.length;
    for(let i = 0; i < num_selections; i++) {
        if (!validate_decrypted_selection(context, plaintext.selections[i], ciphertext.selections[i])) {
            return false;
        }
    }
    return true;
}

export function tally_encrypted_ballots(
    context: AnyElectionContext,
    ballots: CiphertextBallot[]): CiphertextSelectionTally[] {
    //Homomorphically accumulates the encrypted ballots, returning list of tallies, one per selection.
    if (context == null) {
        return [];
    }
    // a type-safe mapping of <K,T>, more detail refers to Record<K,T>
    const total_votes: Map<string, ElGamalCiphertext> = new Map();
    for (const b of ballots) {
        for (const s of b.selections) {
            if (!total_votes.has(s.name)) {
                total_votes.set(s.name, s.ciphertext);
                // console.log("the original value for ballot length ", ballots.length + " with name " + s.name + " is ", s.ciphertext);
            } else {
                const new_val = el.elgamal_add(get_optional(total_votes.get(s.name)), s.ciphertext);
                total_votes.set(s.name, new_val);
                // console.log("the updated value for ballot length ", ballots.length + " with name " + s.name + " is ", new_val);
                
            }
        }
    }
    const return_list = [];
    for (const name of total_votes.keys()) { // return string[] of keys of total_votes
        return_list.push(new CiphertextSelectionTally(name, get_optional(total_votes.get(name))));
    }

    return return_list;
}

export function decrypt_tally(
    context: PrivateElectionContext,
    selection: CiphertextSelectionTally,
    seed: ElementModQ): PlaintextSelectionWithProof {
    //Given an encrypted, tallied selection, and the necessary crypto context, decrypts it,
    //     returning the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
    //     ciphertext. The optional seed is used for computing the proof.

    const secret_key = context.keypair.secret_key;
    const plain_selections = new PlaintextSelection(selection.name, selection.total.decrypt(secret_key));
    const decryption_proof = cp.make_chaum_pedersen_decryption_proof(selection.total, secret_key, seed, context.base_hash);
    return new PlaintextSelectionWithProof(plain_selections, decryption_proof);
}

export function decrypt_tallies(
    context: PrivateElectionContext,
    tally: CiphertextSelectionTally[],
    seed: ElementModQ):PlaintextSelectionWithProof[] {
    //"Given a list of encrypted tallies and the necessary crypto context, does the
    //     decryption on the entire list. The optional seed is used for computing the proofs.
    const lst = [];
    for (const t of tally) {
        lst.push(decrypt_tally(context, t, seed));
    }
    return lst;
}

export function validate_tally(
    context: AnyElectionContext,
    tally_plaintext: PlaintextSelectionWithProof,
    tally_ciphertext: CiphertextSelectionTally): boolean {
    //Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good.

    const seed_nonce = TWO_MOD_Q;
    const ciphertext = tally_ciphertext.total;
    let secret_key: ElementModQ;
    if (context instanceof PrivateElectionContext) {
        secret_key = context.keypair.secret_key;
    } else {
        return false;
    }
    const pad = cp.make_chaum_pedersen_decryption_proof(ciphertext, secret_key, seed_nonce, context.base_hash);
    return pad.is_valid(
        BigInt(tally_plaintext.selection.choice),
        ciphertext,
        context.keypair.public_key,
        context.base_hash);
}

export function validate_tallies(
    context: AnyElectionContext,
    tally_plaintext: PlaintextSelectionWithProof[],
    tally_ciphertext: CiphertextSelectionTally[]): boolean {
    //Validates that the plaintext is provably generated from the ciphertext for every tally. Returns true if
    //     everything is good.

    for (let i = 0; i < tally_plaintext.length; i++) {
        if (!validate_tally(context, tally_plaintext[i], tally_ciphertext[i])) {
            // console.log("current context is ", context, "tally plaintext ", tally_plaintext[i], "tally ciphertext ", tally_ciphertext[i]);
            return false;
        }
    }
    return true;
}

export function tally_plaintext_ballots(
    context: AnyElectionContext,
    ballots: PlaintextBallot[]): PlaintextBallot {
    //Given a list of ballots, adds their counters and returns a ballot representing the totals of the contest.

    const totals: Map<string, number> = new Map();
    for (const b of ballots) {
        for (const s of b.selections) {
            if (!totals.has(s.name)) {
                totals.set(s.name, s.choice);
            } else {
                const new_val = get_optional(totals.get(s.name)) + s.choice;
                totals.set(s.name, new_val);
            }
        }
    }
    const lst = [];
    for (const name of context.names) {
        lst.push(new PlaintextSelection(name, get_optional(totals.get(name))));
    }
    return new PlaintextBallot("TOTALS", lst);
}