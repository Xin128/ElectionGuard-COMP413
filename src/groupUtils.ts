// Helper functions for group.test.ts
import {ElementModQ, ElementModP, Q, P, int_to_q_unchecked, int_to_p_unchecked} from './group';
const elements_mod_q: () => ElementModQ = () => {
    return int_to_q_unchecked(getRandomIntExclusive(Q));
}

const elements_mod_q_no_zero: () => ElementModQ = () => {
    return int_to_q_unchecked(getRandomIntExclusive(Q));
}

const elements_mod_p: () => ElementModP = () => {
    return int_to_p_unchecked(getRandomIntExclusive(P));
}

const elements_mod_p_no_zero: () => ElementModP = () => {
    return int_to_p_unchecked(getRandomIntExclusive(P));
}

// returns BigInt 0 to (range non inclusive)
// solution found: https://codereview.stackexchange.com/questions/230992/javascript-random-bigint
const getRandomIntExclusive: (range: bigint) => bigint = (range) => { 
    const rand = [];
    let digits = range.toString().length / 9 + 2 | 0;
    while (digits--) { 
        rand.push(("" + (Math.random() * 1000000000 | 0)).padStart(9, "0"));
    }
    return BigInt(rand.join("")) % range;  // Leading zeros are ignored
}

// compute the modular multiplicative inverse 
// solution found: https://stackoverflow.com/questions/4798654/modular-multiplicative-inverse-function-in-python
const powmod: (a: bigint, n: bigint) => bigint = (a, n) => {
    let i = BigInt(1);
    let c = BigInt(0);
    // let cnt = 0;
    while (true) {
    // while ( cnt < 100000) {
        // cnt += 1;
        c = n * i + BigInt(1);
        if (c % a === BigInt(0)) {
            c = c / a;
            break;
        }
        i++;
    }
    // if ( cnt == 10000) {
    //     throw Error();
    // }
    return c;
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


export {elements_mod_q, elements_mod_q_no_zero, elements_mod_p, elements_mod_p_no_zero, getRandomIntExclusive, powmod, bnToHex};
