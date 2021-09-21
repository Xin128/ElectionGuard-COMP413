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
    let rand = [], digits = range.toString().length / 9 + 2 | 0;
    while (digits--) { 
        rand.push(("" + (Math.random() * 1000000000 | 0)).padStart(9, "0"));
    }
    return BigInt(rand.join("")) % range;  // Leading zeros are ignored
}

// compute the modular multiplicative inverse 
// solution found: https://stackoverflow.com/questions/34119110/negative-power-in-modular-pow
const powmod: (a: bigint, m: bigint) => bigint = (a, m) => {
    const [g, x, y] = egcd(a, m);
    y; // added to prevent compiling error
    if (g !== 1n) {
        throw Error('modular inverse does not exist');
    } else {
        return x % m;
    }
}

const egcd: (a: bigint, b: bigint) => bigint[] = (a, b) => {
    if (a === 0n) {
        return [b, 0n, 1n];
    } else {
        const [g, y, x] = egcd(b % a, a);
        return [g, x - (b / a) * y, y];
    }
}

export {elements_mod_q, elements_mod_q_no_zero, elements_mod_p, elements_mod_p_no_zero, getRandomIntExclusive, powmod};
