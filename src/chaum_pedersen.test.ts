const ONE_MOD_Q= 1;
const TWO_MOD_Q = 2;
describe("TestDisjunctiveChaumPedersen", () => {
    test('test_djcp_proofs_simple', () => {

        // doesn't get any simpler than this
        let keypair:ElGamalCiphertext = elgamal_keypair_from_secret(TWO_MOD_Q);
        let nonce = ONE_MOD_Q;
        let seed = TWO_MOD_Q;
        let message0:ElGamalCiphertext = get_optional(elgamal_encrypt(0, nonce, keypair.public_key));
        let proof0:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message0, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        let proof0bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message0, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        expect(proof0.is_valid(message0, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof0bad.is_valid(message0, keypair.public_key, ONE_MOD_Q)).toBe(false);

        let message1:ElGamalCiphertext = get_optional(elgamal_encrypt(1, nonce, keypair.public_key))
        let proof1:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message1, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        let proof1bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message1, nonce, keypair.public_key, ONE_MOD_Q, seed
        )
        expect(proof1.is_valid(message1, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof1bad.is_valid(message1, keypair.public_key, ONE_MOD_Q)).toBe(false);
    });


    test('test_djcp_proof_invalid_inputs', () => {
        // to push up our coverage
        let keypair:ElGamalKeyPair = elgamal_keypair_from_secret(TWO_MOD_Q);
        let nonce = ONE_MOD_Q
        let seed = TWO_MOD_Q
        let message0:ElGamalCiphertext = get_optional(elgamal_encrypt(0, nonce, keypair.public_key))
        // reason for throwError: last signature (plaintext for chaum pedersen is 3: should be 0 or 1)
        expect(make_disjunctive_chaum_pedersen(message0,nonce, keypair.public_key,seed,3)).toThrowError();
    });

    // Note: this test cannot be performed until electionguardtest folder is refactored. 
    // the method elgamal_keypairs() generates an arbitrary elgamal secret/public keypair
    test('test_djcp_proof_zero', () => {
        // to push up our coverage
        let keypair:ElGamalKeyPair = elgamal_keypairs();
        let nonce: ElementModQ = elements_mod_q_no_zero();
        let seed:ElementModQ = elements_mod_q();
        let message:ElGamalCiphertext = get_optional(elgamal_encrypt(0, nonce, keypair.public_key))

        let proof:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        let proof_bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        expect(proof.is_valid(message, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof_bad.is_valid(message, keypair.public_key, ONE_MOD_Q)).toBe(false);

       
    });


        // Note: this test cannot be performed until electionguardtest folder is refactored. 
    // the method elgamal_keypairs() generates an arbitrary elgamal secret/public keypair
    test('test_djcp_proof_one', () => {
        // to push up our coverage
        let keypair:ElGamalKeyPair = elgamal_keypairs();
        let nonce: ElementModQ = elements_mod_q_no_zero();
        let seed:ElementModQ = elements_mod_q();
        let message:ElGamalCiphertext = get_optional(elgamal_encrypt(1, nonce, keypair.public_key))

        let proof:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_one(
            message, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        let proof_bad:DisjunctiveChaumPedersenProof = make_disjunctive_chaum_pedersen_zero(
            message, nonce, keypair.public_key, ONE_MOD_Q, seed
        );
        expect(proof.is_valid(message, keypair.public_key, ONE_MOD_Q)).toBe(true);
        expect(proof_bad.is_valid(message, keypair.public_key, ONE_MOD_Q)).toBe(false);

       
    });


});

