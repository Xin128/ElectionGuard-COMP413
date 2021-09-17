import {
    P,
    Q,
    ElementModP,
    ElementModQ,
    aMinusBQ,
    multInvP,
    ONE_MOD_P,
    multP,
    ZERO_MOD_P,
    G,
    ONE_MOD_Q,
    gPowP,
    ZERO_MOD_Q,
    R,
    intToP,
    intToQ,
    addQ,
    divQ,
    divP,
    aPlusBCQ,
    intToPUnchecked,
    intToQUnchecked,
} from './group';

import {
    flatmap_optional,
    get_or_else_optional,
    match_optional,
    get_optional,
} from './utils';

// import {
//     elements_mod_p_no_zero,
//     elements_mod_p,
//     elements_mod_q,
//     elements_mod_q_no_zero,
// } from './group';

describe("TestEquality", () => {
    test('testPsNotEqualToQs', (q: ElementModQ, q2: ElementModQ) => {
        
    })
});