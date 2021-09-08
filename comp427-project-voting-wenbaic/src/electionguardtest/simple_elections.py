from typing import TypeVar, Callable

from hypothesis.strategies import composite, integers, SearchStrategy

from electionguard.simple_election_data import (
    PrivateElectionContext,
    AnyElectionContext,
    PlaintextSelection,
    PlaintextBallot,
)
from electionguardtest.elgamal import elgamal_keypairs
from electionguardtest.group import elements_mod_q

_T = TypeVar("_T")
_DrawType = Callable[[SearchStrategy[_T]], _T]

__presidents = [
    "George Washington",
    "John Adams",
    "Thomas Jefferson",
    "James Madison",
    "James Monroe",
    "John Quincy Adams",
    "Andrew Jackson",
    "Martin Van Buren",
    "William Henry Harrison",
    "John Tyler",
    "James K. Polk",
    "Zachary Taylor",
    "Millard Fillmore",
    "Franklin Pierce",
    "James Buchanan",
    "Abraham Lincoln",
    "Andrew Johnson",
    "Ulysses S. Grant",
    "Rutherford B. Hayes",
    "James Garfield",
    "Chester Arthur",
    "Grover Cleveland",
    "Benjamin Harrison",
    "Grover Cleveland",
    "William McKinley",
    "Theodore Roosevelt",
    "William Howard Taft",
    "Woodrow Wilson",
    "Warren G. Harding",
    "Calvin Coolidge",
    "Herbert Hoover",
    "Franklin D. Roosevelt",
    "Harry S. Truman",
    "Dwight Eisenhower",
    "John F. Kennedy",
    "Lyndon B. Johnson",
    "Richard Nixon",
    "Gerald Ford",
    "Jimmy Carter",
    "Ronald Reagan",
    "George Bush",
    "Bill Clinton",
    "George W. Bush",
    "Barack Obama",
    "Donald Trump",
    "Joe Biden",
]


@composite
def election_contexts(draw: _DrawType, num_candidates: int):
    """
    Generates a `PrivateElectionContext` for an election with the
    given number of candidates.

    :param draw: Hidden argument, used by Hypothesis.
    :param num_candidates: Desired number of candidates for the election.
    """
    keypair = draw(elgamal_keypairs())
    base_hash = draw(elements_mod_q())
    return PrivateElectionContext(
        "Test Election", __presidents[0:num_candidates], keypair, base_hash
    )


@composite
def plaintext_ballot(draw: _DrawType, context: AnyElectionContext, ballot_id: str):
    """
    Generates a plaintext ballot, which might be blank or might have at most one vote
    for a candidate.

    :param draw: Hidden argument, used by Hypothesis.
    :param context: An election context, with the necessary crypto keys, etc.
    :param ballot_id: A string to use for this ballot's identifier.
    """

    # -1 means we select nobody, otherwise we select the nth candidate
    num_names = len(context.names)
    choice = draw(integers(min_value=-1, max_value=num_names - 1))
    selections = [
        PlaintextSelection(context.names[i], 1 if choice == i else 0)
        for i in range(0, num_names)
    ]
    return PlaintextBallot(ballot_id, selections)


@composite
def plaintext_arbitrary_ballot(
    draw: _DrawType, context: AnyElectionContext, ballot_id: str
):
    """
    Generates a plaintext ballot, might be well-formed or might be an overvote.

    :param draw: Hidden argument, used by Hypothesis.
    :param context: An election context, with the necessary crypto keys, etc.
    :param ballot_id: A string to use for this ballot's identifier.
    """

    num_names = len(context.names)

    selections = [
        PlaintextSelection(context.names[i], draw(integers(0, 1)))
        for i in range(0, num_names)
    ]
    return PlaintextBallot(ballot_id, selections)


@composite
def plaintext_ballots(draw: _DrawType, context: AnyElectionContext, num_ballots: int):
    """
    Generates a list of the requested number of ballots. All will be well-formed.
    """
    return [
        draw(plaintext_ballot(context, f"ballot{i:03d}")) for i in range(0, num_ballots)
    ]


@composite
def plaintext_arbitrary_ballots(
    draw: _DrawType, context: AnyElectionContext, num_ballots: int
):
    """
    Generates a list of the requested number of ballots. Some will be well-formed
    and others might have overvotes.
    """
    return [
        draw(plaintext_arbitrary_ballot(context, f"ballot%03d"))
        for i in range(0, num_ballots)
    ]


@composite
def context_and_ballots(draw: _DrawType, num_ballots: int, num_candidates: int = 3):
    """
    Generates a tuple of a PrivateElectionContext and a list of well-formed PlaintextBallots.
    If the number of candidates is 0, then it will be drawn at random from a large set.
    """
    if num_candidates <= 0:
        num_candidates = draw(integers(2, len(__presidents)))
    context = draw(election_contexts(num_candidates))
    ballots = draw(plaintext_ballots(context, num_ballots))
    return context, ballots


@composite
def context_and_arbitrary_ballots(
    draw: _DrawType, num_ballots: int, num_candidates: int = 3
):
    """
    Generates a tuple of a PrivateElectionContext and a list of PlaintextBallots, some
    of which might not be well-formed.
    """
    if num_candidates <= 0:
        num_candidates = draw(integers(2, len(__presidents)))
    context = draw(election_contexts(num_candidates))
    ballots = draw(plaintext_arbitrary_ballots(context, num_ballots))
    return context, ballots
