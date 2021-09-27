import {
  ElementModPOrQ,
  ElementModQ,
  Q_MINUS_ONE,
  int_to_q_unchecked,
  ElementModP,
  convertBase} from "./group"

import * as crypto from "crypto";

/**
 * Denotes Hashable
 */
export abstract class CryptoHashable {
  /**
   * Generates a hash given the fields on the implementing instance.
   */
  abstract crypto_hash(): ElementModQ;
}

/**
 * Checkable version of crypto hash
 */
export abstract class CryptoHashCheckable {
  /**
   * Generates a hash with a given seed that can be checked later
   * against the seed and class metadata.
   * @param seed_hash the seed used to generate a hash.
   */
  abstract crypto_hash_with(seed_hash: ElementModQ): ElementModQ;
}

// All the "atomic" types that we know how to hash.
export type CRYPTO_HASHABLE_T = CryptoHashable | ElementModPOrQ | string | number | undefined;

export type CRYPTO_HASHABLE_ALL = CRYPTO_HASHABLE_T[] | CRYPTO_HASHABLE_T | CRYPTO_HASHABLE_ALL[];

export function hash_elem(x:CRYPTO_HASHABLE_T):string {
    let hash_me = 'null';
    if (x instanceof ElementModQ || x instanceof ElementModP) {
      hash_me = x.to_hex();
    } else if (x instanceof CryptoHashable) {
      hash_me = x.crypto_hash().to_hex();
    } else if (typeof x === "string") {
      hash_me = x;
    } else if (typeof x === "number") {
      hash_me = x.toString();
    }
    return hash_me;
}

/**
 * Given zero or more elements, calculate their cryptographic hash
 * using SHA256. Allowed element types are `ElementModP`, `ElementModQ`,
 * `str`, or `int`, anything implementing `CryptoHashable`, and lists
 * or optionals of any of those types.
 * @param a Zero or more elements of any of the accepted types.
 * return A cryptographic hash of these elements, concatenated.
 */
export function hash_elems(a: CRYPTO_HASHABLE_ALL): ElementModQ {
  const h = crypto.createHash('sha256');
  // const CRYPTO_HASHABLE_T_StrList:string[]= ['CryptoHashable' ,'ElementModPOrQ','string','number', 'undefined'];
  h.update("|", "utf-8");  let hash_me:string; 

  if (!(a instanceof(Array))) {
    hash_me = hash_elem(a as CRYPTO_HASHABLE_T);
    h.update(hash_me + "|", "utf-8")
  } 
  else { 
  let cnt = 0;
  for (const x of a as Array<CRYPTO_HASHABLE_T>) {
    if (cnt >= 0 ){
      break;
    }
    cnt += 1;
    if (Array.isArray(x)) {
      if (x.length === 0) {
        hash_me = "null";
      } else {
        const tmp = hash_elems(x);
        hash_me = tmp.to_hex();
      }
    } else if (x === null || x === undefined) {
      hash_me = "null";
    } else {
      hash_me = hash_elem(x);
    }
    h.update(hash_me + "|", "utf-8")
  }
  
}
  //TODO: Need a binary to BigInt function here.
  return int_to_q_unchecked(
    BigInt(BigInt('0x' + h.digest('hex').toString()).toString(10)) % Q_MINUS_ONE);
}
