from electionguard.decrypt_with_secrets import (
    decrypt_selection_with_secret,
    decrypt_selection_with_nonce,
    decrypt_contest_with_secret,
    decrypt_contest_with_nonce,
    decrypt_ballot_with_nonce,
    decrypt_ballot_with_secret,
)
from electionguard.elgamal import ElGamalKeyPair, ElGamalCiphertext
from electionguard.group import (
    ElementModQ,
    TWO_MOD_P,
    ONE_MOD_Q,
    mult_p,
    g_pow_p,
)
from electionguard.ballot import (
    BallotBoxState,
    SubmittedBallot,
    from_ciphertext_ballot,
    CiphertextBallot,
)
from electionguard.election import (
    CiphertextElectionContext,
    make_ciphertext_election_context,
)
from electionguard.manifest import InternalManifest
from electionguard.logs import log_warning, log_info
import electionguard_tools.factories.ballot_factory as BallotFactory
import electionguard_tools.factories.election_factory as ElectionFactory

from electionguard.tally import CiphertextTally, tally_ballots, tally_ballot
from electionguard.data_store import DataStore

import os
from typing import Dict
import time

#
election_factory = ElectionFactory.ElectionFactory()
ballot_factory = BallotFactory.BallotFactory()

keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
encypted_file_dir = os.path.join(os.path.dirname(os.getcwd()), "encrypted_data")
generated_file_dir = os.path.join(os.path.dirname(os.getcwd()), "generated_data")


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
if not os.path.exists(os.path.join(encypted_file_dir)):
    os.makedirs(encypted_file_dir)
    exit()

for ballotNum in os.listdir(encypted_file_dir):
    if ballotNum == '.DS_Store':
        continue
    print("================ballot_num:" + ballotNum + "==================")
    ballotsList = []
    encypted_file_dir_with_ballotNum = os.path.join(encypted_file_dir, ballotNum)
    generated_data_dir_with_ballotNum = os.path.join(generated_file_dir, ballotNum)
    manifest = (
        election_factory.get_simple_manifest_from_file_self_defined_directory(
            generated_data_dir_with_ballotNum, "manifest.json"
        )
    )
    internal_manifest = InternalManifest(manifest)
    context = make_ciphertext_election_context(
        number_of_guardians=1,
        quorum=1,
        elgamal_public_key=keypair.public_key,
        commitment_hash=ElementModQ(2),
        manifest_hash=manifest.crypto_hash(),
    )
    store = DataStore()
    for ballot_filename in os.listdir(encypted_file_dir_with_ballotNum):
        subject = ballot_factory.get_ciphertext_ballot_from_file(
            encypted_file_dir_with_ballotNum, ballot_filename
        )
        ballotsList.append(subject)

    time.sleep(3)
    for subject in ballotsList:
        encryption_seed = subject.code
        store.set(
            subject.object_id,
            from_ciphertext_ballot(subject, BallotBoxState.CAST),
        )

    result = tally_ballots(store, internal_manifest, context)
    decrypted_tallies = _decrypt_with_secret(result, keypair.secret_key)
    print("decrypted_tallies!!!!!!")
    print(decrypted_tallies)

# from electionguard_tools.factories.election_factory import ElectionFactory
# from electionguard.encrypt import encrypt_ballot
#
# election_factory = ElectionFactory()
# ballot_factory = BallotFactory.BallotFactory()
# keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
# secret_key = TWO_MOD_P
# election = election_factory.get_simple_manifest_from_file()
# internal_manifest, context = election_factory.get_fake_ciphertext_election(
#     election, keypair.public_key
# )
# ballots = ballot_factory.get_simple_ballots_from_file()
#
#
# # encrypt each ballot
# store = DataStore()
# encryption_seed = ElectionFactory.get_encryption_device().get_hash()
# print(len(ballots))
# for ballot in ballots:
#     print("what the f")
#     encrypted_ballot = encrypt_ballot(
#         ballot, internal_manifest, context, encryption_seed
#     )
#     encryption_seed = encrypted_ballot.code
#     # add to the ballot store
#     store.set(
#         encrypted_ballot.object_id,
#         from_ciphertext_ballot(encrypted_ballot, BallotBoxState.CAST),
#     )
# # act
# result = tally_ballots(store, internal_manifest, context)
# decrypted_tallies = _decrypt_with_secret(result, keypair.secret_key)
# print("decrypted_tallies!!!!!!")
# print(decrypted_tallies)
