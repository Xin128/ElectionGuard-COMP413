import unittest

from hypothesis import given
from hypothesis.strategies import integers

from electionguard.elgamal import (
    ElGamalKeyPair,
    elgamal_encrypt,
    elgamal_add,
    elgamal_keypair_from_secret,
    elgamal_keypair_random,
)
from electionguard.group import (
    ElementModQ,
    g_pow_p,
    G,
    P,
    Q,
    ZERO_MOD_Q,
    TWO_MOD_Q,
    ONE_MOD_Q,
    ONE_MOD_P,
)
from electionguard.utils import get_optional
from electionguardtest.elgamal import elgamal_keypairs
from tests.test_group import elements_mod_q_no_zero


class TestElGamal(unittest.TestCase):
    def test_simple_elgamal_encryption_decryption(self):
        nonce = ONE_MOD_Q
        secret_key = TWO_MOD_Q
        keypair = get_optional(elgamal_keypair_from_secret(secret_key))
        public_key = keypair.public_key

        self.assertLess(public_key.to_int(), P)
        elem = g_pow_p(ZERO_MOD_Q)
        self.assertEqual(elem, ONE_MOD_P)  # g^0 == 1

        ciphertext = get_optional(elgamal_encrypt(0, nonce, keypair.public_key))
        self.assertEqual(G, ciphertext.pad.to_int())
        self.assertEqual(
            pow(ciphertext.pad.to_int(), secret_key.to_int(), P),
            pow(public_key.to_int(), nonce.to_int(), P),
        )
        self.assertEqual(
            ciphertext.data.to_int(),
            pow(public_key.to_int(), nonce.to_int(), P),
        )

        plaintext = ciphertext.decrypt(keypair.secret_key)

        self.assertEqual(0, plaintext)

    @given(integers(0, 100), elgamal_keypairs())
    def test_elgamal_encrypt_requires_nonzero_nonce(
        self, message: int, keypair: ElGamalKeyPair
    ):
        self.assertEqual(None, elgamal_encrypt(message, ZERO_MOD_Q, keypair.public_key))

    def test_elgamal_keypair_from_secret_requires_key_greater_than_one(self):
        self.assertEqual(None, elgamal_keypair_from_secret(ZERO_MOD_Q))
        self.assertEqual(None, elgamal_keypair_from_secret(ONE_MOD_Q))

    @given(integers(0, 100), elements_mod_q_no_zero(), elgamal_keypairs())
    def test_elgamal_encryption_decryption_inverses(
        self, message: int, nonce: ElementModQ, keypair: ElGamalKeyPair
    ):
        ciphertext = get_optional(elgamal_encrypt(message, nonce, keypair.public_key))
        plaintext = ciphertext.decrypt(keypair.secret_key)

        self.assertEqual(message, plaintext)

    @given(integers(0, 100), elements_mod_q_no_zero(), elgamal_keypairs())
    def test_elgamal_encryption_decryption_with_known_nonce_inverses(
        self, message: int, nonce: ElementModQ, keypair: ElGamalKeyPair
    ):
        ciphertext = get_optional(elgamal_encrypt(message, nonce, keypair.public_key))
        plaintext = ciphertext.decrypt_known_nonce(keypair.public_key, nonce)

        self.assertEqual(message, plaintext)

    @given(elgamal_keypairs())
    def test_elgamal_generated_keypairs_are_within_range(self, keypair: ElGamalKeyPair):
        self.assertLess(keypair.public_key.to_int(), P)
        self.assertLess(keypair.secret_key.to_int(), Q)
        self.assertEqual(g_pow_p(keypair.secret_key), keypair.public_key)

    @given(
        elgamal_keypairs(),
        integers(0, 100),
        elements_mod_q_no_zero(),
        integers(0, 100),
        elements_mod_q_no_zero(),
    )
    def test_elgamal_add_homomorphic_accumulation_decrypts_successfully(
        self,
        keypair: ElGamalKeyPair,
        m1: int,
        r1: ElementModQ,
        m2: int,
        r2: ElementModQ,
    ):
        c1 = get_optional(elgamal_encrypt(m1, r1, keypair.public_key))
        c2 = get_optional(elgamal_encrypt(m2, r2, keypair.public_key))
        c_sum = elgamal_add(c1, c2)
        total = c_sum.decrypt(keypair.secret_key)

        self.assertEqual(total, m1 + m2)

    def test_elgamal_add_requires_args(self):
        self.assertRaises(Exception, elgamal_add)

    @given(elgamal_keypairs())
    def test_elgamal_keypair_produces_valid_residue(self, keypair):
        self.assertTrue(keypair.public_key.is_valid_residue())

    def test_elgamal_keypair_random(self):
        # Act
        random_keypair = elgamal_keypair_random()
        random_keypair_two = elgamal_keypair_random()

        # Assert
        self.assertIsNotNone(random_keypair)
        self.assertIsNotNone(random_keypair.public_key)
        self.assertIsNotNone(random_keypair.secret_key)
        self.assertNotEqual(random_keypair, random_keypair_two)
