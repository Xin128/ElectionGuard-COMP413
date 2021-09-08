import unittest
from typing import Tuple, List

from hypothesis import HealthCheck, Phase
from hypothesis import given, settings
from hypothesis.strategies import integers

from electionguard.elgamal import elgamal_encrypt
from electionguard.group import (
    ElementModQ,
    ElementModP,
)
from electionguard.nonces import Nonces
from electionguard.simple_election_data import (
    PrivateElectionContext,
    PlaintextBallot,
    CiphertextSelection,
    CiphertextBallot,
    PlaintextBallotWithProofs,
)
from electionguard.simple_elections import (
    encrypt_ballot,
    decrypt_ballot,
    validate_encrypted_ballot,
    validate_decrypted_ballot,
    encrypt_ballots,
    tally_encrypted_ballots,
    validate_tallies,
    decrypt_tallies,
    tally_plaintext_ballots,
)
from electionguardtest.group import elements_mod_q_no_zero
from electionguardtest.simple_elections import (
    context_and_ballots,
    context_and_arbitrary_ballots,
)


class TestPart2(unittest.TestCase):
    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        context_and_ballots(1),
        elements_mod_q_no_zero(),
    )
    def test_encryption_decryption_inverses(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        # TODO: for part2, write a Hypothesis test analogous to
        #   test_part1_encryption_decryption_inverses, above, but which encrypts and decrypts
        #   an entire ballot (with the encrypt_ballot and decrypt_ballot functions) rather than
        #   just a specific selection. Don't forget to check that any "placeholder" selections
        #   are removed as part of the decryption process.

        # TODO: Also, while you have a plaintext ballot, its encryption, and then a decryption,
        #   you'll also have a series of proofs that come with it, which you should check with
        #   your validate_decrypted_ballot function.

        context, ballots = context_and_ballots
        for ballot in ballots:
            encrypted_ballot = encrypt_ballot(context, ballot, seed_nonce)
            decrypted_ballot = decrypt_ballot(context, encrypted_ballot, seed_nonce)
            for i in range(ballot.num_selections()):
                self.assertEqual(
                    ballot.selections[i], decrypted_ballot.selections[i].selection
                )
            self.assertTrue(
                validate_decrypted_ballot(context, decrypted_ballot, encrypted_ballot)
            )

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        integers(2, 20).flatmap(lambda n: context_and_ballots(n)),
        elements_mod_q_no_zero(),
    )
    def test_unique_ballot_ids(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballots = encrypt_ballots(context, ballots, seed_nonce)
        self.assertIsNotNone(cballots)

        # convert to a set, which will collapse duplicates
        bids = {c.ballot_id for c in cballots}
        self.assertEqual(len(cballots), len(bids))

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        integers(2, 20).flatmap(lambda n: context_and_ballots(n)),
        elements_mod_q_no_zero(),
    )
    def test_unique_nonces(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballots = encrypt_ballots(context, ballots, seed_nonce)
        self.assertIsNotNone(cballots)

        # We're going to extract all of the "pad" elements from the ElGamal ciphertexts,
        # and related values from within the Chaum-Pedersen proofs. If they ever repeat,
        # that means the nonce seed generation isn't working. Every encryption should
        # have a unique nonce. Despite this, they're all still deterministic! This is
        # checked in test_encryption_determinism() below.

        all_pads: List[ElementModP] = []
        sum_pads: List[ElementModP] = []
        sum_challenges: List[ElementModQ] = []
        all_proof_a_vals: List[ElementModP] = []
        all_proof_c_vals: List[ElementModQ] = []
        for c in cballots:
            sum_pads.append(c.valid_sum_proof.pad)
            sum_challenges.append(c.valid_sum_proof.challenge)
            for s in c.selections:
                all_pads.append(s.ciphertext.pad)
                all_proof_a_vals.append(s.zero_or_one_proof.proof_one_pad)
                all_proof_a_vals.append(s.zero_or_one_proof.proof_zero_pad)
        self.assertEqual(len(all_pads), len(set(all_pads)))
        self.assertEqual(len(sum_pads), len(set(sum_pads)))
        self.assertEqual(len(sum_challenges), len(set(sum_challenges)))
        self.assertEqual(len(all_proof_a_vals), len(set(all_proof_a_vals)))
        self.assertEqual(len(all_proof_c_vals), len(set(all_proof_c_vals)))

        # Now, we're going to decrypt the ballots and make similar assertions about
        # the uniqueness of the proofs used in the decryption.

        decrypt_seeds = Nonces(seed_nonce, "test_unique_nonce_seeds")[0 : len(cballots)]
        decrypt_ballots: List[PlaintextBallotWithProofs] = []
        for i in range(0, len(cballots)):
            decrypt_ballots.append(
                decrypt_ballot(context, cballots[i], decrypt_seeds[i])
            )

        dec_proof_a_vals: List[ElementModP] = []
        dec_proof_c_vals: List[ElementModQ] = []
        for db in decrypt_ballots:
            for ds in db.selections:
                dec_proof_a_vals.append(ds.decryption_proof.proof.a)
                dec_proof_c_vals.append(ds.decryption_proof.proof.c)

        self.assertEqual(len(dec_proof_a_vals), len(set(dec_proof_a_vals)))
        self.assertEqual(len(dec_proof_c_vals), len(set(dec_proof_c_vals)))

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        integers(2, 20).flatmap(lambda n: context_and_ballots(n)),
        elements_mod_q_no_zero(),
    )
    def test_encryption_determinism(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballots1 = encrypt_ballots(context, ballots, seed_nonce)
        cballots2 = encrypt_ballots(context, ballots, seed_nonce)
        self.assertIsNotNone(cballots1)
        self.assertIsNotNone(cballots2)

        # So long as we're specifying the seed nonce the same way twice, we should get
        # absolutely identical ciphertext ballots & proofs, all the way down. Of course,
        # we want to ensure that when we encrypt a whole bunch of ballots, that the
        # nonces are different each time. That's what test_unique_nonces is all about.

        self.assertEqual(cballots1, cballots2)

        # # Similarly, if we decrypt a ballot twice with the same nonce, we should
        # # get identical plaintexts with identical proofs.
        #
        d1 = decrypt_ballot(context, cballots1[0], seed_nonce)
        d2 = decrypt_ballot(context, cballots1[0], seed_nonce)
        self.assertEqual(d1, d2)

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        context_and_ballots(1),
        elements_mod_q_no_zero(),
    )
    def test_chaum_pedersen_ballot_proofs_validate(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballot = encrypt_ballot(context, ballots[0], seed_nonce)
        self.assertIsNotNone(cballot)
        self.assertTrue(validate_encrypted_ballot(context, cballot))

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        context_and_ballots(1),
        elements_mod_q_no_zero(),
    )
    def test_broken_chaum_pedersen_ballot_proofs_fail(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballot_good = encrypt_ballot(context, ballots[0], seed_nonce)
        self.assertIsNotNone(cballot_good)
        self.assertTrue(validate_encrypted_ballot(context, cballot_good))

        # we're going to take the first candidate and make its ciphertext be an encryption of 2,
        # which should cause all sorts of fun failures

        alt_nonce = Nonces(seed_nonce, "testing is fun")[0]
        bid, selections, valid_sum_proof = cballot_good
        name, ciphertext, zero_or_one_proof = selections[0]
        self.assertTrue(
            zero_or_one_proof.is_valid(
                cballot_good.selections[0].ciphertext,
                context.get_public_key(),
                context.base_hash,
            )
        )

        ciphertext_bad = elgamal_encrypt(2, alt_nonce, context.get_public_key())
        self.assertFalse(
            zero_or_one_proof.is_valid(
                ciphertext_bad, context.get_public_key(), context.base_hash
            )
        )

        selection0_bad = CiphertextSelection(name, ciphertext_bad, zero_or_one_proof)
        cballot_bad = CiphertextBallot(
            bid, [selection0_bad] + selections[1:], valid_sum_proof
        )
        self.assertFalse(validate_encrypted_ballot(context, cballot_bad))

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=50,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        context_and_arbitrary_ballots(1),
        elements_mod_q_no_zero(),
    )
    def test_invalid_ballots_dont_encrypt(
        self,
        context_and_ballots: PrivateElectionContext,
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballot = encrypt_ballot(context, ballots[0], seed_nonce)
        if ballots[0].is_overvoted():
            self.assertIsNone(cballot)
        else:
            self.assertIsNotNone(cballot)

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(
        context_and_ballots(10),
        elements_mod_q_no_zero(),
        elements_mod_q_no_zero(),
    )
    def test_ballot_accumulation(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
        decrypt_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots
        cballots = encrypt_ballots(context, ballots, seed_nonce)
        self.assertIsNotNone(cballots)

        tally = tally_encrypted_ballots(context, cballots)
        pballots = decrypt_tallies(context, tally, decrypt_nonce)

        self.assertTrue(validate_tallies(context, pballots, tally))

        # while we're here, let's make sure that if we leave out a ballot, the tallies
        # won't validate.
        if len(cballots) > 1:
            tally = tally_encrypted_ballots(context, cballots)
            bad_tally = tally_encrypted_ballots(context, cballots[1:])
            self.assertEqual(len(tally), len(bad_tally))  # same number of candidates
            self.assertFalse(validate_tallies(context, pballots, bad_tally))

        plain_tally = tally_plaintext_ballots(context, ballots)
        same_totals = [
            plain_tally.selections[i] == pballots[i].selection
            for i in range(0, len(plain_tally.selections))
        ]

        self.assertTrue(all(same_totals))
