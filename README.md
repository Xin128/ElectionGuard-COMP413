# COMP413 Capstone Project: ElectionGuard

Pitch: Integrate “e2e” voting cryptography in a remote vote-by-mail system

Microsoft developed the the ElectionGuard SDK to ensure end-to-end verification in voting process.

With current ElectionGuard encryption system, we can enhance the accessibility of remote voting process with a real-time user interface. It can function as a web page or a mobile application, which integrates with the current ElectionGuard package. As addressed in the documentation of electionGuard, a collaboration with VotingWorks could definitely help facilitate this process as well. I believe that a successful implementation of this system could heavily improve the voter experience with ElectionGuard SDK.

Design & Implementation challenges:

In order to restore trust from voters, the front-end web page should protect user's privacy. How to 
How to integrate the user interface with backend pipeline, and how to make it compatible with the required scanning process?
How to sync ballot result / encrypted code on both mobile and web? How to avoid duplicate requests of a same user from multiple devices?

Microsoft ElectionGuard is a technology that implements “end to end” verifiable voting systems. It’s an open source project, with a “reference implementation” in Python as well as a subset implemented in C/C++. There is even an older, abandoned version in Rust, and an experimental educational version in Kotlin.

Accessible vote-by-mail systems generally run in-browser and help voters ultimately produce a paper ballot, which they print at home and submit via the postal mail. In an e2e version of this, we would pass the user’s preferences into ElectionGuard, compute the entire encrypted ballot, take its hash, and print that as a “receipt” for the voter to keep and ultimately verify their ballot. There’s also a random number, printed on the ballot, from which the ciphertext can be deterministically rederived.

 

Implementation challenges: 
How to implement this in the browser? WebAssembly for the cryptographic parts? Pure TypeScript?
How to test and validate compatibility with the existing ElectionGuard?
Which AVBM technology to integrate with for a demo? Anywhere Ballot? One of the VotingWorks projects?

