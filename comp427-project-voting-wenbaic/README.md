# Comp427 / 541: Cryptography & Voting Project

(Based on Microsoft's [ElectionGuard-Python System](https://github.com/microsoft/electionguard-python) with changes from [VotingWorks](https://voting.works).)

The project specifications, as well as the corresponding course slide decks,
can be found on the [Comp427 Piazza](https://piazza.com/class/kk7ghcy8vjwuu).

## Student Information
Please also edit _README.md_ and replace your instructor's name and NetID with your own:

_Student name 1_: Xin Hao

_Student NetID 1_: xh23

_Student name 2_: Wenbai Cheng

_Student NetID 2_: wc47

Your NetID is typically your initials and a numeric digit. That's
what we need here.

_If you contacted us in advance and we approved a late submission,
please cut-and-paste the text from that email here._

## 🚀 Quick Start

Using [**make**](https://www.gnu.org/software/make/manual/make.html), you can kinda do everything all at once:

```
make
```

The unit and integration tests can also be run with make:

```
make test
```

If you're running in an IDE like PyCharm, make sure you've run `make` first,
which will create a Python "virtual environment" and set it up properly.


## 📄 Documentation

For this Comp427 project, we've stripped away a lot of the more complex features
of ElectionGuard. Still, you may find the official documentation to be helpful.

- [GitHub Pages](https://microsoft.github.io/electionguard-python/)
- [Read the Docs](https://electionguard-python.readthedocs.io/)

## Your assignment

Most of the code that you will write will be in: [src/electionguard/simple_elections.py](src/electionguard/simple_elections.py). In this file,
  you'll find a variety of Python functions which can encrypt, decrypt, tally, and verify
  some "simple" elections, where that means that we're only dealing with a single
  contest, where a voter is only allowed to pick zero or one choices. See, as well,
  the corresponding data structures in [src/electionguard/simple_election_data.py](src/electionguard/simple_election_data.py).
  Your code will build on all the other machinery that's already present here,
  including ElGamal encryption. You'll ultimately be graded on getting the
  tests in [tests/test_simple_elections_part1.py](tests/test_simple_elections_part1.py)
  and [tests/test_simple_elections_part2.py](tests/test_simple_elections_part2.py) to
  pass. Some of these tests are incomplete, and you'll need to fill them in.

**Don't forget that you're also responsible for answering some
written questions, at the bottom of this file.**

## Software engineering advice
- Don't just write all your code, then try to run the tests. Instead, pick one
  test or one method at a time, and work your way through each one. You may also wish
  to add additional tests that simplify the process further. 
  A generally good rule of "test-driven development" is to write your tests
  first, which helps you to understand what you're trying to do with your main code
  before you dive into it.
  
- This code is written with the brilliant Python [Hypothesis](https://hypothesis.readthedocs.io/en/latest/)
  library, which can generate random inputs to exercise your code. If and when
  it finds a *counter-example*, it will normally search extra hard to *simplify*
  that counter-example. We've actually disabled that search process because it's too
  slow with the expensive cryptography that we're doing. If it does find a counter-example,
  you can create a new unit test that doesn't use Hypothesis, but rather
  just uses the specific example. That makes it easier for you to reproduce
  and verify your bug is fixed. You can remove the `phases=...` line from the
  Hypothesis `@settings` to enable the shrinking phase, if you've got a failing
  test, you'd like to have a simpler counterexample, and you don't mind waiting a bit.
  
- This code is written with all the fancy *type annotation* features of Python3.
  That means that tools like `mypy` or many IDEs like PyCharm can statically
  check your code for bugs. You can run `make lint`, which will run these checks
  for you. Best to get a clean report from `lint` before you even try to
  run any of the unit tests. Also, a helpful thing is `make auto-lint`, which will
  run the `black` auto-indenter before the lint checker. That makes your
  code cleaner and easier for you and us to read.
  
## Written questions

Let's imagine you were trying to do this encryption, in bulk, from the
output of a paper-based ballot scanner. Assume that the ballots you're
encrypting have 20 contests, each of which has 5 selections. The performance
requirements for one of these would be the same as encryption 20 `PlaintextBallot` 
objects with your code, assuming each has 5 selections. _Write some kind of 
benchmark that generates 100 of these ballots and computes the time for
the encryption computation, including generation of the Chaum-Pedersen proofs,
to run._ Commit this file to your repository.

- What is the name of the Python file which implements your benchmark? `timebenchmark.py under path src/electionguard`
- What command should we type to execute your benchmark? `python src/electionguard/timebenchmark.py   (note: this command should be executed under root folder)`
- On your personal computer (or your partner's), how long does the encryption process take to run? `161.383709192276` seconds
- Now express this in terms of the throughput: `0.6196412295918782` ballots/seconds
- If you knew you needed to encrypt a million ballots in one hour, and assuming you could get
  perfect speedups from running in parallel, how many computers, of the same performance
  as your personal computer, would be necessary to hit the target performance? `499` computers
- Amazon's AWS will rent you "spot instance" virtual CPUs at significant discounts.
  Assume you can get a virtual CPU of the same performance as your personal computer
  for USD 0.077 per hour (i.e., 7.7 cents per hour per virtual CPU). What will it cost, in dollars, 
  to run this computation?  `34.573` dollars
