import {
    P,
    Q,
    ElementModP,
    ElementModQ,
    a_minus_b_q,
    mult_inv_p,
    ONE_MOD_P,
    mult_p,
    ZERO_MOD_P,
    G,
    ONE_MOD_Q,
    g_pow_p,
    ZERO_MOD_Q,
    R,
    int_to_p,
    int_to_q,
    add_q,
    div_q,
    div_p,
    a_plus_bc_q,
    int_to_p_unchecked,
    int_to_q_unchecked,
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
    elementsModQNoZero,
    powmod
} from './groupUtils';

// values taken from the slackoverflow thread: https://stackoverflow.com/questions/34119110/negative-power-in-modular-pow
describe("TestGroupUtil", () => {
    test('testPowMod', () => {
        const g: bigint = 11444n;
        const p: bigint = 48731n;
        const w: bigint = 357n;
        const y: bigint = 7355n;
        const gmodinvp: bigint = 29420n;

        expect(powmod(g, p)).toEqual(gmodinvp);
        expect((powmod(g, p) ** w) % p).toEqual(y);
    });
});

describe("TestEquality", () => {
    test('testPsNotEqualToQs', () => {
        const q = elementsModQ();
        const q2 = elementsModQ();
        const p: ElementModP = int_to_p_unchecked(q.to_int());
        const p2: ElementModP = int_to_p_unchecked(q2.to_int());
        
        // same value should imply they're equal
        expect(q.equals(p)).toBe(true);
        expect(q2.equals(p2)).toBe(true);

        if (q.to_int() !== q2.to_int()) {
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
        const asInt: ElementModQ = add_q(q, 1n);
        const asElem: ElementModQ = add_q(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testAPlusBCQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = a_plus_bc_q(q, 1n, 1n);
        const asElem: ElementModQ = a_plus_bc_q(q, new ElementModQ(BigInt(1)), new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testAMinusBQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = a_minus_b_q(q, 1n);
        const asElem: ElementModQ = a_minus_b_q(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testDivQ', () => {
        const q: ElementModQ = elementsModQ();
        const asInt: ElementModQ = div_q(q, 1n);
        const asElem: ElementModQ = div_q(q, new ElementModQ(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testDivP', () => {
        const p: ElementModP = elementsModP();
        const asInt: ElementModP = div_p(p, 1n);
        const asElem: ElementModP = div_p(p, new ElementModP(BigInt(1)));
        expect(asInt.equals(asElem)).toBe(true);
    });

    test('testNoMultInvOfZero', () => {
        // TODO: may need to know which exception to throw
        expect(() => mult_inv_p(ZERO_MOD_P)).toThrow(Error);
    });

    test('testMultInverses', () => {
        const elem: ElementModP = elementsModPNoZero();
        const inv: ElementModP = mult_inv_p(elem);
        expect(mult_p(elem, inv).equals(ONE_MOD_P)).toBe(true);
    });

    test('testMultIdentity', () => {
        const elem: ElementModP = elementsModP();
        expect(elem.equals(mult_p(elem))).toBe(true);
    });

    test('testMultNoArgs', () => {
        expect(ONE_MOD_P.equals(mult_p())).toBe(true);
    });

    test('testAddNoArgs', () => {
        expect(ZERO_MOD_Q.equals(add_q())).toBe(true);
    });

    test('testPropertiesForConstants', () => {
        expect(G !== 1n).toBe(true);
        expect((R * Q) % P).toEqual(P - 1n);
        expect(Q).toBeLessThan(P);
        expect(G).toBeLessThan(P);
        expect(R).toBeLessThan(P);
    });

    test('testSimplePowers', () => {
        let gp: ElementModP | null = int_to_p(G);
        gp = get_optional(gp);
        expect(gp.equals(g_pow_p(ONE_MOD_Q))).toBe(true);
        expect(ONE_MOD_P.equals(g_pow_p(ZERO_MOD_Q)));

    });

    test('testInBoundsQ', () => {
        const q: ElementModQ = elementsModQ();
        expect(q.is_in_bounds()).toBe(true);
        const tooBig: bigint = q.to_int() + Q;
        const tooSmall: bigint = q.to_int() - Q;
        expect(int_to_q_unchecked(tooBig).is_in_bounds()).toBe(false);
        expect(int_to_q_unchecked(tooSmall).is_in_bounds()).toBe(false);
        expect(int_to_q(tooBig)).toEqual(null);
        expect(int_to_q(tooSmall)).toEqual(null);
    });

    test('testInBoundsP', () => {
        const p: ElementModP = elementsModP();
        expect(p.is_in_bounds()).toBe(true);
        const tooBig: bigint = p.to_int() + P;
        const tooSmall: bigint = p.to_int() - P;
        expect(int_to_p_unchecked(tooBig).is_in_bounds()).toBe(false);
        expect(int_to_p_unchecked(tooSmall).is_in_bounds()).toBe(false);
        expect(int_to_p(tooBig)).toEqual(null);
        expect(int_to_p(tooSmall)).toEqual(null);
    });

    test('testInBoundsQNoZero', () => {
        const q: ElementModQ = elementsModQNoZero();
        expect(q.is_in_bounds_no_zero()).toBe(true);
        expect(ZERO_MOD_Q.is_in_bounds_no_zero()).toBe(false);
        expect(int_to_q_unchecked(q.to_int() + Q).is_in_bounds_no_zero()).toBe(false);
        expect(int_to_q_unchecked(q.to_int() - Q).is_in_bounds_no_zero()).toBe(false);
    });

    test('testInBoundsPNoZero', () => {
        const p: ElementModP = elementsModPNoZero();
        expect(p.is_in_bounds_no_zero()).toBe(true);
        expect(ZERO_MOD_P.is_in_bounds_no_zero()).toBe(false);
        expect(int_to_p_unchecked(p.to_int() + P).is_in_bounds_no_zero()).toBe(false);
        expect(int_to_p_unchecked(p.to_int() - P).is_in_bounds_no_zero()).toBe(false);
    });

    test('testLargeValuesRejectedByInToQ', () => {
        const q: ElementModQ = elementsModQ();
        const oversize: bigint = q.to_int() + Q;
        expect(int_to_q(oversize)).toEqual(null);
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
        expect(flatmap_optional(bad, (x) => x! + 2)).toBeUndefined();
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