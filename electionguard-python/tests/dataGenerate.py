from datetime import timedelta
from typing import List, Dict

from hypothesis import given, HealthCheck, settings, Phase
from hypothesis.strategies import integers

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
ballot_factory = BallotFactory.BallotFactory()
election_factory = ElectionFactory.ElectionFactory()
import os
import os
export_data_dir = os.path.join(os.path.dirname(os.getcwd()), 'generated_data')
if not os.path.exists(os.path.join(export_data_dir)):
    os.makedirs(export_data_dir)
class TestElections(BaseTestCase):
    """Election hypothesis encryption tests"""

    @settings(
        deadline=timedelta(milliseconds=10000),
        suppress_health_check=[HealthCheck.too_slow],
        max_examples=5,
    )
    @given(election_descriptions())
    def test_generators_yield_valid_output(self, manifest: Manifest):
        """
        Tests that our Hypothesis election strategies generate "valid" output, also exercises the full stack
        of `is_valid` methods.
        """
        internal_manifest = InternalManifest(manifest)
        name = str(internal_manifest.manifest_hash)[:3]
        encrypted_manifest_to_export = ballot_factory.export_ballot_to_file(manifest, export_data_dir, 'manifest-' + name)
        self.assertTrue(encrypted_manifest_to_export == None)
        ballot = ballot_factory.generate_fake_plaintext_ballots_for_election(internal_manifest, 5)
        encrypted_ballot_to_export = ballot_factory.export_ballot_to_file(ballot, export_data_dir, 'ballot-' + name)
        self.assertTrue(encrypted_ballot_to_export == None)
