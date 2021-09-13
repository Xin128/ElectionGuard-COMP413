## COMP413 Capstone Project: ElectionGuard

# Project Description
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

# Getting Started

```bash
# Install dependencies
yarn install

# Now you can run various yarn commands:
yarn cli
yarn lint
yarn test
yarn build-all
yarn ts-node <filename>
yarn esbuild-browser
...
```

* Take a look at all the scripts in package.json
* For publishing to npm, use `yarn publish` (or `npm publish`)

# esbuild

[esbuild](https://esbuild.github.io/) is an extremely fast bundler that supports a [large part of the TypeScript syntax](https://esbuild.github.io/content-types/#typescript). This project uses it to bundle for browsers (and Node.js if you want).

```bash
# Build for browsers
yarn esbuild-browser:dev
yarn esbuild-browser:watch

# Build the cli for node
yarn esbuild-node:dev
yarn esbuild-node:watch
```

You can generate a full clean build with `yarn build-all` (which uses both `tsc` and `esbuild`).

* `package.json` includes `scripts` for various esbuild commands: [see here](https://github.com/metachris/typescript-boilerplate/blob/master/package.json#L23)
* `esbuild` has a `--global-name=xyz` flag, to store the exports from the entry point in a global variable. See also the [esbuild "Global name" docs](https://esbuild.github.io/api/#global-name).
* Read more about the esbuild setup [here](https://www.metachris.com/2021/04/starting-a-typescript-project-in-2021/#esbuild).
* esbuild for the browser uses the IIFE (immediately-invoked function expression) format, which executes the bundled code on load (see also https://github.com/evanw/esbuild/issues/29)


# Tests with Jest

You can write [Jest tests](https://jestjs.io/docs/getting-started) [like this](https://github.com/metachris/typescript-boilerplate/blob/master/src/main.test.ts):

```typescript
import { greet } from './main'

test('the data is peanut butter', () => {
  expect(1).toBe(1)
});

test('greeting', () => {
  expect(greet('Foo')).toBe('Hello Foo')
});
```

Run the tests with `yarn test`, no separate compile step is necessary.

* See also the [Jest documentation](https://jestjs.io/docs/getting-started).
* The tests can be automatically run in CI (GitHub Actions, GitLab CI): [`.github/workflows/lint-and-test.yml`](https://github.com/metachris/typescript-boilerplate/blob/master/.github/workflows/lint-and-test.yml), [`.gitlab-ci.yml`](https://github.com/metachris/typescript-boilerplate/blob/master/.gitlab-ci.yml)
* Take a look at other modern test runners such as [ava](https://github.com/avajs/ava), [uvu](https://github.com/lukeed/uvu) and [tape](https://github.com/substack/tape)

# Documentation, published with CI

You can auto-generate API documentation from the TypeScript source files using [TypeDoc](https://typedoc.org/guides/doccomments/). The generated documentation can be published to GitHub / GitLab pages through the CI.

Generate the documentation, using `src/main.ts` as entrypoint (configured in package.json):

```bash
yarn docs
```

The resulting HTML is saved in `docs/`.

You can publish the documentation through CI:
* [GitHub pages](https://pages.github.com/): See [`.github/workflows/deploy-gh-pages.yml`](https://github.com/metachris/typescript-boilerplate/blob/master/.github/workflows/deploy-gh-pages.yml)
* [GitLab pages](https://docs.gitlab.com/ee/user/project/pages/): [`.gitlab-ci.yml`](https://github.com/metachris/typescript-boilerplate/blob/master/.gitlab-ci.yml)

This is the documentation for this boilerplate project: https://metachris.github.io/typescript-boilerplate/

# References

* **[Blog post: Starting a TypeScript Project in 2021](https://www.metachris.com/2021/03/bootstrapping-a-typescript-node.js-project/)**
* [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
* [tsconfig docs](https://www.typescriptlang.org/tsconfig)
* [esbuild docs](https://esbuild.github.io/)
* [typescript-eslint docs](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md)
* [Jest docs](https://jestjs.io/docs/getting-started)
* [GitHub Actions](https://docs.github.com/en/actions), [GitLab CI](https://docs.gitlab.com/ee/ci/)

