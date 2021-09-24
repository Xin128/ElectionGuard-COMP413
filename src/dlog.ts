// support for computing discrete logs, with a cache so they're never recomputed
import {G, ElementModP, ONE_MOD_P, mult_p, int_to_p_unchecked} from './group'

let __dlog_cache: Map<ElementModP, number> = new Map([[ONE_MOD_P, 0]]);
let __dlog_max_elem:ElementModP = ONE_MOD_P;
let __dlog_max_exp:number = 0;

// let __dlog_lock: = undefined;

//TODO: this implementation is not actually multi-threaded, the lock mechanism is currently not found
export function discrete_log(e: ElementModP): number {
  if (__dlog_cache.has(e)) {
    return __dlog_cache.get(e)!;
  } else {
    return __discrete_log_internal(e);
  }
}

export function __discrete_log_internal(e: ElementModP): number {
  let g = int_to_p_unchecked(G);
  while (e !== __dlog_max_elem) {
    __dlog_max_exp = __dlog_max_exp + 1;
    __dlog_max_elem = mult_p(g, __dlog_max_elem);
    __dlog_cache.set(__dlog_max_elem, __dlog_max_exp);
  }
  return __dlog_cache.get(__dlog_max_elem)!;
}
