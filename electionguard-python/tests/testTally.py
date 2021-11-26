from datetime import timedelta
from typing import Dict

from electionguard.ballot import (
    BallotBoxState,
    SubmittedBallot,
    from_ciphertext_ballot,
)
from electionguard.data_store import DataStore

from electionguard.encrypt import encrypt_ballot
from electionguard.group import ElementModQ, ONE_MOD_Q
from electionguard.tally import CiphertextTally, tally_ballots, tally_ballot


from electionguard_tools.strategies.election import (
    elections_and_ballots,
    ELECTIONS_AND_BALLOTS_TUPLE_TYPE,
)
from electionguard_tools.factories.election_factory import ElectionFactory
from electionguard_tools.helpers.tally_accumulate import accumulate_plaintext_ballots

from electionguard.elgamal import ElGamalKeyPair
from electionguard.group import (
    ElementModQ,
    TWO_MOD_P,
    ONE_MOD_Q,
    mult_p,
    g_pow_p,
)
from electionguard.manifest import InternalManifest
from electionguard.election import (
    CiphertextElectionContext,
    make_ciphertext_election_context,
)
import electionguard_tools.factories.ballot_factory as BallotFactory
import os

def _decrypt_with_secret(
        tally: CiphertextTally, secret_key: ElementModQ
) -> Dict[str, int]:
    """
    Demonstrates how to decrypt a tally with a known secret key
    """
    plaintext_selections: Dict[str, int] = {}
    for _, contest in tally.contests.items():
        for object_id, selection in contest.selections.items():
            plaintext_tally = selection.ciphertext.decrypt(secret_key)
            plaintext_selections[object_id] = plaintext_tally

    return plaintext_selections

export_data_dir = os.path.join(os.path.dirname(os.getcwd()), "tally_outputs")

election_factory = ElectionFactory()
ballot_factory = BallotFactory.BallotFactory()
keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))

# set the datastore to store all the ballots
store = DataStore()

encypted_file_dir = os.path.join(os.path.dirname(os.getcwd()), 'encrypted_data')
generated_file_dir = os.path.join(os.path.dirname(os.getcwd()), 'generated_data')
ballotNum = "127"
encypted_file_dir_with_ballotNum = os.path.join(encypted_file_dir, ballotNum)
generated_data_dir_with_ballotNum = os.path.join(generated_file_dir, ballotNum)
for ballot_filename in os.listdir(encypted_file_dir_with_ballotNum):
    subject = ballot_factory.get_ciphertext_ballot_from_file(encypted_file_dir_with_ballotNum, ballot_filename)
    manifest = election_factory.get_simple_manifest_from_file_self_defined_directory(generated_data_dir_with_ballotNum, "manifest.json")
    internal_manifest = InternalManifest(manifest)
    context = make_ciphertext_election_context(
        number_of_guardians=1,
        quorum=1,
        elgamal_public_key=keypair.public_key,
        commitment_hash=ElementModQ(2),
        manifest_hash=manifest.crypto_hash(),
    )
    # add to the ballot store
    store.set(
        subject.object_id,
        from_ciphertext_ballot(subject, BallotBoxState.CAST),
    )

# act
result = tally_ballots(store, internal_manifest, context)
print("ciphertext ballots length is ", result.cast())
print ("tally ballot result is ", result)
decrypted_subject_to_export = ballot_factory.export_ballot_to_file(
    result, export_data_dir, "tally_output"
)
# self.assertIsNotNone(result)

# Assert
decrypted_tallies = _decrypt_with_secret(result, keypair.secret_key)
print("decrypted_tally")
print(decrypted_tallies)
# self.assertEqual(plaintext_tallies, decrypted_tallies)



# keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
# secret_key = TWO_MOD_P
# election = election_factory.get_simple_manifest_from_file()
# internal_manifest, context = election_factory.get_fake_ciphertext_election(
#     election, keypair.public_key
# )
# ballots = ballot_factory.get_simple_ballots_from_file()
#
# # Tally the plaintext ballots for comparison later
# plaintext_tallies = accumulate_plaintext_ballots(ballots)
# print("plaintext tallies ", plaintext_tallies)
#
# # encrypt each ballot
# store = DataStore()
# encryption_seed = ElectionFactory.get_encryption_device().get_hash()
# for ballot in ballots:
#     encrypted_ballot = encrypt_ballot(
#         ballot, internal_manifest, context, encryption_seed
#     )
#     encryption_seed = encrypted_ballot.code
#     # print("encrypted ballot is ", encrypted_ballot)
#     # add to the ballot store
#     store.set(
#         encrypted_ballot.object_id,
#         from_ciphertext_ballot(encrypted_ballot, BallotBoxState.CAST),
#     )
#
# print("finish encrypting all the ballots!!!!!!")
# export_data_dir = os.path.join(os.path.dirname(os.getcwd()), "tally_outputs")
#
# # act
# result = tally_ballots(store, internal_manifest, context)
# # print("result is ", result)
# decrypted_subject_to_export = ballot_factory.export_ballot_to_file(
#     result, export_data_dir, "sample_tally_result2"
# )
#
# # Assert
# decrypted_tallies = _decrypt_with_secret(result, secret_key)
# print("decrypted_tally")
# print(decrypted_tallies)