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

// const getRandomIntExclusive: (min: bigint, max: bigint) => bigint = (min, max) => {
//     return Math.random() * (max - min + 1n) + min; //The maximum is inclusive and the minimum is inclusive
// }

// returns BigInt 0 to (range non inclusive)
// solution found: https://codereview.stackexchange.com/questions/230992/javascript-random-bigint
const getRandomIntExclusive: (range: bigint) => bigint = (range) => { 
    let rand = [], digits = range.toString().length / 9 + 2 | 0;
    while (digits--) { 
        rand.push(("" + (Math.random() * 1000000000 | 0)).padStart(9, "0"));
    }
    return BigInt(rand.join("")) % range;  // Leading zeros are ignored
}

export {elementsModQ, elementsModQNoZero, elementsModP, elementsModPNoZero, getRandomIntExclusive};
