// Helper functions for group.test.ts
import {ElementModQ, ElementModP, Q, P} from './group_sjcl';
import sjcl from "sjcl";
const elements_mod_q: () => ElementModQ = () => {
    return new ElementModQ(getRandomIntExclusive(Q));
}

const elements_mod_q_no_zero: () => ElementModQ = () => {
    return new ElementModQ(getRandomIntExclusive(Q));
}

const elements_mod_p: () => ElementModP = () => {
    return new ElementModP(getRandomIntExclusive(P));
}

const elements_mod_p_no_zero: () => ElementModP = () => {
    return new ElementModP(getRandomIntExclusive(P));
}

// returns BigInt 0 to (range non inclusive)
// solution found: https://codereview.stackexchange.com/questions/230992/javascript-random-bigint
const getRandomIntExclusive: (range: sjcl.BigNumber) => sjcl.BigNumber = (range) => {
    const rand = [];
    let digits = range.toString().length / 9 + 2 | 0;
    while (digits--) {
        rand.push(("" + (Math.random() * 1000000000 | 0)).padStart(9, "0"));
    }
    return new sjcl.bn(rand.join("")).mod(range) ;  // Leading zeros are ignored
}

// Convert decimal strings to Hex with JS BigInts
// https://coolaj86.com/articles/convert-decimal-to-hex-with-js-bigints/
// Since in our case bn is never going to be negative, ignore the bn < 0 case
const bnToHex: (bn: bigint) => string = (bn) => {
    bn = BigInt(bn);

    const pos = true;

    let hex = bn.toString(16);
    if (hex.length % 2) { hex = '0' + hex; }

    if (pos && (0x80 & parseInt(hex.slice(0, 2), 16))) {
        hex = '00' + hex;
    }

    return hex;
}


export {elements_mod_q, elements_mod_q_no_zero, elements_mod_p, elements_mod_p_no_zero, getRandomIntExclusive, bnToHex};
