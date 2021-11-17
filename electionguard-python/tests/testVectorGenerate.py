from datetime import timedelta
from typing import List, Dict

from hypothesis import given, HealthCheck, settings, Phase
from hypothesis.strategies import integers

from src.electionguard.elgamal import ElGamalKeyPair
from tests.base_test_case import BaseTestCase

from electionguard.ballot import CiphertextBallot
from electionguard.decrypt_with_secrets import decrypt_ballot_with_secret
from electionguard.elgamal import ElGamalCiphertext, elgamal_encrypt, elgamal_add
from electionguard.encrypt import encrypt_ballot
from electionguard.group import ElementModQ
from electionguard.manifest import Manifest
from electionguard.nonces import Nonces
from electionguard_tools.strategies.election import (
    election_descriptions,
    elections_and_ballots,
    ELECTIONS_AND_BALLOTS_TUPLE_TYPE,
)
from electionguard_tools.factories.election_factory import ElectionFactory
from electionguard_tools.strategies.group import elements_mod_q
from electionguard_tools.helpers.tally_accumulate import accumulate_plaintext_ballots

import electionguard_tools.factories.ballot_factory as BallotFactory
import electionguard_tools.factories.election_factory as ElectionFactory
from electionguard.manifest import InternalManifest
from electionguard.group import (
    ElementModQ,
    TWO_MOD_P,
    ONE_MOD_Q,
    mult_p,
    g_pow_p,
    TWO_MOD_Q,
)

ballot_factory = BallotFactory.BallotFactory()
election_factory = ElectionFactory.ElectionFactory()
# SEED = election_factory.get_encryption_device().get_hash()
SEED = ElementModQ(
    88136692332113344175662474900446441286169260372780056734314948839391938984061
)

keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
election = election_factory.get_simple_manifest_from_file()
internal_manifest, context = election_factory.get_fake_ciphertext_election(
    election, keypair.public_key
)
nonce_seed = ElementModQ(40358)

import os
import os

export_data_dir = os.path.join(os.path.dirname(os.getcwd()), "generated_data")
if not os.path.exists(os.path.join(export_data_dir)):
    os.makedirs(export_data_dir)


class TestElections(BaseTestCase):
    """Election hypothesis encryption tests"""

    @settings(
        deadline=timedelta(milliseconds=10000),
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=1,
    )
    @given(election_descriptions())
    def test_generate_test_vectors(self, manifest: Manifest):
        """
        Tests that our Hypothesis election strategies generate "valid" output, also exercises the full stack
        of `is_valid` methods.
        """

        internal_manifest = InternalManifest(manifest)
        name = str(internal_manifest.manifest_hash)[:3]
        print("export data directory", export_data_dir)
        print("manifest is ", manifest)
        ballots = ballot_factory.generate_fake_plaintext_ballots_for_election(
            internal_manifest, 5
        )
        test_vectors = []
        self.assertTrue(len(test_vectors) == 0)

        for subject in ballots:
            test = {}
            test["input"] = {"manifest": manifest, "ballot": subject}

            # Act
            # result = encrypt_ballot(subject, internal_manifest, context, SEED)
            result_from_seed = encrypt_ballot(
                subject, internal_manifest, context, SEED, nonce_seed
            )
            print("seed is ", SEED)
            print("result from seed is ", result_from_seed)
            test["output"] = str(result_from_seed.crypto_hash)
            test_vectors.append(test)
        print("rest vectors ", test_vectors)
        test_output = ballot_factory.export_ballot_to_file(
            test_vectors, export_data_dir, "testcases-" + name
        )
