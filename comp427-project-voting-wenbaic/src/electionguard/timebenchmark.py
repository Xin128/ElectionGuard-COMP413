from electionguard.simple_election_data import (
    PrivateElectionContext,
    PlaintextSelection,
    PlaintextBallot,
)
from electionguard.simple_elections import encrypt_ballot

from electionguard.elgamal import elgamal_keypair_random
from electionguard.group import TWO_MOD_Q
import random
import time


list_prsident = [
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

ballot_list = []
context_list = []
for i in range(2000):
    sample_context = PrivateElectionContext(
        "Test Election",
        random.sample(list_prsident, 5),
        elgamal_keypair_random(),
        TWO_MOD_Q,
    )

    num_names = len(sample_context.names)
    # choice = draw(integers(min_value=-1, max_value=num_names - 1))
    selections = []
    choice = random.randint(0, num_names - 1)
    for i in range(0, num_names):
        if i == choice:
            selections.append(PlaintextSelection(sample_context.names[i], 1))
        else:
            selections.append(PlaintextSelection(sample_context.names[i], 0))
    context_list.append(sample_context)
    ballot_list.append(PlaintextBallot(str(i) + " ballot", selections))


start_time = time.time()
seed_nounce = TWO_MOD_Q
for i in range(2000):
    encrypted_ballot = encrypt_ballot(context_list[i], ballot_list[i], seed_nounce)
end_time = time.time()
print(start_time, end_time, end_time - start_time)


# execute command: python src/electionguard/timebenchmark.py
# 161.383709192276 seconds
# 0.6196412295918782 ballots/second
# 448.288 ~ 4 cpus
# 34.574 dollars
