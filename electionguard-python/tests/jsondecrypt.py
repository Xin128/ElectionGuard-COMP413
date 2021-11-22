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
from electionguard.election import (
    CiphertextElectionContext,
    make_ciphertext_election_context,
)
from electionguard.manifest import InternalManifest
from electionguard.logs import log_warning, log_info
import electionguard_tools.factories.ballot_factory as BallotFactory
import electionguard_tools.factories.election_factory as ElectionFactory
import os

election_factory = ElectionFactory.ElectionFactory()
ballot_factory = BallotFactory.BallotFactory()

keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
encypted_file_dir = os.path.join(os.path.dirname(os.getcwd()), "encrypted_data")
generated_file_dir = os.path.join(os.path.dirname(os.getcwd()), "generated_data")

if not os.path.exists(os.path.join(encypted_file_dir)):
    os.makedirs(encypted_file_dir)
    exit()

for ballotNum in os.listdir(encypted_file_dir):
    if ballotNum == '.DS_Store':
        continue
    encypted_file_dir_with_ballotNum = os.path.join(encypted_file_dir, ballotNum)
    generated_data_dir_with_ballotNum = os.path.join(generated_file_dir, ballotNum)
    for ballot_filename in os.listdir(encypted_file_dir_with_ballotNum):
        subject = ballot_factory.get_ciphertext_ballot_from_file(
            encypted_file_dir_with_ballotNum, ballot_filename
        )
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
        result_from_key = decrypt_ballot_with_secret(
            subject,
            internal_manifest,
            context.crypto_extended_base_hash,
            keypair.public_key,
            keypair.secret_key,
            remove_placeholders=False,
        )

        result_from_nonce = decrypt_ballot_with_nonce(
            subject,
            internal_manifest,
            context.crypto_extended_base_hash,
            keypair.public_key,
            remove_placeholders=False,
        )
        result_from_nonce_seed = decrypt_ballot_with_nonce(
            subject,
            internal_manifest,
            context.crypto_extended_base_hash,
            keypair.public_key,
            subject.nonce,
            remove_placeholders=False,
        )
        if (
            result_from_key == None
            or result_from_nonce == None
            or result_from_nonce_seed == None
        ):
            log_warning(f"Unable To Decrypt for Manifest: {ballotNum}")
        print(
            "------------------------ Successfully Decrypt: "
            + ballot_filename
            + " ---------------------------"
        )
        print(result_from_key)
