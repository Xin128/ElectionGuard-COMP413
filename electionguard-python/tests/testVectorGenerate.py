from electionguard.elgamal import ElGamalKeyPair
from electionguard.encrypt import encrypt_ballot
import electionguard_tools.factories.ballot_factory as BallotFactory
import electionguard_tools.factories.election_factory as ElectionFactory
from electionguard.manifest import InternalManifest
from electionguard.group import (
    ElementModQ,
    TWO_MOD_P,
    g_pow_p
)
import os

ballot_factory = BallotFactory.BallotFactory()
election_factory = ElectionFactory.ElectionFactory()
SEED = ElementModQ(
    88136692332113344175662474900446441286169260372780056734314948839391938984061
)

keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
election = election_factory.get_simple_manifest_from_file()
internal_manifest, context = election_factory.get_fake_ciphertext_election(
    election, keypair.public_key
)
nonce_seed = ElementModQ(40358)

export_data_dir = os.path.join(os.path.dirname(os.getcwd()), "generated_test_inputs")
if not os.path.exists(os.path.join(export_data_dir)):
    os.makedirs(export_data_dir)

manifest = (election_factory.get_simple_manifest_from_file())
internal_manifest = InternalManifest(manifest)
name = str(internal_manifest.manifest_hash)[:3]

ballots = ballot_factory.generate_fake_plaintext_ballots_for_election(
    internal_manifest, 5
)
test_vectors = []

for subject in ballots:
    test = {}
    test["input"] = {"manifest": manifest, "ballot": subject}

    # Act
    result_from_seed = encrypt_ballot(
        subject, internal_manifest, context, SEED, nonce_seed
    )
    test["output"] = str(result_from_seed.crypto_hash)
    test_vectors.append(test)
test_output = ballot_factory.export_ballot_to_file(
    test_vectors, export_data_dir, "testcases-" + name
)
print("test out successfully generated; Filename: ", "testcases-" + name + ".json")
