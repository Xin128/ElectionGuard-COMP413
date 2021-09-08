from typing import Optional, Tuple, List, Dict, Final

# Based on make lint, those import are unnecessary
# from .utils import flatmap_optional, get_optional

from electionguard.simple_election_data import (
    CiphertextBallot,
    PlaintextBallot,
    PlaintextSelection,
    CiphertextSelection,
    PrivateElectionContext,
    CiphertextSelectionTally,
    AnyElectionContext,
    PlaintextSelectionWithProof,
    PlaintextBallotWithProofs,
    ElGamalCiphertext,
)
from electionguard.group import ElementModQ, TWO_MOD_Q, add_q
from electionguard.nonces import Nonces

import electionguard.elgamal as el
import electionguard.chaum_pedersen as cp

PLACEHOLDER_NAME: Final[str] = "PLACEHOLDER"


def encrypt_selection(
    context: AnyElectionContext,
    selection: PlaintextSelection,
    seed_nonce: ElementModQ,
) -> Optional[Tuple[CiphertextSelection, ElementModQ]]:
    """
    Given a selection and the necessary election context, encrypts the selection and returns the
    encrypted selection plus the encryption nonce. If anything goes wrong, `None` is returned.
    """
    # Lint: change from public_key = context.keypair.public_key
    public_key = context.get_public_key()
    encryption = el.elgamal_encrypt(selection.choice, seed_nonce, public_key)
    if not isinstance(encryption, el.ElGamalCiphertext):
        return None
    zero_or_one_pad = cp.make_disjunctive_chaum_pedersen(
        encryption,
        seed_nonce,
        public_key,
        context.base_hash,
        seed_nonce,
        selection.choice,
    )
    cipher = CiphertextSelection(selection.name, encryption, zero_or_one_pad)

    return cipher, seed_nonce


def encrypt_ballot(
    context: AnyElectionContext, ballot: PlaintextBallot, seed_nonce: ElementModQ
) -> Optional[CiphertextBallot]:
    """
    Given a ballot and the necessary election context, encrypts the ballot and returns the
    ciphertext. If anything goes wrong, `None` is returned.
    """

    # TODO: implement this for part 2, be sure to use your encrypt_selection from part 1.
    if ballot.is_overvoted():
        return None
    num_selection = len(ballot.selections)
    nounces = Nonces(seed_nonce).__getitem__(slice(num_selection + 1))
    # Lint: change from public_key = context.keypair.public_key
    public_key = context.get_public_key()
    ciphered_selections = []
    start = True
    total_constant_int = 0
    agg_seed = None
    for selection_idx in range(num_selection):
        plain_selection = ballot.selections[selection_idx]
        encrypted_tuple = encrypt_selection(
            context, plain_selection, nounces[selection_idx]
        )
        # Lint: check if encrypted_tuple is None, return None if true
        if encrypted_tuple is None:
            return None
        encrypted_text = encrypted_tuple.__getitem__(0)
        # Lint: check if encrypted_text is an instance of CiphertextSelection, return None if false
        if not isinstance(encrypted_text, CiphertextSelection):
            return None
        ciphered_selections.append(encrypted_text)
        if start:
            overall_encryption = encrypted_text.ciphertext
            agg_seed = nounces[selection_idx]
            start = False
        else:
            if isinstance(overall_encryption, ElGamalCiphertext) and isinstance(
                agg_seed, ElementModQ
            ):
                overall_encryption = el.elgamal_add(
                    overall_encryption, encrypted_text.ciphertext
                )
                agg_seed = add_q(agg_seed, nounces[selection_idx])
        total_constant_int += plain_selection.choice

    if total_constant_int == 0:
        placeholder_choice = 1
    else:
        placeholder_choice = 0
    placeHolderSelection = PlaintextSelection(PLACEHOLDER_NAME, placeholder_choice)
    # Lint: assign encrypt_selection(context, placeHolderSelection, seed_nonce) to placeholder_encrypt_selection,
    # check if placeholder_encrypt_selection is None, return None if true;
    # else, assign placeholder_encrypt_selection.__getitem__(0) to placeholder_encrypt_text
    placeholder_encrypt_selection = encrypt_selection(
        context, placeHolderSelection, seed_nonce
    )
    if placeholder_encrypt_selection is None:
        return None
    placeholder_encrypt_text = placeholder_encrypt_selection.__getitem__(0)

    # Lint: check if placeholder_encrypt_text is CiphertextSelection, return None if false
    if not isinstance(placeholder_encrypt_text, CiphertextSelection):
        return None
    ciphered_selections.append(placeholder_encrypt_text)
    # Lint: assign el.elgamal_encrypt(placeHolderSelection.choice, nounces[-1], public_key)
    # to overall_encryption_elgamal_encryption; check if overall_encryption_elgamal_encryption is None,
    # return None if true
    # overall_encryption_elgamal_encryption = el.elgamal_encrypt(
    #     placeHolderSelection.choice, nounces[-1], public_key
    # )
    overall_encryption_elgamal_encryption = placeholder_encrypt_text.ciphertext
    if overall_encryption_elgamal_encryption is None:
        return None

    overall_encryption = el.elgamal_add(
        overall_encryption, overall_encryption_elgamal_encryption
    )
    if isinstance(seed_nonce, ElementModQ) and isinstance(agg_seed, ElementModQ):
        agg_seed = add_q(agg_seed, seed_nonce)
    else:
        return None

    total_constant_int = total_constant_int + placeholder_choice

    chaum_proof = cp.make_constant_chaum_pedersen(
        overall_encryption,
        total_constant_int,
        agg_seed,
        public_key,
        seed_nonce,
        context.base_hash,
    )

    cipher = CiphertextBallot(ballot.ballot_id, ciphered_selections, chaum_proof)
    return cipher


def encrypt_ballots(
    context: AnyElectionContext, ballots: List[PlaintextBallot], seed_nonce: ElementModQ
) -> Optional[List[CiphertextBallot]]:
    """
    Given a list of ballots and the necessary election context, encrypts the ballots and returns
    a list of the ciphertexts. If anything goes wrong, `None` is returned. This also ensures that
    the nonce seeds are unique for each ballot.
    """
    encrypted_ballots = []
    num_ballots = len(ballots)
    nounces = Nonces(seed_nonce).__getitem__(slice(num_ballots))
    for ballot_idx in range(num_ballots):
        # Lint: each time check if encrypt_ballot(context, ballots[ballot_idx], nounces[ballot_idx]) is None,
        # return None if ture; else assign it to ballot_encrypted
        ballot_encrypted = encrypt_ballot(
            context, ballots[ballot_idx], nounces[ballot_idx]
        )
        if ballot_encrypted is None:
            return None
        encrypted_ballots.append(ballot_encrypted)
    return encrypted_ballots


def validate_encrypted_selection(
    context: AnyElectionContext, selection: CiphertextSelection
) -> bool:
    """Validates the proof on an encrypted selection. Returns true if everything is good."""
    message = selection.ciphertext
    # Lint: change from public_key = context.keypair.public_key
    public_key = context.get_public_key()
    base_hash = context.base_hash

    return selection.zero_or_one_proof.is_valid(message, public_key, base_hash)


def validate_encrypted_ballot(
    context: AnyElectionContext, ballot: CiphertextBallot
) -> bool:
    """Validates all the proofs on the encrypted ballot. Returns true if everything is good."""
    message = None
    for selection in ballot.selections:
        if not validate_encrypted_selection(context, selection):
            return False
        else:
            if message is None:
                message = selection.ciphertext
            else:
                message = el.elgamal_add(message, selection.ciphertext)
    if isinstance(message, ElGamalCiphertext):
        return ballot.valid_sum_proof.is_valid(
            message, context.get_public_key(), context.base_hash
        )
    else:
        return False


def decrypt_selection(
    context: PrivateElectionContext,
    selection: CiphertextSelection,
    seed: ElementModQ,
) -> PlaintextSelectionWithProof:
    """Given an encrypted selection and the necessary crypto context, decrypts it, returning
    the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
    ciphertext. The optional seed is used for computing the proof."""
    secret_key = context.keypair.secret_key
    choice = selection.ciphertext.decrypt(secret_key)
    plaintextSelection = PlaintextSelection(selection.name, choice)
    descryption_proof = cp.make_chaum_pedersen_decryption_proof(
        selection.ciphertext, secret_key, seed, context.base_hash
    )
    return PlaintextSelectionWithProof(plaintextSelection, descryption_proof)


def decrypt_ballot(
    context: PrivateElectionContext,
    ballot: CiphertextBallot,
    seed: ElementModQ,
) -> PlaintextBallotWithProofs:
    """Given an encrypted ballot and the necessary crypto context, decrypts it. Each
    decryption includes the necessary Chaum-Pedersen decryption proofs as well."""

    num_selection = len(ballot.selections)
    nounces = Nonces(seed).__getitem__(slice(num_selection))
    ballot_decrypted_lst = []
    for selection_idx in range(num_selection - 1):
        ballot_decrypted_lst.append(
            decrypt_selection(
                context, ballot.selections[selection_idx], nounces[selection_idx]
            )
        )
    return PlaintextBallotWithProofs(ballot.ballot_id, ballot_decrypted_lst)


def validate_decrypted_selection(
    context: AnyElectionContext,
    plaintext: PlaintextSelectionWithProof,
    ciphertext: CiphertextSelection,
) -> bool:
    """Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good."""

    plaintext_msg = plaintext.selection.choice
    # Lint: change from public_key = context.keypair.public_key
    public_key = context.get_public_key()
    base_hash = context.base_hash

    is_valid = plaintext.decryption_proof.is_valid(
        plaintext_msg, ciphertext.ciphertext, public_key, base_hash
    )
    return is_valid


def validate_decrypted_ballot(
    context: AnyElectionContext,
    plaintext: PlaintextBallotWithProofs,
    ciphertext: CiphertextBallot,
) -> bool:
    """Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good."""
    num_selections = len(plaintext.selections)
    for i in range(num_selections):
        if not validate_decrypted_selection(
            context, plaintext.selections[i], ciphertext.selections[i]
        ):
            return False
    return True


def tally_encrypted_ballots(
    context: AnyElectionContext, ballots: List[CiphertextBallot]
) -> List[CiphertextSelectionTally]:
    """Homomorphically accumulates the encrypted ballots, returning list of tallies, one per selection."""

    if context is None:
        return []
    total_votes: Dict[str, el.ElGamalCiphertext] = {}
    for b in ballots:
        for s in b.selections:
            if s.name not in total_votes:
                total_votes[s.name] = s.ciphertext
            else:
                total_votes[s.name] = el.elgamal_add(total_votes[s.name], s.ciphertext)
    return [CiphertextSelectionTally(name, total_votes[name]) for name in total_votes]


def decrypt_tally(
    context: PrivateElectionContext,
    selection: CiphertextSelectionTally,
    seed: ElementModQ,
) -> PlaintextSelectionWithProof:
    """Given an encrypted, tallied selection, and the necessary crypto context, decrypts it,
    returning the plaintext selection along with a Chaum-Pedersen proof of its correspondence to the
    ciphertext. The optional seed is used for computing the proof."""

    secret_key = context.keypair.secret_key
    plain_selections = PlaintextSelection(
        selection.name, selection.total.decrypt(secret_key)
    )
    decryption_proof = cp.make_chaum_pedersen_decryption_proof(
        selection.total, secret_key, seed, context.base_hash
    )
    return PlaintextSelectionWithProof(plain_selections, decryption_proof)


def decrypt_tallies(
    context: PrivateElectionContext,
    tally: List[CiphertextSelectionTally],
    seed: ElementModQ,
) -> List[PlaintextSelectionWithProof]:
    """Given a list of encrypted tallies and the necessary crypto context, does the
    decryption on the entire list. The optional seed is used for computing the proofs."""

    # TODO: implement this for part 2. Be sure to use decrypt_tally.
    return [decrypt_tally(context, t, seed) for t in tally]


def validate_tally(
    context: AnyElectionContext,
    tally_plaintext: PlaintextSelectionWithProof,
    tally_ciphertext: CiphertextSelectionTally,
) -> bool:
    """Validates that the plaintext is provably generated from the ciphertext. Returns true if everything is good."""

    # TODO: implement this for part 2. It's similar to, but not the same as validate_decrypted_ballot.
    seed_nonce = TWO_MOD_Q
    ciphertext = tally_ciphertext.total
    # Lint: check context and assign context.keypair.secret_key to secret_key when true, return False when false
    secret_key: ElementModQ
    if isinstance(context, PrivateElectionContext):
        secret_key = context.keypair.secret_key
    else:
        return False
    pad = cp.make_chaum_pedersen_decryption_proof(
        ciphertext, secret_key, seed_nonce, context.base_hash
    )
    return pad.is_valid(
        tally_plaintext.selection.choice,
        ciphertext,
        context.keypair.public_key,
        context.base_hash,
    )


def validate_tallies(
    context: AnyElectionContext,
    tally_plaintext: List[PlaintextSelectionWithProof],
    tally_ciphertext: List[CiphertextSelectionTally],
) -> bool:
    """Validates that the plaintext is provably generated from the ciphertext for every tally. Returns true if
    everything is good."""

    # TODO: implement this for part 2. Be sure to use validate_tally.
    for i in range(len(tally_plaintext)):
        if not validate_tally(context, tally_plaintext[i], tally_ciphertext[i]):
            return False
    return True


def tally_plaintext_ballots(
    context: AnyElectionContext, ballots: List[PlaintextBallot]
) -> PlaintextBallot:
    """Given a list of ballots, adds their counters and returns a ballot representing the totals of the contest."""

    # You may find this method to be handy. We use it for some unit tests.

    totals: Dict[str, int] = {}
    for b in ballots:
        for s in b.selections:
            if s.name not in totals:
                totals[s.name] = s.choice
            else:
                totals[s.name] += s.choice

    return PlaintextBallot(
        "TOTALS", [PlaintextSelection(name, totals[name]) for name in context.names]
    )
