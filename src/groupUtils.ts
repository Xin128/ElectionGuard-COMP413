// Helper functions for group.test.ts
import {ElementModQ, ElementModP, Q, P, intToQUnchecked, intToPUnchecked} from './group';
const elementsModQ: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntExclusive(Q));
}

const elementsModQNoZero: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntExclusive(Q));
}

const elementsModP: () => ElementModP = () => {
    return intToPUnchecked(getRandomIntExclusive(P));
}

const elementsModPNoZero: () => ElementModP = () => {
    return intToPUnchecked(getRandomIntExclusive(P));
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

export {elementsModQ, elementsModQNoZero, elementsModP, elementsModPNoZero, getRandomIntExclusive, powmod};
