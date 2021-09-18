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
    elementsModQ
    // elements_mod_p_no_zero,
    // elements_mod_p,
    // elements_mod_q,
    // elements_mod_q_no_zero,
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

    });

    test('testAPlusBCQ', () => {

    });

    test('testAMinusBQ', () => {

    });

    test('testDivQ', () => {

    });

    test('testDivP', () => {

    });

    test('testNoMultInvOfZero', () => {

    });

    test('testMultInverses', () => {

    });

    test('testMultIdentity', () => {

    });

    test('testMultNoArgs', () => {

    });

    test('testAddNoArgs', () => {

    });

    test('testPropertiesForConstants', () => {

    });

    test('testSimplePowers', () => {

    });

    test('testInBoundsQ', () => {

    });

    test('testInBoundsP', () => {

    });

    test('testInBoundsQNoZero', () => {

    });

    test('testInBoundsPNoZero', () => {

    });

    test('testLargeValuesRejectedByInToQ', () => {

    });
});

describe("TestOptionalFunctions", () => {
    test('testUnwrap', () => {

    });

    test('testMatch', () => {

    });

    test('testGetOrElse', () => {

    });

    test('testFlatMap', () => {

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