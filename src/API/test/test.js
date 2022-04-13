const eg = require('../../../dist/tsc/API/APIUtils.js');

const ballot = require('./minimal/ballot.json');
const manifest = require('./minimal/manifest.json');

const realManifest = eg.buildManifest(manifest);
const realBallot = eg.buildBallot(ballot);
const result = eg.encryptBallot(realBallot, realManifest);
  if (result instanceof ErrorBallotInput) {
    console.log("error input!")
  }

console.log("encrypted ballot's hash: ", result.hash);
console.log("encrypted ballot's seed: ", result.seed);
