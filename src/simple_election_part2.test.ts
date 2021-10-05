/*eslint prefer-const: "warn"*/
import { elgamal_encrypt } from "./elgamal";
import { ElementModQ, ElementModP } from "./group";
import { Nonces } from "./nonces";
import {
    PrivateElectionContext,
    PlaintextBallot,
    CiphertextSelection,
    CiphertextBallot,
    PlaintextBallotWithProofs,
} from "./simple_election_data";
import {
    encrypt_ballot,
    decrypt_ballot,
    validate_encrypted_ballot,
    validate_decrypted_ballot,
    encrypt_ballots,
    tally_encrypted_ballots,
    validate_tallies,
    decrypt_tallies,
    tally_plaintext_ballots,
} from "./simple_elections";
import { elements_mod_q_no_zero } from "./groupUtils";
import {
    context_and_ballots,
    context_and_arbitrary_ballots,
    getRandomNumberInclusive,
} from "./simpleElectionsUtil"
import { get_optional } from "./utils";

describe("TestPart2", () => {

    test("test_encryption_decryption_inverses", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        // eslint-disable-next-line prefer-const
        [context, ballots] = context_and_ballots(1);
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        ballots.forEach((ballot) => {
            // eslint-disable prefer-const
            const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(context, ballot, seed_nonce));
            // eslint-disable-next-line prefer-const
            let decrypted_ballot: PlaintextBallotWithProofs = decrypt_ballot(context, encrypted_ballot, seed_nonce);
            for (let i = 0; i < ballot.num_selections(); i++) {
                expect(ballot.selections[i]).toEqual(decrypted_ballot.selections[i].selection);
            }
            expect(validate_decrypted_ballot(context, decrypted_ballot, encrypted_ballot)).toBe(true);
        });
    });

    test("test_unique_ballot_ids", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballots: CiphertextBallot[];
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        // eslint-disable-next-line prefer-const
        [context, ballots] = context_and_ballots(getRandomNumberInclusive(2, 20));
        // eslint-disable-next-line prefer-const
        cballots = get_optional(encrypt_ballots(context, ballots, seed_nonce));
        expect(cballots).not.toEqual(null);

        // convert to a set, which will collapse duplicates
        let bids = new Set();
        cballots.forEach((c) => {
            bids.add(c);
        });
        expect(cballots.length).toEqual(bids.size);

    });

    test("test_unique_nonces", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballots: CiphertextBallot[];
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        [context, ballots] = context_and_ballots(getRandomNumberInclusive(2, 20));
        cballots = get_optional(encrypt_ballots(context, ballots, seed_nonce));
        expect(cballots).not.toEqual(null);

        // We're going to extract all of the "pad" elements from the ElGamal ciphertexts,
        // and related values from within the Chaum-Pedersen proofs. If they ever repeat,
        // that means the nonce seed generation isn't working. Every encryption should
        // have a unique nonce. Despite this, they're all still deterministic! This is
        // checked in test_encryption_determinism() below.

        let all_pads: ElementModP[] = [];
        let sum_pads: ElementModP[] = [];
        let sum_challenges: ElementModQ[] = [];
        let all_proof_a_vals: ElementModP[] = [];
        let all_proof_c_vals: ElementModQ[] = [];
        cballots.forEach((c) => {
            sum_pads = [...sum_pads, c.valid_sum_proof.pad];
            sum_challenges = [...sum_challenges, c.valid_sum_proof.challenge];
            c.selections.forEach((s) => {
                all_pads = [...all_pads, s.ciphertext.pad];
                all_proof_a_vals = [...all_proof_a_vals, s.zero_or_one_proof.proof_one_pad]
                all_proof_a_vals = [...all_proof_a_vals, s.zero_or_one_proof.proof_zero_pad]
            });
        });
        expect(all_pads.length).toEqual(new Set(all_pads).size);
        expect(sum_pads.length).toEqual(new Set(sum_pads).size);
        expect(sum_challenges.length).toEqual(new Set(sum_challenges).size);
        expect(all_proof_a_vals.length).toEqual(new Set(all_proof_a_vals).size);
        expect(all_proof_c_vals.length).toEqual(new Set(all_proof_c_vals).size);

        // Now, we're going to decrypt the ballots and make similar assertions about
        // the uniqueness of the proofs used in the decryption.

        let decrypt_seeds = new Nonces(seed_nonce, "test_unique_nonce_seeds").slice(0, cballots.length);
        let decrypt_ballots: PlaintextBallotWithProofs[] = [];
        cballots.forEach((cballot, idx) => {
            decrypt_ballots = [...decrypt_ballots, decrypt_ballot(context, cballot, decrypt_seeds[idx])];
        });

        let dec_proof_a_vals: ElementModP[] = [];
        let dec_proof_c_vals: ElementModQ[] = [];
        decrypt_ballots.forEach((db) => {
            db.selections.forEach((ds) => {
                dec_proof_a_vals = [...dec_proof_a_vals, ds.decryption_proof.proof.a];
                dec_proof_c_vals = [...dec_proof_c_vals, ds.decryption_proof.proof.c];
            });
        });

        expect(dec_proof_a_vals.length).toEqual(new Set(dec_proof_a_vals).size);
        expect(dec_proof_c_vals.length).toEqual(new Set(dec_proof_c_vals).size);
    });

    test("test_encryption_determinism", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballots1: CiphertextBallot[];
        let cballots2: CiphertextBallot[];
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        // originally the input to context_and_ballots is a hypothesis test
        [context, ballots] = context_and_ballots(Math.random() * (21 - 2) + 2);
        cballots1 = get_optional(encrypt_ballots(context, ballots, seed_nonce));
        cballots2 = get_optional(encrypt_ballots(context, ballots, seed_nonce));
        expect(cballots1).not.toEqual(null);
        expect(cballots2).not.toEqual(null);

        // So long as we're specifying the seed nonce the same way twice, we should get
        // absolutely identical ciphertext ballots & proofs, all the way down. Of course,
        // we want to ensure that when we encrypt a whole bunch of ballots, that the
        // nonces are different each time. That's what test_unique_nonces is all about.
        expect(cballots1).toEqual(cballots2);

        // Similarly, if we decrypt a ballot twice with the same nonce, we should
        // get identical plaintexts with identical proofs.
        const d1 = decrypt_ballot(context, cballots1[0], seed_nonce)
        const d2 = decrypt_ballot(context, cballots1[0], seed_nonce)
        expect(d1).toEqual(d2);
        
    });

    test("test_chaum_pedersen_ballot_proofs_validate", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballot: CiphertextBallot;
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        [context, ballots] = context_and_ballots(1);
        cballot = get_optional(encrypt_ballot(context, ballots[0], seed_nonce));
        expect(cballot).not.toEqual(null);
        expect(validate_encrypted_ballot(context, cballot)).toBe(true);
    });

    test("test_broken_chaum_pedersen_ballot_proofs_fail", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballot_good: CiphertextBallot;
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        [context, ballots] = context_and_ballots(1);
        cballot_good = get_optional(encrypt_ballot(context, ballots[0], seed_nonce));
        expect(cballot_good).not.toEqual(null);
        expect(validate_encrypted_ballot(context, cballot_good)).toBe(true);

        // we're going to take the first candidate and make its ciphertext be an encryption of 2,
        // which should cause all sorts of fun failures

        const alt_nonce = new Nonces(seed_nonce, "testing is fun").slice(0, 1)[0];
        const bid = cballot_good.ballot_id;
        const selections = cballot_good.selections;
        const valid_sum_proof = cballot_good.valid_sum_proof;
        let name, ciphertext, zero_or_one_proof;
        name = selections[0].name;
        ciphertext = selections[0].ciphertext;
        ciphertext; // prevent value unused lint error
        zero_or_one_proof = selections[0].zero_or_one_proof;
        expect(
            zero_or_one_proof.is_valid(
                cballot_good.selections[0].ciphertext,
                context.get_public_key(),
                context.base_hash,
            )
        ).toBe(true);

        const ciphertext_bad = get_optional(elgamal_encrypt(2n, alt_nonce, context.get_public_key()));
        expect(
            zero_or_one_proof.is_valid(
                ciphertext_bad, context.get_public_key(), context.base_hash
            )
        ).toBe(false);

        const selection0_bad = new CiphertextSelection(name, ciphertext_bad, zero_or_one_proof);
        const cballot_bad = new CiphertextBallot(
            bid, [selection0_bad, ...selections.slice(1)], valid_sum_proof
        )
        expect(validate_encrypted_ballot(context, cballot_bad)).toBe(false);

    });

    test("test_invalid_ballots_dont_encrypt", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballot: CiphertextBallot;
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        [context, ballots] = context_and_arbitrary_ballots(1);
        cballot = get_optional(encrypt_ballot(context, ballots[0], seed_nonce));
        if (ballots[0].is_overvoted()) {
            expect(cballot).toEqual(null);
        } else {
            expect(cballot).not.toEqual(null);
        }
    });

    test("test_ballot_accumulation", () => {
        let context: PrivateElectionContext;
        let ballots: PlaintextBallot[];
        let cballots: CiphertextBallot[];
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        const decrypt_nonce: ElementModQ = elements_mod_q_no_zero();
        [context, ballots] = context_and_ballots(10);
        cballots = get_optional(encrypt_ballots(context, ballots, seed_nonce));
        expect(cballots).not.toEqual(null);

        let tally = tally_encrypted_ballots(context, cballots);
        const pballots = decrypt_tallies(context, tally, decrypt_nonce);

        expect(validate_tallies(context, pballots, tally)).toBe(true);

        // while we're here, let's make sure that if we leave out a ballot, the tallies
        // won't validate.
        if (cballots.length > 1) {
            // tally = tally_encrypted_ballots(context, cballots)
            let bad_tally = tally_encrypted_ballots(context, cballots.slice(1));

            expect(tally.length).toEqual(bad_tally.length);  // same number of candidates
            expect(validate_tallies(context, pballots, bad_tally)).toBe(false);

        }
            
        let plain_tally = tally_plaintext_ballots(context, ballots);
        let same_totals: boolean[] = [];
        plain_tally.selections.forEach((tally, idx) => {
            same_totals = [...same_totals, tally.equals(pballots[idx].selection)];
        });

        expect(same_totals.every(Boolean)).toBe(true);

    });
});
