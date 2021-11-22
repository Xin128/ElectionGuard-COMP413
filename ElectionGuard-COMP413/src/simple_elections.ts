import {
    CiphertextBallot,
    PlaintextBallot,
    PlaintextBallotSelection,
    CiphertextBallotSelection,
    // PrivateElectionContext,
    // CiphertextSelectionTally,
    AnyElectionContext,
    PlaintextBallotSelectionWithProof,
    // PlaintextContestWithProofs,
    // PlaintextBallotWithProofs,
    CiphertextBallotContest,
    // _ciphertext_ballot_context_crypto_hash,
    PlaintextBallotContest,
    CiphertextElectionContext,
    make_ciphertext_ballot_selection,
    make_ciphertext_ballot_contest,
    make_ciphertext_ballot
} from "./simple_election_data"
// import { ElGamalCiphertext } from "./elgamal"
import { ElementModQ,
    // TWO_MOD_Q,
    ElementModP,
    // rand_q,
    // add_q,
    // R
} from "./group"
// import {Nonces} from "./nonces"
// import * as el from "./elgamal"
// import * as cp from "./chaum_pedersen"
import {get_optional} from "./utils";
import {
    hash_elems } from "./hash"
import { ContestDescription, ContestDescriptionWithPlaceholders, InternalManifest, SelectionDescription } from "./manifest"
import {
    from_file_to_class,
    // from_file_to_PlaintextBallot,
    // object_log
} from "./serialization";
import {sequence_order_sort} from "./election_object_base";
import { Nonces } from "./nonces";
import { elgamal_encrypt } from "./elgamal";

// const PLACEHOLDER_NAME = "PLACEHOLDER"

export function selection_from(
    description: SelectionDescription,
    is_placeholder = false,
    is_affirmative = false,
) : PlaintextBallotSelection {
    return new PlaintextBallotSelection(
        description.object_id,
        description.sequence_order,
        is_affirmative ? 1 : 0,
        is_placeholder
    );
}

export function contest_from(description: ContestDescription) : PlaintextBallotContest {
    const selections:PlaintextBallotSelection[] = [];
    for (const selection_description of description.ballot_selections) {
        selections.push(selection_from(selection_description))
    }
    return new PlaintextBallotContest(description.object_id, description.sequence_order, selections);
}


export function encrypt_selection(selection: PlaintextBallotSelection,
                                  selection_description: SelectionDescription ,
                                  elgamal_public_key: ElementModP,
                                  crypto_extended_base_hash: ElementModQ,
                                  nonce_seed: ElementModQ,
                                  is_placeholder = false,
                                  should_verify_proofs = true
):
    (CiphertextBallotSelection | null) {
    should_verify_proofs;
//     //Given a selection and the necessary election context, encrypts the selection and returns the
//     //     encrypted selection plus the encryption nonce. If anything goes wrong, `None` is returned.
//     const public_key = context.elgamal_public_key;
//     const encryption = el.elgamal_encrypt(BigInt(selection.choice), seed_nonce, public_key);
//     if (!(encryption instanceof el.ElGamalCiphertext)){
//         return null;
//     }
//     const zero_or_one_pad = cp.make_disjunctive_chaum_pedersen(
//         encryption,
//         seed_nonce,
//         public_key,
//         context.crypto_extended_base_hash,
//         seed_nonce,
//         selection.choice
//     )

    // const cipher = make_ciphertext_ballot_selection(selection.name, seed_nonce, encryption, null, zero_or_one_pad);
    const  selection_description_hash = selection_description.crypto_hash()
    // console.log("inside encrypt selection");
    // console.log(selection.object_id);
    // console.log("before nonce:", selection_description_hash, nonce_seed)
    const nonce_sequence = new Nonces(selection_description_hash, nonce_seed);
    const selection_nonce = nonce_sequence.get(selection_description.sequence_order);
    const selection_representation = selection.vote;
    const disjunctive_chaum_pedersen_nonce = nonce_sequence.next();

    const elgamal_encryption = elgamal_encrypt(
        BigInt(selection_representation), selection_nonce, elgamal_public_key
    )
    // console.log("descrption hash", selection_description_hash)
    // console.log("crypto hash hash", selection_description.crypto_hash())


    const encrypted_selection = make_ciphertext_ballot_selection(
        selection.object_id,
        selection.sequence_order,
        selection_description_hash,
        get_optional(elgamal_encryption),
        elgamal_public_key,
        crypto_extended_base_hash,
        disjunctive_chaum_pedersen_nonce,
        selection_representation,
        is_placeholder,
        selection_nonce,
    );
    return encrypted_selection
}


export function encrypt_contest(contest: PlaintextBallotContest,
                                contest_description: ContestDescriptionWithPlaceholders,
                                elgamal_public_key: ElementModP,
                                crypto_extended_base_hash: ElementModQ,
                                nonce_seed: ElementModQ,
                                should_verify_proofs = true,

): CiphertextBallotContest | null {
    should_verify_proofs;
    const contest_description_hash = contest_description.crypto_hash();
    const nonce_sequence = new Nonces(contest_description_hash, nonce_seed);
    const contest_nonce = nonce_sequence.get(contest_description.sequence_order);
    const chaum_pedersen_nonce = nonce_sequence.next();

    const encrypted_selections: CiphertextBallotSelection[] = [];
    let encrypted_selection = null;
    let selection_count  = 0;

    for (const description of contest_description.ballot_selections) {
        let has_selection = false
        for (const selection of contest.ballot_selections) {
            if (selection.object_id == description.object_id) {
                has_selection = true
                selection_count += selection.vote;
                encrypted_selection = encrypt_selection(
                    selection,
                    description,
                    elgamal_public_key,
                    crypto_extended_base_hash,
                    contest_nonce,
                );
                break;
            }
        }
        if (has_selection == false) {
            encrypted_selection = encrypt_selection(
                selection_from(description),
                description,
                elgamal_public_key,
                crypto_extended_base_hash,
                contest_nonce,
            );
        }
        encrypted_selections.push(get_optional(encrypted_selection))
    }

    for (const placeholder of contest_description.placeholder_selections) {
        let select_placeholder = false;
        if (selection_count < contest_description.number_elected) {
            selection_count += 1;
            select_placeholder = true;
        }
        encrypted_selection = encrypt_selection(selection_from(placeholder, true, select_placeholder), placeholder, elgamal_public_key, crypto_extended_base_hash, contest_nonce, true, true)
        encrypted_selections.push(get_optional(encrypted_selection))
    }
    const encrypted_contest = make_ciphertext_ballot_contest(
        contest.object_id,
        contest.sequence_order,
        contest_description_hash,
        encrypted_selections,
        elgamal_public_key,
        crypto_extended_base_hash,
        chaum_pedersen_nonce,
        contest_description.number_elected,
        contest_nonce,
    )
    return  encrypted_contest
}

export function encrypt_ballot_contests(ballot:PlaintextBallot,
                                        description: InternalManifest,
                                        context: CiphertextElectionContext,
                                        nonce_seed:ElementModQ
): CiphertextBallotContest[]|null {

    const encrypted_contests: CiphertextBallotContest[] = [];


    for (const ballot_style_contest of description.get_contests_for(ballot.style_id)) {
        let use_contest = null;
        for (const contest of ballot.contests) {
            if (contest.object_id == ballot_style_contest.object_id) {
                use_contest = contest
                break
            }
        }
        if (use_contest == null) {
            use_contest = contest_from(ballot_style_contest);
        }
        const encrypted_contest = get_optional(encrypt_contest(
            use_contest,
            ballot_style_contest,
            context.elgamal_public_key,
            context.crypto_extended_base_hash,
            nonce_seed,
        ));
        encrypted_contests.push(encrypted_contest);
    }
    // console.log("encrypted contests is ", object_log(encrypted_contests));
    return encrypted_contests;
}


//change parameter to accept null only for testing and demo purpose!!!
export function encrypt_ballot(ballot: PlaintextBallot,
                               internal_manifest: InternalManifest,
                               context: CiphertextElectionContext,
                               encryption_seed: ElementModQ ,
                               nonce: ElementModQ,
                               should_verify_proofs  = true):
    (CiphertextBallot | null | undefined) {
    ballot;
    internal_manifest;
    context;
    encryption_seed;
    nonce;
    should_verify_proofs;
    //Given a ballot and the necessary election context, encrypts the ballot and returns the
    //     ciphertext. If anything goes wrong, `None` is returned.
    // for (const contest of ballot.contests) {
    //     if (contest.is_overvoted()){
    //         return null;
    //     }
    // }
    // const random_master_nonce: ElementModQ = new ElementModQ(BigInt('26102'));
    // const manifest_hash:ElementModQ = new ElementModQ(BigInt('19846'));
    // const nonce_seed =  hash_elems([manifest_hash, ballot.object_id, random_master_nonce]);
    // console.log('None seed!!!', nonce_seed)
    // const encrypted_contests = get_optional(encrypt_ballot_contests(ballot,manifest, context, nonce_seed ));
    // console.dir(encrypted_contests[0].selections, { depth: 100 });

    const inputs = from_file_to_class();
    const nonce_seed = hash_elems([internal_manifest.manifest_hash, ballot.object_id, inputs.nonce]);
    // pass & todo: change to internal_manifest.manifest_hash

    const encrypted_contests = get_optional(encrypt_ballot_contests(
        ballot, internal_manifest, context, nonce_seed
    ))

    const encrypted_ballot = make_ciphertext_ballot(ballot.object_id,
        ballot.style_id,
        internal_manifest.manifest_hash,
        encrypted_contests,
        encryption_seed,
        nonce,)

    if (encrypted_contests == null) {
        return null
    }


    // const contest_hash = create_ballot_hash(inputs.object_id, inputs.manifest_hash, inputs.contests);
    // const encrypted_ballot = new CiphertextBallot(
    //   inputs.object_id,
    //   inputs.style_id,
    //   inputs.manifest_hash,
    //   inputs.code_seed,
    //   encrypted_contests,
    //   inputs.code,
    //   inputs.timestamp,
    //   contest_hash,
    //   inputs.nonce);

    return encrypted_ballot;
}

//Create the hash of the ballot contests.
export function create_ballot_hash(ballot_id: string,
                                   description_hash: ElementModQ,
                                   contests: CiphertextBallotContest[]): ElementModQ {
    const contests_hash = sequence_order_sort(contests).map(contest => contest.crypto_hash);
    return hash_elems([ballot_id, description_hash, ...contests_hash]);
}

// export function encrypt_ballots(
//     context: AnyElectionContext,
//     ballots: PlaintextBallot[],
//     seed_nonce: ElementModQ):
//     (CiphertextBallot[] | null) {

//     const encrypted_ballots: CiphertextBallot[] = [];
//     const num_ballots: number = ballots.length;
//     const n = new Nonces(seed_nonce);
//     const nonces: ElementModQ[] = [];
//     for (let i = 0; i < num_ballots; i++) {
//         const value:ElementModQ = n.get(i);
//         nonces.push(value);
//     }
//     for(let ballot_idx = 0; ballot_idx < num_ballots; ballot_idx++) {
//         const ballot_encrypted: CiphertextBallot | null = encrypt_ballot(context, ballots[ballot_idx], nonces[ballot_idx]);
//         if(ballot_encrypted == null) {
//             return null;
//         }
//         encrypted_ballots.push(ballot_encrypted);
//     }
//     return encrypted_ballots;
// }

// export function validate_encrypted_selection(context: AnyElectionContext, selection: CiphertextBallotSelection): boolean {
//     //Validates the proof on an encrypted selection. Returns true if everything is good.
//     const message = selection.ciphertext;
//     const public_key = context.get_public_key();
//     const base_hash = context.base_hash;
//     return selection.zero_or_one_proof.is_valid(message, public_key, base_hash);
// }

// export function validate_encrypted_contest(context: AnyElectionContext, contest: CiphertextBallotContest): boolean {
//     //Validates all the proofs on the encrypted ballot. Returns true if everything is good.
//     let message: ElGamalCiphertext | null = null;
//     for(const selection of contest.selections) {
//         if(!validate_encrypted_selection(context, selection)) {
//             return false;
//         } else {
//             if (message === null) {
//                 message = selection.ciphertext;
//             } else {
//                 message = el.elgamal_add(message, selection.ciphertext);
//             }
//         }
//     }
//     if (message instanceof ElGamalCiphertext) {
//         return contest.valid_sum_proof.is_valid(message, context.get_public_key(), context.base_hash);
//     } else {
//         return false;
//     }
// }

// export function validate_encrypted_ballot(context: AnyElectionContext, ballot: CiphertextBallot): boolean {
//     //Validates all the proofs on the encrypted ballot. Returns true if everything is good.
//     for(const contest of ballot.contests) {
//         if(!validate_encrypted_contest(context, contest)) {
//             return false;
//         }
//     }
//     return true;
// }

// export function decrypt_selection_with_nonce(
//     context: CiphertextElectionContext,
//     selection: CiphertextBallotSelection,
//     seed: ElementModQ):PlaintextBallotSelection {
//     //Given an encrypted selection and the necessary crypto context, decrypts it, returning
//     //     the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
//     //     ciphertext. The optional seed is used for computing the proof.
//     // const secret_key = context.keypair.secret_key;
//     const choice = selection.ciphertext.decrypt_known_nonce(context.elgamal_public_key, seed);
//     const plaintextBallotSelection = new PlaintextBallotSelection(selection.name, choice);
//     return plaintextBallotSelection;
// }

// export function decrypt_contest_with_nonce(
//     context: CiphertextElectionContext,
//     contest: CiphertextBallotContest,
//     seed: ElementModQ): PlaintextBallotContest {
//     // Given an encrypted ballot and the necessary crypto context, decrypts it. Each
//     //     decryption includes the necessary Chaum-Pedersen decryption proofs as well.
//     const num_selection = contest.selections.length;
//     const n = new Nonces(seed);
//     const nonces:ElementModQ[] = [];
//     for (let i = 0; i < num_selection; i++) {
//         const value:ElementModQ = n.get(i);
//         nonces.push(value);
//     }
//     const contest_decrypted_lst: PlaintextBallotSelection[] = [];
//     for(let selection_idx = 0; selection_idx < num_selection - 1; selection_idx++) {
//         contest_decrypted_lst.push(decrypt_selection_with_nonce(context, contest.selections[selection_idx], nonces[selection_idx]));
//     }
//     return new PlaintextBallotContest(contest_decrypted_lst);
// }


// export function decrypt_ballot_with_nonce(
//     context: CiphertextElectionContext,
//     ballot: CiphertextBallot,
//     seed: ElementModQ): PlaintextBallot{
//     //Given an encrypted ballot and the necessary crypto context, decrypts it. Each
//     //     decryption includes the necessary Chaum-Pedersen decryption proofs as well.
//     const num_contest = ballot.contests.length;
//     const n = new Nonces(seed);
//     const nonces:ElementModQ[] = [];
//     for (let i = 0; i < num_contest; i++) {
//         const value:ElementModQ = n.get(i);
//         nonces.push(value);
//     }
//     const ballot_decrypted_lst: PlaintextBallotContest[] = [];
//     for(let selection_idx = 0; selection_idx < num_contest ; selection_idx++) {
//         ballot_decrypted_lst.push(decrypt_contest_with_nonce(context, ballot.contests[selection_idx], nonces[selection_idx]));
//     }
//     return new PlaintextBallot(ballot.ballot_id, ballot_decrypted_lst);
// }

// export function decrypt_selection(
//     context: CiphertextElectionContext,
//     selection: CiphertextBallotSelection,
//     seed: ElementModQ):PlaintextBallotSelectionWithProof {
//     //Given an encrypted selection and the necessary crypto context, decrypts it, returning
//     //     the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
//     //     ciphertext. The optional seed is used for computing the proof.
//     // const secret_key = context.keypair.secret_key;
//     const choice = selection.ciphertext.decrypt_known_nonce(context.elgamal_public_key, seed);
//     const plaintextBallotSelection = new PlaintextBallotSelection(selection.name, choice);
//     const descryption_proof = cp.make_chaum_pedersen_decryption_proof(selection.ciphertext, secret_key, seed, context.base_hash);
//     return new PlaintextBallotSelectionWithProof(plaintextBallotSelection, descryption_proof);
// }
// export function decrypt_contest(
//     context: CiphertextElectionContext,
//     contest: CiphertextBallotContest,
//     seed: ElementModQ): PlaintextContestWithProofs {
//     //Given an encrypted ballot and the necessary crypto context, decrypts it. Each
//     //     decryption includes the necessary Chaum-Pedersen decryption proofs as well.
//     const num_selection = contest.selections.length;
//     const n = new Nonces(seed);
//     const nonces:ElementModQ[] = [];
//     for (let i = 0; i < num_selection; i++) {
//         const value:ElementModQ = n.get(i);
//         nonces.push(value);
//     }
//     const contest_decrypted_lst: PlaintextBallotSelectionWithProof[] = [];
//     for(let selection_idx = 0; selection_idx < num_selection - 1; selection_idx++) {
//         contest_decrypted_lst.push(decrypt_selection(context, contest.selections[selection_idx], nonces[selection_idx]));
//     }
//     return new PlaintextContestWithProofs(contest_decrypted_lst);
// }

// export function decrypt_ballot(
//     context: CiphertextElectionContext,
//     ballot: CiphertextBallot,
//     seed: ElementModQ): PlaintextBallotWithProofs {
//     //Given an encrypted ballot and the necessary crypto context, decrypts it. Each
//     //     decryption includes the necessary Chaum-Pedersen decryption proofs as well.
//     const num_contest = ballot.contests.length;
//     const n = new Nonces(seed);
//     const nonces:ElementModQ[] = [];
//     for (let i = 0; i < num_contest; i++) {
//         const value:ElementModQ = n.get(i);
//         nonces.push(value);
//     }
//     const ballot_decrypted_lst: PlaintextContestWithProofs[] = [];
//     for(let selection_idx = 0; selection_idx < num_contest ; selection_idx++) {
//         ballot_decrypted_lst.push(decrypt_contest(context, ballot.contests[selection_idx], nonces[selection_idx]));
//     }
//     return new PlaintextBallotWithProofs(ballot.ballot_id, ballot_decrypted_lst);
// }

export function validate_decrypted_selection(
    context: AnyElectionContext,
    plaintext: PlaintextBallotSelectionWithProof,
    ciphertext: CiphertextBallotSelection): boolean {
    //Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good.
    const plaintext_msg = plaintext.selection.vote;
    const public_key = context.get_public_key();
    const base_hash = context.base_hash;
    const is_valid = plaintext.decryption_proof.is_valid(BigInt(plaintext_msg), ciphertext.ciphertext, public_key, base_hash);
    return is_valid
}

// export function validate_decrypted_contest(
//     context: AnyElectionContext,
//     plaintext: PlaintextContestWithProofs,
//     ciphertext: CiphertextBallotContest): boolean {
//     const num_selections: number = plaintext.num_selections();
//     for(let i = 0; i < num_selections; i++) {
//         if (!validate_decrypted_selection(context, plaintext.selections[i], ciphertext.selections[i])) {
//             return false;
//         }
//     }
//     return true;
// }

// export function validate_decrypted_ballot(
//     context: AnyElectionContext,
//     plaintext: PlaintextBallotWithProofs,
//     ciphertext: CiphertextBallot): boolean {
//     const num_selections: number = plaintext.num_contests();
//     for(let i = 0; i < num_selections; i++) {
//         if (!validate_decrypted_contest(context, plaintext.contests[i], ciphertext.contests[i])) {
//             return false;
//         }
//     }
//     return true;
// }

// export function tally_encrypted_ballots(
//     context: AnyElectionContext,
//     ballots: CiphertextBallot[]): CiphertextSelectionTally[] {
//     //Homomorphically accumulates the encrypted ballots, returning list of tallies, one per selection.
//     if (context == null) {
//         return [];
//     }
//     // a type-safe mapping of <K,T>, more detail refers to Record<K,T>
//     const total_votes: Map<string, ElGamalCiphertext> = new Map();
//     for (const b of ballots) {
//         for (const c of b.contests) {
//             for (const s of c.selections) {
//                 if (!total_votes.has(s.name)) {
//                     total_votes.set(s.name, s.ciphertext);
//                     // console.log("the original value for ballot length ", ballots.length + " with name " + s.name + " is ", s.ciphertext);
//                 } else {
//                     const new_val = el.elgamal_add(get_optional(total_votes.get(s.name)), s.ciphertext);
//                     total_votes.set(s.name, new_val);
//                     // console.log("the updated value for ballot length ", ballots.length + " with name " + s.name + " is ", new_val);
//
//                 }
//             }
//         }
//     }
//     const return_list = [];
//     for (const name of total_votes.keys()) { // return string[] of keys of total_votes
//         return_list.push(new CiphertextSelectionTally(name, get_optional(total_votes.get(name))));
//     }
//
//     return return_list;
// }

// export function   decrypt_tally(
//     context: PrivateElectionContext,
//     selection: CiphertextSelectionTally,
//     seed: ElementModQ): PlaintextBallotSelectionWithProof {
//     //Given an encrypted, tallied selection, and the necessary crypto context, decrypts it,
//     //     returning the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
//     //     ciphertext. The optional seed is used for computing the proof.

//     const secret_key = context.keypair.secret_key;
//     const plain_selections = new PlaintextBallotSelection(selection.name, selection.total.decrypt(secret_key));
//     const decryption_proof = cp.make_chaum_pedersen_decryption_proof(selection.total, secret_key, seed, context.base_hash);
//     return new PlaintextBallotSelectionWithProof(plain_selections, decryption_proof);
// }

// export function decrypt_tallies(
//     context: PrivateElectionContext,
//     tally: CiphertextSelectionTally[],
//     seed: ElementModQ):PlaintextBallotSelectionWithProof[] {
//     //"Given a list of encrypted tallies and the necessary crypto context, does the
//     //     decryption on the entire list. The optional seed is used for computing the proofs.
//     const lst = [];
//     for (const t of tally) {
//         lst.push(decrypt_tally(context, t, seed));
//     }
//     return lst;
// }

// export function validate_tally(
//     context: AnyElectionContext,
//     tally_plaintext: PlaintextBallotSelectionWithProof,
//     tally_ciphertext: CiphertextSelectionTally): boolean {
//     //Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good.

//     const seed_nonce = TWO_MOD_Q;
//     const ciphertext = tally_ciphertext.total;
//     let secret_key: ElementModQ;
//     if (context instanceof PrivateElectionContext) {
//         secret_key = context.keypair.secret_key;
//     } else {
//         return false;
//     }
//     const pad = cp.make_chaum_pedersen_decryption_proof(ciphertext, secret_key, seed_nonce, context.base_hash);
//     return pad.is_valid(
//         BigInt(tally_plaintext.selection.choice),
//         ciphertext,
//         context.keypair.public_key,
//         context.base_hash);
// }

// export function validate_tallies(
//     context: AnyElectionContext,
//     tally_plaintext: PlaintextBallotSelectionWithProof[],
//     tally_ciphertext: CiphertextSelectionTally[]): boolean {
//     //Validates that the plaintext is provably generated from the ciphertext for every tally. Returns true if
//     //     everything is good.

//     for (let i = 0; i < tally_plaintext.length; i++) {
//         if (!validate_tally(context, tally_plaintext[i], tally_ciphertext[i])) {
//             // console.log("current context is ", context, "tally plaintext ", tally_plaintext[i], "tally ciphertext ", tally_ciphertext[i]);
//             return false;
//         }
//     }
//     return true;
// }

// export function tally_plaintext_ballots(
//     context: AnyElectionContext,
//     ballots: PlaintextBallot[]): PlaintextBallot {
//     //Given a list of ballots, adds their counters and returns a ballot representing the totals of the contest.

//     const totals: Map<string, number> = new Map();
//     for (const b of ballots) {
//         for (const c of b.contests) {
//             for (const s of c.selections) {
//                 if (!totals.has(s.name)) {
//                     totals.set(s.name, s.choice);
//                 } else {
//                     const new_val = get_optional(totals.get(s.name)) + s.choice;
//                     totals.set(s.name, new_val);
//                 }
//             }
//         }
//     }
//     const lst_selections = [];
//     for (const name of context.names) {
//         lst_selections.push(new PlaintextBallotSelection(name, get_optional(totals.get(name))));
//     }
//     const total_contest = new PlaintextBallotContest(lst_selections);
//     return new PlaintextBallot("TOTALS_object_id",  [total_contest]);
// }