import { ElGamalCiphertext,
    ElGamalKeyPair,
    elgamal_encrypt,
    elgamal_keypair_from_secret, 
} from "./elgamal";


import {
    // ElementModQ,
    TWO_MOD_Q,
    ONE_MOD_Q,
    // Q,
    // pow_p,
    // int_to_q,
    // add_q,
    // g_pow_p,
    // ZERO_MOD_Q
} from './group';

// import {elements_mod_q_no_zero,
//     elements_mod_q,} from './groupUtils';

import {DisjunctiveChaumPedersenProof, 
    make_disjunctive_chaum_pedersen_zero,
    make_disjunctive_chaum_pedersen_one,
    // make_disjunctive_chaum_pedersen
} 
from './chaum_pedersen'

import {get_optional} from './utils'

describe("TestDisjunctiveChaumPedersen", () => {
    test('test_djcp_proofs_simple', () => {

        // doesn't get any simpler than this
        const keypair:ElGamalKeyPair= get_optional(elgamal_keypair_from_secret(TWO_MOD_Q));
        const nonce = ONE_MOD_Q;
        const seed = TWO_MOD_Q;
        const message0:ElGamalCiphertext = get_optional(elgamal_encrypt(BigInt(0), nonce, keypair.public_key));
        const proof0:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message0, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        const proof0bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message0, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        expect(proof0.is_valid(message0, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof0bad.is_valid(message0, keypair.public_key, ONE_MOD_Q)).toBe(false);

        const message1:ElGamalCiphertext = get_optional(elgamal_encrypt(BigInt(1), nonce, keypair.public_key))
        const proof1:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message1, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        const proof1bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message1, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        expect(proof1.is_valid(message1, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof1bad.is_valid(message1, keypair.public_key, ONE_MOD_Q)).toBe(false);
    });


    // test('test_djcp_proof_invalid_inputs', () => {
    //     // to push up our coverage
    //     const keypair:ElGamalKeyPair|null = elgamal_keypair_from_secret(TWO_MOD_Q);
    //     const nonce = ONE_MOD_Q
    //     const seed = TWO_MOD_Q
    //     const message0:ElGamalCiphertext = elgamal_encrypt(BigInt(0), nonce, keypair!.public_key)
    //     // reason for throwError: last signature (plaintext for chaum pedersen is 3: should be 0 or 1)
    //     expect(make_disjunctive_chaum_pedersen(message0,nonce, keypair!.public_key, null, seed,3)).toThrowError();
    // });

    // // Note: this test cannot be performed until electionguardtest folder is refactored. 
    // // the method elgamal_keypairs() generates an arbitrary elgamal secret/public keypair
    // test('test_djcp_proof_zero', () => {
    //     // to push up our coverage
    //     const keypair:ElGamalKeyPair|null = elgamal_keypair_from_secret(TWO_MOD_Q);
    //     const nonce: ElementModQ = elements_mod_q_no_zero();
    //     const seed:ElementModQ = elements_mod_q();
    //     const message:ElGamalCiphertext = get_optional(elgamal_encrypt(BigInt(0), nonce, keypair!.public_key))

    //     const proof:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
    //         message, nonce, keypair!.public_key, ONE_MOD_Q, seed
    //     );
    //     const proof_bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
    //         message, nonce, keypair!.public_key, ONE_MOD_Q, seed
    //     );
    //     expect(proof.is_valid(message, keypair!.public_key, ONE_MOD_Q)).toBe(true);
    //     expect(proof_bad.is_valid(message, keypair!.public_key, ONE_MOD_Q)).toBe(false);

       
    // });


        // Note: this test cannot be performed until electionguardtest folder is refactored. 
    // the method elgamal_keypairs() generates an arbitrary elgamal secret/public keypair
    // test('test_djcp_proof_one', () => {
    //     // to push up our coverage
    //     const keypair:ElGamalKeyPair|null = elgamal_keypair_from_secret(elements_mod_q_no_zero());

    //     const nonce: ElementModQ = elements_mod_q_no_zero();
    //     const seed:ElementModQ = elements_mod_q();
    //     const message:ElGamalCiphertext = elgamal_encrypt(BigInt(1), nonce, keypair!.public_key)

    //     const proof:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
    //         message, nonce, keypair!.public_key, ONE_MOD_Q, seed
    //     );
    //     const proof_bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
    //         message, nonce, keypair!.public_key, ONE_MOD_Q, seed
    //     );
    //     expect(proof.is_valid(message, keypair!.public_key, ONE_MOD_Q)).toBeTruthy();
    //     expect(proof_bad.is_valid(message, keypair!.public_key, ONE_MOD_Q)).toBeFalsy();

    // });


});

