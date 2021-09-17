import { assert } from "console";
import { ElGamalCiphertext } from "./elgamal"

// import optional
// import dataclass from dataclasses

import { ElementModQ,
    ElementModP,
    g_pow_p,
    mult_p,
    pow_p,
    a_minus_b_q,
    a_plus_bc_q,
    add_q,
    negate_q,
    int_to_q,
    ZERO_MOD_Q,
    mult_inv_p,
    G,
    int_to_p_unchecked,
    int_to_p } from "./group"

import { hash_elems } from "./hash"
// import loggings

import { Nonces } from "./nonces"


class DisjunctiveChaumPedersenProof {
    // Representation of disjunctive Chaum Pederson proof
    proof_zero_pad: ElementModP;
    // a0 in the spec
    proof_zero_data: ElementModP;
    // b0 in the spec
    proof_one_pad: ElementModP;
    // a1 in the spec
    proof_one_data: ElementModP;
    // b1 in the spec
    proof_zero_challenge: ElementModQ;
    // c0 in the spec
    proof_one_challenge: ElementModQ;
    // c1 in the spec
    challenge: ElementModQ;
    // c in the spec
    proof_zero_response: ElementModQ;
    // proof_zero_response in the spec
    proof_one_response: ElementModQ;
    // proof_one_response in the spec

    constructor(a0: ElementModP, b0: ElementModP, a1: ElementModP, b1: ElementModP, c0: ElementModQ, c1: ElementModQ, c: ElementModQ, v0: ElementModQ, v1: ElementModQ) {
        this.proof_zero_pad = a0;
        this.proof_zero_data = b0;
        this.proof_one_pad = a1;
        this.proof_one_data = b1;
        this.proof_zero_challenge = c0;
        this.proof_one_challenge = c1;
        this.challenge = c;
        this.proof_zero_response = v0;
        this.proof_one_response = v1;
    }

    public is_valid(message: ElGamalCiphertext, k: ElementModP, q: ElementModQ): boolean {
        const [alpha, beta] = message;
        const a0 = this.proof_zero_pad;
        const b0 = this.proof_zero_data;
        const a1 = this.proof_one_pad;
        const b1 = this.proof_one_data;
        const c0 = this.proof_zero_challenge;
        const c1 = this.proof_one_challenge;
        const c = this.challenge;
        const v0 = this.proof_zero_response;
        const v1 = this.proof_one_response;
        const in_bounds_alpha = alpha.is_valid_residue();
        const in_bounds_beta = beta.is_valid_residue();
        const in_bounds_a0 = a0.is_valid_residue();
        const in_bounds_b0 = b0.is_valid_residue();
        const in_bounds_a1 = a1.is_valid_residue();
        const in_bounds_b1 = b1.is_valid_residue();
        const in_bounds_c0 = c0.is_in_bounds();
        const in_bounds_c1 = c1.is_in_bounds();
        const in_bounds_v0 = v0.is_in_bounds();
        const in_bounds_v1 = v1.is_in_bounds();
        const consistent_c = add_q(c0, c1) == c == hash_elems(q, alpha, beta, a0, b0, a1, b1);
        const consistent_gv0 = g_pow_p(v0) == mult_p(a0, pow_p(alpha, c0));
        const consistent_gv1 = g_pow_p(v1) == mult_p(a1, pow_p(alpha, c1));
        const consistent_kv0 = pow_p(k, v0) == mult_p(b0, pow_p(beta, c0));
        const consistent_gc1kv1 = mult_p(g_pow_p(c1), pow_p(k, v1)) == mult_p(
            b1, pow_p(beta, c1)
        );
        const success = (
            in_bounds_alpha
            && in_bounds_beta
            && in_bounds_a0
            && in_bounds_b0
            && in_bounds_a1
            && in_bounds_b1
            && in_bounds_c0
            && in_bounds_c1
            && in_bounds_v0
            && in_bounds_v1
            && consistent_c
            && consistent_gv0
            && consistent_gv1
            && consistent_kv0
            && consistent_gc1kv1
        );
        if (!success) {
            console.log("in_bounds_alpha: ", in_bounds_alpha, "in_bounds_beta: ", in_bounds_beta, "in_bounds_a0: ", in_bounds_a0,
            "in_bounds_b0: ", in_bounds_b0, "in_bounds_a1: ", in_bounds_a1, "in_bounds_b1: ", in_bounds_b1, "in_bounds_c0: ", in_bounds_c0,
            "in_bounds_c1: ", in_bounds_c1, "in_bounds_v0: ", in_bounds_v0, "in_bounds_v1: ", in_bounds_v1, "consistent_c: ", consistent_c,
            "consistent_gv0: ", consistent_gv0, "consistent_gv1: ", consistent_gv1, "consistent_kv0: ", consistent_kv0, "consistent_gc1kv1: ", consistent_gc1kv1,
            "k: ", k);
        }
        return success;

    }

}

class ConstantChaumPedersenProof {
    // Representation of constant Chaum Pederson proof.
    pad: ElementModP;
    // a in the spec
    data: ElementModP;
    // b in the spec
    challenge: ElementModQ;
    // c in the spec
    response: ElementModQ;
    // v in the spec
    constant: number;
    // constant value

    constructor(pad: ElementModP, data: ElementModP, challenge: ElementModQ, response: ElementModQ, constant: number) {
        this.pad = pad;
        this.data = data;
        this.challenge = challenge;
        this.response = response;
        this.constant = constant;
    }

    public is_valid(message: ElGamalCiphertext, k: ElementModP, q: ElementModQ): boolean {
        const [alpha, beta] = message;
        const a = this.pad;
        const b = this.data;
        const c = this.challenge;
        const v = this.response;
        const constant = this.constant;
        const in_bounds_alpha = alpha.is_valid_residue();
        const in_bounds_beta = beta.is_valid_residue();
        const in_bounds_a = a.is_valid_residue();
        const in_bounds_b = b.is_valid_residue();
        const in_bounds_c = c.is_in_bounds();
        const in_bounds_v = v.is_in_bounds();
        const tmp = int_to_q(constant);

        let in_bounds_constant;
        let constant_q;
        if (tmp != undefined){
            constant_q = ZERO_MOD_Q;
            in_bounds_constant = false;
        } else {
            constant_q = tmp;
            in_bounds_constant = true;
        }

        // this is an arbitrary constant check to verify that decryption will be performant
        // in some use cases this value may need to be increased

        const sane_constant = 0 <= constant && constant < 1_000_000_000;
        const same_c = c == hash_elems(q, alpha, beta, a, b);
        const consistent_gv = (
            in_bounds_v
            && in_bounds_a
            && in_bounds_alpha
            && in_bounds_c
            // The equation 𝑔^𝑉 = 𝑎𝐴^𝐶 mod 𝑝
            && g_pow_p(v) == mult_p(a, pow_p(alpha, c))
        );

        // The equation 𝑔^𝐿𝐾^𝑣 = 𝑏𝐵^𝐶 mod 𝑝
        const consistent_kv = in_bounds_constant && mult_p(
            g_pow_p(mult_p(c, constant_q)), pow_p(k, v)
        ) == mult_p(b, pow_p(beta, c));

        const success = (
            in_bounds_alpha
            && in_bounds_beta
            && in_bounds_a
            && in_bounds_b
            && in_bounds_c
            && in_bounds_v
            && same_c
            && in_bounds_constant
            && sane_constant
            && consistent_gv
            && consistent_kv
        );
        if (!success){
            console.log("in_bounds_alpha: ", in_bounds_alpha, "in_bounds_beta: ", in_bounds_beta, "in_bounds_a: ", in_bounds_a,
            "in_bounds_b: ", in_bounds_b, "in_bounds_c: ", in_bounds_c, "in_bounds_v: ", in_bounds_v, "in_bounds_constant: ", in_bounds_constant,
            "sane_constant: ", sane_constant, "same_c: ", same_c, "consistent_gv: ", consistent_gv, "consistent_kv: ", consistent_kv,
            "k: ", k);
        }

        return success
    }

}

function make_disjunctive_chaum_pedersen(
    message: ElGamalCiphertext,
    r: ElementModQ,
    k: ElementModP,
    q: ElementModQ,
    seed: ElementModQ,
    plaintext: number): DisjunctiveChaumPedersenProof {
    assert(0 <= plaintext && plaintext <= 1);
    if (plaintext == 0){
        return make_disjunctive_chaum_pedersen_zero(message, r, k, q, seed);
    } else {
        return make_disjunctive_chaum_pedersen_one(message, r, k, q, seed);
    }
}

function make_disjunctive_chaum_pedersen_zero(
    message: ElGamalCiphertext,
    r: ElementModQ,
    k: ElementModP,
    q: ElementModQ,
    seed: ElementModQ): DisjunctiveChaumPedersenProof{
    const [alpha, beta] = message;
    // Pick three random numbers in Q.
    const nonces = new Nonces(seed, "disjoint-chaum-pedersen-proof");
    const c1 = nonces[0];
    const v1 = nonces[1];
    const u0 = nonces[2];

    // Compute the NIZKP
    const a0 = g_pow_p(u0);
    const b0 = pow_p(k, u0);
    const q_minus_c1 = negate_q(c1);
    const a1 = mult_p(g_pow_p(v1), pow_p(alpha, q_minus_c1));
    const b1 = mult_p(pow_p(k, v1), g_pow_p(c1), pow_p(beta, q_minus_c1));
    const c = hash_elems(q, alpha, beta, a0, b0, a1, b1);
    const c0 = a_minus_b_q(c, c1);
    const v0 = a_plus_bc_q(u0, c0, r);

    return new DisjunctiveChaumPedersenProof(a0, b0, a1, b1, c0, c1, c, v0, v1);
}

function make_disjunctive_chaum_pedersen_one(
    message: ElGamalCiphertext,
    r: ElementModQ,
    k: ElementModP,
    q: ElementModQ,
    seed: ElementModQ): DisjunctiveChaumPedersenProof{
    const [alpha, beta] = message;
    // Pick three random numbers in Q.
    const nonces = new Nonces(seed, "disjoint-chaum-pedersen-proof");
    const c0 = nonces[0];
    const v0 = nonces[1];
    const u1 = nonces[2];

    // Compute the NIZKP
    const q_minus_c0 = negate_q(c0);
    const a0 = mult_p(g_pow_p(v0), pow_p(alpha, q_minus_c0));
    const b0 = mult_p(pow_p(k, v0), pow_p(beta, q_minus_c0));
    const a1 = g_pow_p(u1);
    const b1 = pow_p(k, u1);
    const c = hash_elems(q, alpha, beta, a0, b0, a1, b1);
    const c1 = a_minus_b_q(c, c0);
    const v1 = a_plus_bc_q(u1, c1, r);

    return new DisjunctiveChaumPedersenProof(a0, b0, a1, b1, c0, c1, c, v0, v1);
}

function make_constant_chaum_pedersen(
    message: ElGamalCiphertext,
    constant: number,
    r: ElementModQ,
    k: ElementModP,
    seed: ElementModQ,
    base_hash: ElementModQ,
): ConstantChaumPedersenProof{
    const [alpha, beta] = message;

    // Pick one random number in Q.
    const u = new Nonces(seed, "constant-chaum-pedersen-proof")[0];

    const a = g_pow_p(u);  // 𝑔^𝑢𝑖 mod 𝑝
    const b = pow_p(k, u);  // 𝐴^𝑢𝑖 mod 𝑝
    const c = hash_elems(base_hash, alpha, beta, a, b);  // sha256(𝑄', A, B, a, b)
    const v = a_plus_bc_q(u, c, r);

    return new ConstantChaumPedersenProof(a, b, c, v, constant);
}

class ChaumPedersenProofGeneric {
    // General-purpose Chaum-Pedersen proof object, demonstrating that the prover knows the exponent
    // x for two tuples (g, g^x) and (h, h^x). This is used as a component in other proofs.

    a: ElementModP;
    // a = g^w

    b: ElementModP;
    // b = h^w

    c: ElementModQ;
    // c = hash(a, b)

    r: ElementModQ;
    // r = w + xc

    constructor(a: ElementModP, b: ElementModP, c: ElementModQ, r: ElementModQ) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.r = r;
    }

    public is_valid(
        g: ElementModP,
        gx: ElementModP,
        h: ElementModP,
        hx: ElementModP,
        base_hash?: [ElementModQ],
        check_c = true): boolean {
        const in_bounds_a = this.a.is_valid_residue();
        const in_bounds_b = this.b.is_valid_residue();
        const in_bounds_g = g.is_valid_residue();
        const in_bounds_gx = gx.is_valid_residue();
        const in_bounds_h = h.is_valid_residue();
        const in_bounds_hx = hx.is_valid_residue();

        const hash_good = (this.c == hash_elems(base_hash, this.a, this.b)) || (!check_c);

        const agxc = mult_p(this.a, pow_p(gx, this.c));  // should yield g^{w + xc}
        const gr = pow_p(g, this.r);  // should also yield g^{w + xc}

        const good_g = agxc == gr;

        const bhxc = mult_p(this.b, pow_p(hx, this.c));
        const hr = pow_p(h, this.r);

        const good_h = bhxc == hr;

        const success = (
            hash_good
            && in_bounds_a
            && in_bounds_b
            && in_bounds_g
            && in_bounds_gx
            && in_bounds_h
            && in_bounds_hx
            && good_g
            && good_h
        );
        if (!success){
            console.log("hash_good: ", hash_good, "in_bounds_a: ", in_bounds_a, "in_bounds_b: ", in_bounds_b,
            "in_bounds_g: ", in_bounds_g, "in_bounds_gx: ", in_bounds_gx, "in_bounds_h: ", in_bounds_h, "in_bounds_hx: ", in_bounds_hx,
            "good_g: ", good_g, "good_h: ", good_h);
        }

        return success
    }

}

function make_chaum_pedersen_generic(
    g: ElementModP,
    h: ElementModP,
    x: ElementModQ,
    seed: ElementModQ,
    base_hash?: [ElementModQ],
): ChaumPedersenProofGeneric {
    const w = new Nonces(seed, "generic-chaum-pedersen-proof")[0];
    const a = pow_p(g, w);
    const b = pow_p(h, w);
    const c = hash_elems(base_hash, a, b);
    const r = a_plus_bc_q(w, x, c);

    return new ChaumPedersenProofGeneric(a, b, c, r);
}

function make_fake_chaum_pedersen_generic(
    g: ElementModP,
    gx: ElementModP,
    h: ElementModP,
    hx: ElementModP,
    c: ElementModQ,
    seed: ElementModQ
): ChaumPedersenProofGeneric {
    const r = new Nonces(seed, "generic-chaum-pedersen-proof")[0];
    const gr = pow_p(g, r);
    const hr = pow_p(h, r);
    const a = mult_p(gr, mult_inv_p(pow_p(gx, c)));
    const b = mult_p(hr, mult_inv_p(pow_p(hx, c)));

    return new ChaumPedersenProofGeneric(a, b, c, r);
}

class ChaumPedersenDecryptionProof {
    proof: ChaumPedersenProofGeneric;

    constructor(proof: ChaumPedersenProofGeneric) {
      this.proof = proof;
    }

    public is_valid(
        plaintext: number,
        ciphertext: ElGamalCiphertext,
        public_key: ElementModP,
        base_hash?: [ElementModQ]
    ): boolean {
        const plaintext_p = int_to_p(plaintext);
        if (plaintext_p == undefined){
          return false;
        }

        const g_exp_plaintext = g_pow_p(plaintext_p);
        const blinder = mult_p(ciphertext.data, mult_inv_p(g_exp_plaintext));

        const valid_proof = this.proof.is_valid(
            int_to_p_unchecked(G),
            public_key,
            ciphertext.pad,
            blinder,
            base_hash,
          true,
        );
        if (!valid_proof) {
            console.log("plaintext: ", plaintext, "ciphertext: ", ciphertext, "public_key: ", public_key,
            "proof: ", this.proof);
        }
        return valid_proof;
    }
}

function make_chaum_pedersen_decryption_proof(
    ciphertext: ElGamalCiphertext,
    secret_key: ElementModQ,
    seed: ElementModQ,
    base_hash?: [ElementModQ]
): ChaumPedersenDecryptionProof {
    return new ChaumPedersenDecryptionProof(
        make_chaum_pedersen_generic(
            int_to_p_unchecked(G), ciphertext.pad, secret_key, seed, base_hash
        )
    );
}
