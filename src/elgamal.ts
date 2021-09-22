import {assert} from "console";
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

  constructor(pad: ElementModP, data: ElementModP) {
    this.pad = pad;
    this.data = data;
  }
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
 * Given an ElGamal secret key (typically, a random number in [2,Q)), returns
 * an ElGamal keypair, consisting of the given secret key a and public key g^a.
 * @param a A secret key
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

/**
 * Create a random elgamal keypair
 * return random elgamal key pair
 */
export function elgamal_keypair_random(): ElGamalKeyPair {
  return get_optional(elgamal_keypair_from_secret(rand_range_q(2)));
}

export function elgamal_encrypt
(m: number, nonce: ElementModQ,
 public_key: ElGamalKeyPair | ElGamalPublicKey): ElGamalCiphertext {
  if (nonce === ZERO_MOD_Q) {
    log_error("ElGamal encryption requires a non-zero nonce");
    throw Error("ElGamal encryption requires a non-zero nonce");
  }
  if (m < 0) {
    log_error("Can't encrypt a negative message");
    throw Error("Can't encrypt a negative message");
  }
  if (m >= Q) {
    log_error("Can't encrypt a message bigger than Q");
    throw Error("Can't encrypt a message bigger than Q");
  }
  let pk;
  if (public_key instanceof ElGamalKeyPair) {
    pk = public_key.public_key;
  } else {
    pk = public_key;
  }
  return new ElGamalCiphertext(g_pow_p(nonce),
    mult_p(g_pow_p(int_to_q_unchecked(m)), pow_p(pk, nonce)));
}

export function elgamal_add(...ciphertexts: ElGamalCiphertext[]): ElGamalCiphertext {
  assert(ciphertexts.length !== 0, "Must have one or more ciphertexts for elgamal_add");

  const pads = ciphertexts.map((value: ElGamalCiphertext) => {value.pad});
  const data = ciphertexts.map((value: ElGamalCiphertext) => {value.data});

  return new ElGamalCiphertext(mult_p(...pads), mult_p(...data));
}

/**
 * Combines multiple ElGamal public keys into a single public key. The corresponding secret keys can
 * do "partial decryption" operations that can be later combined. See, e.g.,
 * [ElGamalCiphertext.partialDecryption] and [combinePartialDecryptions].
 * @param keys
 */
export function elgamal_combine_public_keys(...keys: (ElGamalPublicKey | ElGamalKeyPair)[]
): ElGamalPublicKey {
  const result = keys.map((value) => {
    if (value instanceof ElementModP) {
      return value;
    } else {
      return value.public_key;
    }
  });
  return mult_p(...result);
}

type ElGamalPartialDecryption = ElementModP;

/**
 * Computes a partial decryption of the ciphertext with a secret key or keypair. See
 * [ElGamalCiphertext.combinePartialDecryptions] for extracting the plaintext.
 * @param key a secret key
 * @param ciphertext ciphered text that need to be decrypted.
 */
export function elgamal_partial_decryption(
  key: ElGamalSecretKey | ElGamalKeyPair, ciphertext: ElGamalCiphertext
): ElGamalPartialDecryption {
 let sk;
 if (key instanceof  ElGamalKeyPair) {
   sk = key.secret_key;
 } else {
   sk = key;
 }
 return pow_p(ciphertext.pad, sk);
}

/**
 * Given a series of partial decryptions of the ciphertext, combines them together to complete the
 * decryption process.
 * @param ciphertext text that need to be decrypted.
 * @param partial_decryptions a series of partial decriptions of the ciphertext.
 */
export function elgamal_combine_partial_decryptions(
  ciphertext: ElGamalCiphertext,
  ...partial_decryptions: ElGamalPartialDecryption[]): number | null {
  const blind = mult_p(...partial_decryptions);
  const gPowM = div_p(ciphertext.data, blind);
  return discrete_log(gPowM);
}
