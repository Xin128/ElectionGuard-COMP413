import {ElementModQ,
    ElementModP,
    elements_mod_q,
    elements_mod_p,
    ElementModQ,
    g_pow_p,
    G,
    P,
    Q,
    ZERO_MOD_Q,
    TWO_MOD_Q,
    ONE_MOD_Q,
    ONE_MOD_P,} from './group';
import {hash_elems} from './hash';
import {ElGamalKeyPair,
    ElGamalCiphertext,
    elgamal_encrypt,
    elgamal_add,
    elgamal_keypair_from_secret,
    elgamal_keypair_random,} from './elgamal'

describe("TestElgamal", () => {
    test('test_simple_elgamal_encryption_decryption', () => {
        const nonce = ONE_MOD_Q;
        const secret_key = TWO_MOD_Q
        const keypair:ElGamalKeyPair|undefined = get_optional(elgamal_keypair_from_secret(secret_key));
        const public_key = keypair.public_key;

        expect(public_key.to_int()).toBeLessThan(P);
        
        
        const elem:ElementModP = g_pow_p(ZERO_MOD_Q);
        expect(elem.equals(ONE_MOD_P)).toBe(true); // g^0 == 1

        const ciphertext:ElGamalCiphertext|undefined = get_optional(elgamal_encrypt(0, nonce, keypair.public_key));
        expect(G).toBe(ciphertext.pad.to_int());
       expect(
            pow(ciphertext.pad.to_int(), secret_key.to_int(), P),
            pow(public_key.to_int(), nonce.to_int(), P),
        )
        self.assertEqual(
            ciphertext.data.to_int(),
            pow(public_key.to_int(), nonce.to_int(), P),
        )

        plaintext = ciphertext.decrypt(keypair.secret_key)

        self.assertEqual(0, plaintext)
    });

});