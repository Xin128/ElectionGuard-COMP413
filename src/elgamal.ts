import {discrete_log} from "./dlog"
import {
  ElementModQ,
  ElementModP,
  g_pow_p,
  mult_p,
  pow_p,
  ZERO_MOD_Q,
  rand_range_q,
  div_p,
  int_to_q_unchecked,
  Q,
} from "./group"

import {hash_elems} from "./hash"
import {log_error} from "./logs"
import {get_optional} from "./utils"

type ElGamalPublicKey = ElementModP;
type ElGamalSecretKey = ElementModQ;

/**
 * A tuple of an ElGamal secret key and public key.
 */
export class ElGamalKeyPair {
  secret_key: ElGamalSecretKey;
  public_key: ElGamalPublicKey;

  constructor(secret_key: ElGamalSecretKey, public_key: ElGamalPublicKey) {
    this.secret_key = secret_key;
    this.public_key = public_key;
  }

}

/**
 * An "exponential ElGamal ciphertext" (i.e., with the plaintext in the exponent to allow for
 * homomorphic addition). Create one with `elgamal_encrypt`. Add them with `elgamal_add`.
 * Decrypt using one of the supplied instance methods.
 */
export class ElGamalCiphertext {
  //Pad or alpha
  pad: ElementModP;
  //encrypted data or beta
  data: ElementModP;

  /**
   * Decrypts an ElGamal ciphertext with a "known product"
   * (the blinding factor used in the encryption).
   * @param product the blinding factor used in the encryption
   */
  public decrypt_known_product(product: ElementModP): number | null {
    return discrete_log(div_p(product));
  }

  /**
   * Decrypt an ElGamal ciphertext using a known ElGamal secret key.
   * @param secret_key The corresponding ElGamal secret key.
   * Return A plaintext message.
   */
  public decrypt(secret_key: ElGamalSecretKey | ElGamalKeyPair): number | null {
    if (secret_key instanceof ElGamalKeyPair){
      secret_key = secret_key.secret_key;
    }
    return this.decrypt_known_product(pow_p(this.pad, secret_key));
  }

  /**
   * Decrypt an ElGamal ciphertext using a known nonce and the ElGamal public key.
   * @param public_key The corresponding ElGamal public key.
   * @param nonce The secret nonce used to create the ciphertext.
   * Return A plaintext message.
   */
  public decrypt_known_nonce(public_key: ElGamalPublicKey | ElGamalKeyPair,
                             nonce: ElementModQ): number | null {
    if (public_key instanceof ElGamalKeyPair) {
      public_key = public_key.public_key;
    }
    return this.decrypt_known_product(pow_p(public_key, nonce));
  }

  /**
   * Computes a cryptographic hash of this ciphertext.
   */
  public crypto_hash():ElementModQ {
    return hash_elems(this.pad, this.data);
  }

}

/**
 * 
 * @param a
 */
export function elgamal_keypair_from_secret(a: ElGamalSecretKey)
  : ElGamalKeyPair {
  const secret_key_int: number = a.to_int();
  if (secret_key_int < 2) {
    log_error("ElGamal secret key needs to be in [2,Q).");
    throw Error("ElGamal secret key needs to be in [2,Q).");
  }
  return new ElGamalKeyPair(a, g_pow_p(a));
}
