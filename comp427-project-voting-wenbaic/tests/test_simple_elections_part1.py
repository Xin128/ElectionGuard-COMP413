import unittest
from typing import Tuple, List

from hypothesis import HealthCheck, Phase
from hypothesis import given, settings

from electionguard.group import (
    ElementModQ,
)
from electionguard.chaum_pedersen import (
    make_fake_chaum_pedersen_generic,
    ChaumPedersenDecryptionProof,
)
from electionguard.group import ONE_MOD_P
from electionguard.nonces import Nonces
from electionguard.simple_election_data import (
    PrivateElectionContext,
    PlaintextBallot,
    PlaintextSelection,
    PlaintextSelectionWithProof,
)
from electionguard.simple_elections import (
    encrypt_selection,
    decrypt_selection,
    validate_encrypted_selection,
    validate_decrypted_selection,
)
from electionguardtest.group import elements_mod_q_no_zero, elements_mod_q
from electionguardtest.simple_elections import (
    context_and_ballots,
)


class TestPart1(unittest.TestCase):
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
    def test_part1_encryption_decryption_inverses(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots

        selections: List[PlaintextSelection] = ballots[0].selections
        nonces = Nonces(seed_nonce, "part1-ballot-nonces")[0 : len(selections)]
        decrypt_nonces = Nonces(seed_nonce, "part1-ballot-decrypt-nonces")[
            0 : len(selections)
        ]

        encryptions = [
            encrypt_selection(context, selections[i], nonces[i])
            for i in range(0, len(selections))
        ]
        self.assertNotIn(None, encryptions)
        decryptions_with_nonce: List[int] = [
            e[0].ciphertext.decrypt_known_nonce(context.keypair.public_key, e[1])
            for e in encryptions
        ]
        decryptions_with_key: List[PlaintextSelectionWithProof] = [
            decrypt_selection(context, encryptions[i][0], decrypt_nonces[i])
            for i in range(0, len(selections))
        ]
        #
        for s, dn, dk in zip(selections, decryptions_with_nonce, decryptions_with_key):
            self.assertEqual(s.choice, dn)
            self.assertEqual(s, dk.selection)

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
    def test_part1_proof_validation(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        seed_nonce: ElementModQ,
    ):
        context, ballots = context_and_ballots

        selections: List[PlaintextSelection] = ballots[0].selections
        nonces = Nonces(seed_nonce, "part1-ballot-nonces")[0 : len(selections)]
        decrypt_nonces = Nonces(seed_nonce, "part1-ballot-decrypt-nonces")[
            0 : len(selections)
        ]

        encryptions = [
            encrypt_selection(context, selections[i], nonces[i])
            for i in range(0, len(selections))
        ]
        self.assertNotIn(None, encryptions)

        for e in encryptions:
            self.assertTrue(validate_encrypted_selection(context, e[0]))

        decryptions_with_key: List[PlaintextSelectionWithProof] = [
            decrypt_selection(context, encryptions[i][0], decrypt_nonces[i])
            for i in range(0, len(selections))
        ]

        for d, e in zip(decryptions_with_key, encryptions):
            self.assertTrue(validate_decrypted_selection(context, d, e[0]))

    @settings(
        deadline=None,
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=10,
        # disabling the "shrink" phase, because it runs very slowly
        phases=[Phase.explicit, Phase.reuse, Phase.generate, Phase.target],
    )
    @given(context_and_ballots(1), elements_mod_q_no_zero(), elements_mod_q())
    def test_part1_invalid_encryption_proofs_fail(
        self,
        context_and_ballots: Tuple[PrivateElectionContext, List[PlaintextBallot]],
        original_seed_nonce: ElementModQ,
        substitute_seed_nonce: ElementModQ,
    ):
        # TODO: for part1, write a Hypothesis test that tries to substitute a different
        #   ciphertext with an existing encryption proof, and then do it again for the
        #   proof that accompanies the plaintext when you decrypt it. Validate that when
        #   you make changes to the ciphertext or to the proof, the proof validation fails.

        context, ballots = context_and_ballots

        selections: List[PlaintextSelection] = ballots[0].selections
        # nonces = Nonces(seed_nonce, "part1-ballot-nonces")[0: len(selections)]
        original_decrypt_nonces = Nonces(
            original_seed_nonce, "part1-ballot-decrypt-nonces"
        )[0 : len(selections) // 2]

        substitute_decrypt_nonces = Nonces(
            substitute_seed_nonce, "part1-ballot-decrypt-nonces"
        )[0 : len(selections) // 2]

        original_encryptions = [
            encrypt_selection(context, selections[i], original_decrypt_nonces[i])
            for i in range(0, len(selections) // 2)
        ]

        substitute_encryptions = [
            encrypt_selection(
                context,
                selections[len(selections) // 2 + i],
                substitute_decrypt_nonces[i],
            )
            for i in range(0, len(selections) // 2)
        ]

        self.assertNotIn(None, original_encryptions)
        self.assertNotIn(None, substitute_encryptions)

        original_decryptions_with_key: List[PlaintextSelectionWithProof] = [
            decrypt_selection(
                context, original_encryptions[i][0], original_decrypt_nonces[i]
            )
            for i in range(0, len(original_encryptions))
        ]
        # make changes to proof
        original_decryptions_with_wrong_proof: List[PlaintextSelectionWithProof] = [
            PlaintextSelectionWithProof(
                selections[i],
                ChaumPedersenDecryptionProof(
                    make_fake_chaum_pedersen_generic(
                        ONE_MOD_P,
                        ONE_MOD_P,
                        ONE_MOD_P,
                        ONE_MOD_P,
                        original_seed_nonce,
                        substitute_seed_nonce,
                    )
                ),
            )
            for i in range(0, len(original_encryptions))
        ]

        for d, e in zip(original_decryptions_with_wrong_proof, original_encryptions):
            self.assertFalse(validate_decrypted_selection(context, d, e[0]))

        # make changes to ciphertext
        substitute_decryptions_with_key: List[PlaintextSelectionWithProof] = [
            decrypt_selection(
                context, substitute_encryptions[i][0], substitute_decrypt_nonces[i]
            )
            for i in range(0, len(substitute_encryptions))
        ]

        for d, e in zip(substitute_decryptions_with_key, original_encryptions):
            self.assertFalse(validate_decrypted_selection(context, d, e[0]))

        for d, e in zip(original_decryptions_with_key, original_encryptions):
            self.assertTrue(validate_decrypted_selection(context, d, e[0]))
