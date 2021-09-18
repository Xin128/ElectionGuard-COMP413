// Helper functions for group.test.ts
import {ElementModQ, ElementModP, Q, intToQUnchecked} from './group';
const elementsModQ: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntInclusive(0, Q - 1));
}

const getRandomIntInclusive: (min: number, max: number) => number = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export {elementsModQ};