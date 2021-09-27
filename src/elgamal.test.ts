import {
  // ElementModQ,
    ElementModP,
    g_pow_p,
    G,
    P,
    // Q,
    ZERO_MOD_Q,
    TWO_MOD_Q,
    ONE_MOD_Q,
    ONE_MOD_P,} from './group';
// import {hash_elems} from './hash';
import {ElGamalKeyPair,
    ElGamalCiphertext,
    elgamal_encrypt,
    // elgamal_add,
    elgamal_keypair_from_secret,
    // elgamal_keypair_random
} from './elgamal';
import {get_optional} from "./utils";
// import exp from 'constants';

describe("TestElgamal", () => {
    test('test_simple_elgamal_encryption_decryption', () => {
        const nonce = ONE_MOD_Q;
        const secret_key = TWO_MOD_Q
        const keypair:ElGamalKeyPair| null | undefined = elgamal_keypair_from_secret(secret_key);
        const public_key = get_optional(keypair).public_key;
        expect(public_key.to_int()).toBeLessThan(P);
        expect(public_key.to_int() ** nonce.to_int()).toBe(P);


        const elem:ElementModP = g_pow_p(ZERO_MOD_Q);
        expect(elem.equals(ONE_MOD_P)).toBe(true); // g^0 == 1

        const ciphertext:ElGamalCiphertext| null | undefined = elgamal_encrypt(0n, nonce, get_optional(keypair).public_key);
        expect(G).toBe(get_optional(ciphertext).pad.to_int());
        expect(get_optional(ciphertext).pad.to_int() ** secret_key.to_int()).toBe(P);

        // const plaintext:number = ciphertext.decrypt(keypair.secret_key);
        //
        // expect(plaintext).toBe(0);
    });
});
