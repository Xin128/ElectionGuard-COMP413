from typing import NamedTuple, List, Union

from electionguard.chaum_pedersen import (
    DisjunctiveChaumPedersenProof,
    ChaumPedersenDecryptionProof,
    ConstantChaumPedersenProof,
)
from electionguard.elgamal import ElGamalCiphertext, ElGamalKeyPair
from electionguard.group import ElementModP, ElementModQ


class PlaintextSelection(NamedTuple):
    name: str
    """Candidate name"""

    choice: int
    """1 implies a vote for. 0 implies no vote."""


class PlaintextBallot(NamedTuple):
    ballot_id: str
    """The object id of this specific ballot. Will also appear in any corresponding encryption of this ballot."""

    selections: List[PlaintextSelection]
    """The voter's selections. 1 implies a vote for. 0 implies no vote."""

    def num_selections(self) -> int:
        return len(self.selections)

    def is_overvoted(self) -> bool:
        votes_cast = sum([s.choice for s in self.selections])
        return votes_cast > 1


class CiphertextSelectionTally(NamedTuple):
    name: str
    """Candidate name, or `PLACEHOLDER` for a placeholder selection."""

    total: ElGamalCiphertext
    """Tally of encrypted selections."""


class CiphertextSelection(NamedTuple):
    name: str
    """Candidate name, or `PLACEHOLDER` for a placeholder selection."""

    ciphertext: ElGamalCiphertext
    """Encrypted selection."""

    zero_or_one_proof: DisjunctiveChaumPedersenProof
    """Proof that the encrypted selection is either zero or one."""


class CiphertextBallot(NamedTuple):
    ballot_id: str
    """The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot."""

    selections: List[CiphertextSelection]
    """
    Encrypted selections. This will include a "placeholder" selection (with `selection_id` == "PLACEHOLDER"),
    such that the sum of the encrypted selections is exactly one.
    """

    valid_sum_proof: ConstantChaumPedersenProof
    """
    Proof that the sum of the selections (including the placeholder) is exactly one.
    """

    def num_selections(self) -> int:
        return len(self.selections)


class PlaintextSelectionWithProof(NamedTuple):
    selection: PlaintextSelection
    """
    The decrypted version of a ciphertext
    """

    decryption_proof: ChaumPedersenDecryptionProof
    """
    Proof that the decrypted version is consistent with the ciphertext
    """


class PlaintextBallotWithProofs(NamedTuple):
    ballot_id: str
    """The object id of this specific ballot. Will also appear in any corresponding plaintext of this ballot."""

    selections: List[PlaintextSelectionWithProof]
    """
    Each selection along with its proof
    """

    def num_selections(self) -> int:
        return len(self.selections)


class PublicElectionContext(NamedTuple):
    """Election context that would be available to any observer of the election."""

    election_name: str
    """Unique string defining the name of the election."""

    names: List[str]
    """Candidate names for a simple, 1-of-n election."""

    public_key: ElementModP
    """Public encryption key for the election."""

    base_hash: ElementModQ
    """A constant used throughout the election."""

    def to_public_election_context(self) -> "PublicElectionContext":
        return self

    def get_public_key(self) -> ElementModP:
        return self.public_key


class PrivateElectionContext(NamedTuple):
    """Election context that would only be available to an election administrator."""

    election_name: str
    """Unique string defining the name of the election."""

    names: List[str]
    """Candidate names for a simple, 1-of-n election."""

    keypair: ElGamalKeyPair
    """Public and private keys used for the election."""

    base_hash: ElementModQ
    """A constant used throughout the election."""

    def to_public_election_context(self) -> PublicElectionContext:
        return PublicElectionContext(
            self.election_name,
            self.names,
            self.keypair.public_key,
            self.base_hash,
        )

    def get_public_key(self) -> ElementModP:
        return self.keypair.public_key


# Yes, we could have made the public and private election structures more closely related to
# one another with inheritance, but our goal here is to make the code as simple and easy to
# read, even for people who aren't wizards in how Python does object inheritance.


AnyElectionContext = Union[PublicElectionContext, PrivateElectionContext]
# type alias, useful for cases when you're happy with either the public or private context
