import {ElementModQ,
    ElementModP,
    elements_mod_q,
    elements_mod_p} from './group';
import {hash_elems} from './hash';
import {Nonces} from './nonces';

describe("TestNonces", () => {
    test('test_nonces_iterable', () => {
        // const a: ElementModP = elements_mod_p();
        // const b: ElementModQ = elements_mod_q();

        // const h1:ElementModQ = hash_elems(a, b);
        // const h2:ElementModQ = hash_elems(a, b);

        // expect(h1.equals(h2)).toBe(true);
        const seed:ElementModQ = elements_mod_q();
        const n = Nonces(seed);
        // i = iter(n)
        // q0 = next(i)
        // q1 = next(i)
        // self.assertTrue(q0 != q1)

    });
});


// class TestNonces(unittest.TestCase):
//     @given(elements_mod_q())
//     def test_nonces_iterable(self, seed: ElementModQ):
//         n = Nonces(seed)
//         i = iter(n)
//         q0 = next(i)
//         q1 = next(i)
//         self.assertTrue(q0 != q1)

//     @given(elements_mod_q(), integers(min_value=0, max_value=1000000))
//     def test_nonces_deterministic(self, seed: ElementModQ, i: int):
//         n1 = Nonces(seed)
//         n2 = Nonces(seed)
//         self.assertEqual(n1[i], n2[i])

//     @given(
//         elements_mod_q(),
//         elements_mod_q(),
//         integers(min_value=0, max_value=1000000),
//     )
//     def test_nonces_seed_matters(self, seed1: ElementModQ, seed2: ElementModQ, i: int):
//         assume(seed1 != seed2)
//         n1 = Nonces(seed1)
//         n2 = Nonces(seed2)
//         self.assertNotEqual(n1[i], n2[i])

//     @given(elements_mod_q())
//     def test_nonces_with_slices(self, seed: ElementModQ):
//         n = Nonces(seed)
//         count: int = 0
//         l: List[ElementModQ] = []

//         for i in iter(n):
//             count += 1
//             l.append(i)
//             if count == 10:
//                 break
//         self.assertEqual(len(l), 10)

//         l2 = Nonces(seed)[0:10]
//         self.assertEqual(len(l2), 10)
//         self.assertEqual(l, l2)

//     def test_nonces_type_errors(self):
//         n = Nonces(int_to_q_unchecked(3))
//         self.assertRaises(TypeError, len, n)
//         self.assertRaises(TypeError, lambda: n[1:])
//         self.assertRaises(TypeError, lambda: n.get_with_headers(-1))