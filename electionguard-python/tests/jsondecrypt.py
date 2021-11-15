from copy import deepcopy
from datetime import timedelta
from random import Random
from typing import Tuple

from hypothesis import HealthCheck, Phase
from hypothesis import given, settings
from hypothesis.strategies import integers


from electionguard.chaum_pedersen import DisjunctiveChaumPedersenProof
from electionguard.decrypt_with_secrets import (
    decrypt_selection_with_secret,
    decrypt_selection_with_nonce,
    decrypt_contest_with_secret,
    decrypt_contest_with_nonce,
    decrypt_ballot_with_nonce,
    decrypt_ballot_with_secret,
)
from electionguard.elgamal import ElGamalKeyPair, ElGamalCiphertext
from electionguard.encrypt import (
    encrypt_contest,
    encrypt_selection,
    EncryptionMediator,
)
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


import electionguard_tools.factories.ballot_factory as BallotFactory
import electionguard_tools.factories.election_factory as ElectionFactory
from electionguard_tools.strategies.elgamal import elgamal_keypairs
from electionguard_tools.strategies.group import elements_mod_q_no_zero
import os
from electionguard.manifest import InternalManifest

election_factory = ElectionFactory.ElectionFactory()
ballot_factory = BallotFactory.BallotFactory()

keypair = ElGamalKeyPair(TWO_MOD_P, g_pow_p(TWO_MOD_P))
print("keypair!", keypair)
election = election_factory.get_simple_manifest_from_file()
# internal_manifest, context = election_factory.get_fake_ciphertext_election(
#     election, keypair.public_key
# )

data = ballot_factory.get_simple_ballot_from_file()

device = election_factory.get_encryption_device()
# operator = EncryptionMediator(internal_manifest, context, device)
# # Act
# subject = operator.encrypt(data)
# encrypted_subject_to_export =  ballot_factory.export_ballot_to_file(subject, 'input/encrypted_ballot_5')
# EXPORT FILE TO JSON

encypted_file_dir = os.path.join(os.path.dirname(os.getcwd()), 'encrypted_data')
generated_file_dir = os.path.join(os.path.dirname(os.getcwd()), 'generated_data')
if not os.path.exists(os.path.join(encypted_file_dir)):
    os.makedirs(encypted_file_dir)
    exit()
for ballotNum in os.listdir(encypted_file_dir):
    if ballotNum != '330':
        continue
    print('ballot num!', ballotNum)
    encypted_file_dir_with_ballotNum = os.path.join(encypted_file_dir, ballotNum)
    generated_data_dir_with_ballotNum = os.path.join(generated_file_dir, ballotNum)
    for ballot_filename in os.listdir(encypted_file_dir_with_ballotNum):
        subject = ballot_factory.get_ciphertext_ballot_from_file(encypted_file_dir_with_ballotNum, ballot_filename)
        manifest = election_factory.get_simple_manifest_from_file_self_defined_directory(generated_data_dir_with_ballotNum, "manifest.json")
        print('manifest crypto hash', manifest.crypto_hash())
        internal_manifest = InternalManifest(manifest)
        print('internal manifest hash', internal_manifest.manifest_hash)

        context = make_ciphertext_election_context(
            number_of_guardians=1,
            quorum=1,
            elgamal_public_key=keypair.public_key,
            commitment_hash=ElementModQ(2),
            manifest_hash=manifest.crypto_hash(),
        )
        print("decrypt with secret")
        result_from_key = decrypt_ballot_with_secret(
            subject,
            internal_manifest,
            context.crypto_extended_base_hash,
            keypair.public_key,
            keypair.secret_key,
            remove_placeholders=False,
        )
        if result_from_key == None:
            print("!!!!!!!!!!!!ALERT!!!!!!!!!!!!!!!!!!!")
            print('ballot num!', ballotNum)
            print("!!!!!!!!!!!!ALERT!!!!!!!!!!!!!!!!!!!")

            # break
        print('----------------------------------------------------------------------------')
        print("DECRPTED_RESULT BELOW:")
        print(result_from_key)
        print('----------------------------------------------------------------------------')

        # result_from_nonce = decrypt_ballot_with_nonce(
        #     subject,
        #     internal_manifest,
        #     context.crypto_extended_base_hash,
        #     keypair.public_key,
        #     remove_placeholders=False,
        # )
        # result_from_nonce_seed = decrypt_ballot_with_nonce(
        #     subject,
        #     internal_manifest,
        #     context.crypto_extended_base_hash,
        #     keypair.public_key,
        #     subject.nonce,
        #     remove_placeholders=False,
        # )

