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
from electionguard.manifest import Manifest
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
export_data_dir = os.path.join(os.path.dirname(os.getcwd()), "generated_tally_res")
if not os.path.exists(os.path.join(export_data_dir)):
    os.makedirs(export_data_dir)

def _decrypt_with_secret(
    tally: CiphertextTally, secret_key: ElementModQ
) -> Dict[str, Dict[str, int]]:
    """
    Demonstrates how to decrypt a tally with a known secret key
    """
    plaintext_selections: Dict[str, Dict[str, int]] = {}
    for contest_id, contest in tally.contests.items():
        plaintext_selections[contest_id] = {}
        for object_id, selection in contest.selections.items():
            plaintext_tally = selection.ciphertext.decrypt(secret_key)
            plaintext_selections[contest_id][object_id] = plaintext_tally
    return plaintext_selections

def convert_2_readable(decrypted_tallies: Dict[str, Dict[str, int]], manifest: Manifest) -> Dict[str, Dict[str, int]]:
    contest_id_2_name = {}
    selection_id_2_name = {}
    for contest in manifest.contests:
        contest_id_2_name[contest.object_id] = contest.name
        for selection in contest.ballot_selections:
            selection_id_2_name[selection.object_id] = selection.candidate_id
    result: Dict[str, Dict[str, int]] = {}
    for contest_id, selections_dict in decrypted_tallies.items():
        result[contest_id_2_name[contest_id]] = {}
        for selection_id, selection_num in selections_dict.items():
            result[contest_id_2_name[contest_id]][selection_id_2_name[selection_id]] = selection_num
    return result

if not os.path.exists(os.path.join(encypted_file_dir)):
    os.makedirs(encypted_file_dir)
    exit()

for ballotNum in os.listdir(encypted_file_dir):
    if ballotNum == '.DS_Store':
        continue
    print("================ Tally Decryption Start==================")
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
    ballot_id_2_hash = {}

    for ballot_filename in os.listdir(encypted_file_dir_with_ballotNum):
        subject = ballot_factory.get_ciphertext_ballot_from_file(
            encypted_file_dir_with_ballotNum, ballot_filename
        )
        ballot_id_2_hash[subject.code] = subject.crypto_hash
        ballotsList.append(subject)

    for subject in ballotsList:
        encryption_seed = subject.code

        store.set(
            subject.object_id,
            from_ciphertext_ballot(subject, BallotBoxState.CAST),
        )
    time.sleep(3)
    result = tally_ballots(store, internal_manifest, context)
    decrypted_tallies = _decrypt_with_secret(result, keypair.secret_key)
    # print(decrypted_tallies)

    decrypted_tallies_formated = convert_2_readable(decrypted_tallies, manifest)
    output = {}
    output["tally_result"] = decrypted_tallies_formated
    output["ballot_hash"] = ballot_id_2_hash
    decrypted_tallies_json = ballot_factory.export_ballot_to_file(
        output, export_data_dir, "tally_output"
    )
    print("================Final Output Below==================")
    print(output)
    print("================Successfully tallied ballot==================")
