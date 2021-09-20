import {
    P,
    Q,
    ElementModP,
    ElementModQ,
    aMinusBQ,
    multInvP,
    ONE_MOD_P,
    multP,
    ZERO_MOD_P,
    G,
    ONE_MOD_Q,
    gPowP,
    ZERO_MOD_Q,
    R,
    intToP,
    intToQ,
    addQ,
    divQ,
    divP,
    aPlusBCQ,
    intToPUnchecked,
    intToQUnchecked,
} from './group';

import {
    flatmap_optional,
    get_or_else_optional,
    match_optional,
    get_optional,
} from './utils';

import {
    elementsModQ,
    elementsModP,
    elementsModPNoZero,
    elementsModQNoZero
} from './groupUtils';

describe("TestEquality", () => {
    test('testPsNotEqualToQs', () => {
        const q = elementsModQ();
        const q2 = elementsModQ();
        const p: ElementModP = intToPUnchecked(q.toInt());
        const p2: ElementModP = intToPUnchecked(q2.toInt());
        
        // same value should imply they're equal
        expect(q.equals(p)).toBe(true);
        expect(q2.equals(p2)).toBe(true);

        if (q.toInt() !== q2.toInt()) {
            // these are genuinely different numbers
            expect(q.notEqual(q2)).toBe(true);
            expect(p.notEqual(p2)).toBe(true);
            expect(q.notEqual(p2)).toBe(true);
            expect(p.notEqual(q2)).toBe(true);
        }
        // of course, we're going to make sure that a number is equal to itself
        expect(q.equals(q)).toBe(true);
        expect(p.equals(p)).toBe(true);
    })
});

describe("TestModularArithmetic", () => {
    test('testAddQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = addQ(q, 1);
        const asElem: ElementModQ = addQ(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testAPlusBCQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = aPlusBCQ(q, 1, 1);
        const asElem: ElementModQ = aPlusBCQ(q, new ElementModQ(BigInt(1)), new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testAMinusBQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = aMinusBQ(q, 1);
        const asElem: ElementModQ = aMinusBQ(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testDivQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = divQ(q, 1);
        const asElem: ElementModQ = divQ(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testDivP', () => {
        const p: ElementModP = elementsModP();
        const asInt: ElementModP = divP(p, 1);
        const asElem: ElementModP = divP(p, new ElementModP(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testNoMultInvOfZero', () => {
        // TODO: may need to know which exception to throw
        expect(() => multInvP(ZERO_MOD_P)).toThrow(Error);
    });

    test('testMultInverses', () => {
        const elem: ElementModP = elementsModPNoZero();
        const inv: ElementModP = multInvP(elem);
        expect(multP(elem, inv).equals(ONE_MOD_P)).toBe(true);
    });

    test('testMultIdentity', () => {
        const elem: ElementModP = elementsModP();
        expect(elem.equals(multP(elem))).toBe(true);
    });

    test('testMultNoArgs', () => {
        expect(ONE_MOD_P.equals(multP())).toBe(true);
    });

    test('testAddNoArgs', () => {
        expect(ZERO_MOD_Q.equals(addQ())).toBe(true);
    });

    test('testPropertiesForConstants', () => {
        expect(G !== 1).toBe(true);
        expect((R * Q) % P).toEqual(P - 1);
        expect(Q).toBeLessThan(P);
        expect(G).toBeLessThan(P);
        expect(R).toBeLessThan(P);
    });

    test('testSimplePowers', () => {
        let gp: ElementModP | null = intToP(G);
        gp = get_optional(gp);
        expect(gp.equals(gPowP(ONE_MOD_Q))).toBe(true);
        expect(ONE_MOD_P.equals(gPowP(ZERO_MOD_Q)));

    });

    test('testInBoundsQ', () => {
        const q: ElementModQ = elementsModQ();
        expect(q.isInBounds()).toBe(true);
        const tooBig: number = q.toInt() + Q;
        const tooSmall: number = q.toInt() - Q;
        expect(intToQUnchecked(tooBig).isInBounds()).toBe(false);
        expect(intToQUnchecked(tooSmall).isInBounds()).toBe(false);
        expect(intToQ(tooBig)).toEqual(null);
        expect(intToQ(tooSmall)).toEqual(null);
    });

    test('testInBoundsP', () => {
        const p: ElementModP = elementsModP();
        expect(p.isInBounds()).toBe(true);
        const tooBig: number = p.toInt() + P;
        const tooSmall: number = p.toInt() - P;
        expect(intToPUnchecked(tooBig).isInBounds()).toBe(false);
        expect(intToPUnchecked(tooSmall).isInBounds()).toBe(false);
        expect(intToP(tooBig)).toEqual(null);
        expect(intToP(tooSmall)).toEqual(null);
    });

    test('testInBoundsQNoZero', () => {
        const q: ElementModQ = elementsModQNoZero();
        expect(q.isInBoundsNoZero()).toBe(true);
        expect(ZERO_MOD_Q.isInBoundsNoZero()).toBe(false);
        expect(intToQUnchecked(q.toInt() + Q).isInBoundsNoZero()).toBe(false);
        expect(intToQUnchecked(q.toInt() - Q).isInBoundsNoZero()).toBe(false);
    });

    test('testInBoundsPNoZero', () => {
        const p: ElementModP = elementsModPNoZero();
        expect(p.isInBoundsNoZero()).toBe(true);
        expect(ZERO_MOD_P.isInBoundsNoZero()).toBe(false);
        expect(intToPUnchecked(p.toInt() + P).isInBoundsNoZero()).toBe(false);
        expect(intToPUnchecked(p.toInt() - P).isInBoundsNoZero()).toBe(false);
    });

    test('testLargeValuesRejectedByInToQ', () => {
        const q: ElementModQ = elementsModQ();
        const oversize: number = q.toInt() + Q;
        expect(intToQ(oversize)).toEqual(null);
    });
});

describe("TestOptionalFunctions", () => {
    test('testUnwrap', () => {
        const good: number | null = 3;
        const bad: number | null = null;
        expect(get_optional(good)).toEqual(3);
        expect(() => get_optional(bad)).toThrow(Error);
    });

    test('testMatch', () => {
        const good: number | null = 3;
        const bad: number | null = null;
        expect(match_optional(good, () => 1, (x) => x + 2)).toEqual(5);
        expect(match_optional(bad, () => 1, (x) => x! + 2)).toEqual(1);
    });

    test('testGetOrElse', () => {
        const good: number | null = 3;
        const bad: number | null = null;
        expect(get_or_else_optional(good, 5)).toEqual(3);
        expect(get_or_else_optional(bad, 5)).toEqual(5);
    });

    test('testFlatMap', () => {
        const good: number | null = 3;
        const bad: number | null = null;
        expect(get_optional(flatmap_optional(good, (x) => x + 2))).toEqual(5);
        expect(flatmap_optional(bad, (x) => x! + 2)).toBeNull();
    });
});

// TODO: We probably don't need testPickling
// class TestPickling(unittest.TestCase):
//     @given(elements_mod_p())
//     def test_pickle_p(self, p: ElementModP):
//         self.assertEqual(p, pickle.loads(pickle.dumps(p)))

//     @given(elements_mod_q())
//     def test_pickle_q(self, q: ElementModQ):
//         self.assertEqual(q, pickle.loads(pickle.dumps(q)))