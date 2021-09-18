// Helper functions for group.test.ts
import {ElementModQ, ElementModP, Q, P, intToQUnchecked, intToPUnchecked} from './group';
const elementsModQ: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntInclusive(0, Q - 1));
}

const elementsModQNoZero: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntInclusive(1, Q - 1));
}

const elementsModP: () => ElementModP = () => {
    return intToPUnchecked(getRandomIntInclusive(0, P - 1));
}

const elementsModPNoZero: () => ElementModP = () => {
    return intToPUnchecked(getRandomIntInclusive(1, P - 1));
}

const getRandomIntInclusive: (min: number, max: number) => number = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export {elementsModQ, elementsModQNoZero, elementsModP, elementsModPNoZero};