
import { getRandomIntExclusive, powmod } from "./groupUtils"

// Constants used by ElectionGuard
const Q: bigint = BigInt(Math.pow(2, 256) - 189);
const P: bigint = BigInt('1044388881413152506691752710716624382579964249047383780384233483283953907971553643537729993126875883902173634017777416360502926082946377942955704498542097614841825246773580689398386320439747911160897731551074903967243883427132918813748016269754522343505285898816777211761912392772914485521155521641049273446207578961939840619466145806859275053476560973295158703823395710210329314709715239251736552384080845836048778667318931418338422443891025911884723433084701207771901944593286624979917391350564662632723703007964229849154756196890615252286533089643184902706926081744149289517418249153634178342075381874131646013444796894582106870531535803666254579602632453103741452569793905551901541856173251385047414840392753585581909950158046256810542678368121278509960520957624737942914600310646609792665012858397381435755902851312071248102599442308951327039250818892493767423329663783709190716162023529669217300939783171415808233146823000766917789286154006042281423733706462905243774854543127239500245873582012663666430583862778167369547603016344242729592244544608279405999759391099775667746401633668308698186721172238255007962658564443858927634850415775348839052026675785694826386930175303143450046575460843879941791946313299322976993405829119');
// ((P - 1) * pow(Q, -1, P)) % P
// rewrite pow(a,-b,c) as pow((a^-1) mod c, b, c)
const R: bigint = ((P - 1n) * (powmod(Q, P) % P)) % P;
// const R: bigint = BigInt(((P - 1n) * ((1n / Q) % P)) % P);
const G: bigint  = BigInt('14245109091294741386751154342323521003543059865261911603340669522218159898070093327838595045175067897363301047764229640327930333001123401070596314469603183633790452807428416775717923182949583875381833912370889874572112086966300498607364501764494811956017881198827400327403252039184448888877644781610594801053753235453382508543906993571248387749420874609737451803650021788641249940534081464232937193671929586747339353451021712752406225276255010281004857233043241332527821911604413582442915993833774890228705495787357234006932755876972632840760599399514028393542345035433135159511099877773857622699742816228063106927776147867040336649025152771036361273329385354927395836330206311072577683892664475070720408447257635606891920123791602538518516524873664205034698194561673019535564273204744076336022130453963648114321050173994259620611015189498335966173440411967562175734606706258335095991140827763942280037063180207172918769921712003400007923888084296685269233298371143630883011213745082207405479978418089917768242592557172834921185990876960527013386693909961093302289646193295725135238595082039133488721800071459503353417574248679728577942863659802016004283193163470835709405666994892499382890912238098413819320185166580019604608311466');
const Q_MINUS_ONE: bigint = Q - 1n;


class ElementModQ {
    // An element of the smaller `mod q` space, i.e., in [0, Q), where Q is a 256-bit prime.
    public elem: bigint;

    constructor(elem: bigint) {
        this.elem = elem; 
    }

    // TODO:
    // Converts from the element to the representation of bytes by first going through hex.
    // This is preferable to directly accessing `elem`, whose representation might change.
    public toBytes(): bigint {
        // return base16decode(this.bnToHex(this.elem));
        return 0n;
    }

    // Converts from the element to the hex representation of bytes. This is preferable to directly
    // accessing `elem`, whose representation might change.
    public toHex(): string {
        return "";
    }

    // Converts from the element to a regular integer. This is preferable to directly
    // accessing `elem`, whose representation might change.
    public toInt(): bigint {
        return this.elem;
    }

    // Validates that the element is actually within the bounds of [0,Q).
    // Returns true if all is good, false if something's wrong.
    public isInBounds(): boolean {
        return 0 <= this.elem && this.elem < Q;
    }

    // Validates that the element is actually within the bounds of [1,Q).
    // Returns true if all is good, false if something's wrong.
    public isInBoundsNoZero(): boolean {
        return 0 < this.elem && this.elem < Q;
    }
    
    // Operator overloading not supported in TypeScript, need to call the function instead
    public notEqual(other: any): boolean {
        return (other instanceof ElementModP || other instanceof ElementModQ) && !eqElems(this, other);
    }

    // overload == (equal to) operator
    public equals(other: any): boolean {
        return (other instanceof ElementModP || other instanceof ElementModQ) && eqElems(this, other);
    }

    public toStirng(): string {
        return this.elem.toString();
    }

    public hashCode(): bigint {
        return createStrHashCode(this.elem.toString());
    }

    // TODO: Not sure if this is needed in TypeScript version
    // # __getstate__ and __setstate__ are here to support pickle and other serialization libraries.
    // # These are intended for use in "trusted" environments (e.g., running on a computational cluster)
    // # but should not be used when reading possibly untrusted data from a file. For that, use functions
    // # like int_to_p(), which will return None if there's an error.

    // def __getstate__(self) -> dict:
    //     return {"elem": int(self.elem)}

    // def __setstate__(self, state: dict) -> None:
    //     if "elem" not in state or not isinstance(state["elem"], int):
    //         raise AttributeError("couldn't restore state, malformed input")
    //     self.elem = mpz(state["elem"])

    /////////////// POSSIBLE HELPER FUNCTION /////////////////

    // Convert decimal strings to Hex with JS BigInts
    // https://coolaj86.com/articles/convert-decimal-to-hex-with-js-bigints/
    // private bnToHex(bn: bigint) {
    //     bn = BigInt(bn);
      
    //     var pos = true;
    //     if (bn < 0) {
    //       pos = false;
    //       bn = this.bitnot(bn);
    //     }
      
    //     var hex = bn.toString(16);
    //     if (hex.length % 2) { hex = '0' + hex; }
      
    //     if (pos && (0x80 & parseInt(hex.slice(0, 2), 16))) {
    //       hex = '00' + hex;
    //     }
      
    //     return hex;
    //   }
      
    // private bitnot(bn: bigint) {
    //     bn = -bn;
    //     var bin = (bn).toString(2)
    //     var prefix = '';
    //     while (bin.length % 8) { bin = '0' + bin; }
    //     if ('1' === bin[0] && -1 !== bin.slice(1).indexOf('1')) {
    //         prefix = '11111111';
    //     }
    //     bin = bin.split('').map(function (i) {
    //         return '0' === i ? '1' : '0';
    //     }).join('');
    //     return BigInt('0b' + prefix + bin) + BigInt(1);
    // }


}

class ElementModP {
    // An element of the larger `mod p` space, i.e., in [0, P), where P is a 4096-bit prime.
    public elem: bigint;

    constructor(elem: bigint) {
        this.elem = elem; 
    }

    // TODO
    public toHex(): string {
        return ""
    }

    public toInt(): bigint {
        return this.elem;
    }

    public isInBounds(): boolean {
        return 0 <= this.elem && this.elem < P;
    }

    public isInBoundsNoZero(): boolean {
        return 0 < this.elem && this.elem < P;
    }

    public isValidResidue(): boolean {
        const residue: boolean = powP(this, new ElementModQ(BigInt(Q))) === ONE_MOD_P;
        return this.isInBounds() && residue;
    }

    public notEqual(other: any): boolean {
        return (other instanceof ElementModP || other instanceof ElementModQ) && !eqElems(this, other);
    }

    public equals(other: any): boolean {
        return (other instanceof ElementModP || other instanceof ElementModQ) && eqElems(this, other);
    }

    public toStirng(): string {
        return this.elem.toString();
    }

    public hashCode(): bigint {
        return createStrHashCode(this.elem.toString());
    }

    // def __getstate__(self) -> dict:
    //     return {"elem": int(self.elem)}

    // def __setstate__(self, state: dict) -> None:
    //     if "elem" not in state or not isinstance(state["elem"], int):
    //         raise AttributeError("couldn't restore state, malformed input")
    //     self.elem = mpz(state["elem"])

}

// Common constants
const ZERO_MOD_Q: ElementModQ = new ElementModQ(BigInt(0));
const ONE_MOD_Q: ElementModQ = new ElementModQ(BigInt(1));
const TWO_MOD_Q: ElementModQ = new ElementModQ(BigInt(2));

const ZERO_MOD_P: ElementModP = new ElementModP(BigInt(0));
const ONE_MOD_P: ElementModP = new ElementModP(BigInt(1));
const TWO_MOD_P: ElementModP = new ElementModP(BigInt(2));
const G_MOD_P: ElementModP = new ElementModP(G);

type ElementModPOrQ = ElementModP | ElementModQ;
type ElementModPOrQorInt = ElementModP | ElementModQ | bigint;
type ElementModQorInt = ElementModQ | bigint;
type ElementModPorInt = ElementModP | bigint;



// Given a hex string representing bytes, returns an ElementModQ.
// Returns `None` if the bigint is out of the allowed
// [0,Q) range.
// Reference: https://stackoverflow.com/questions/14667713/how-to-convert-a-string-to-bigint-in-typescript
const hexToQ: (input: string) => ElementModQ | null = (input) => {
    const i: bigint = BigInt(input);
    if (0 <= i && i < Q) {
        return new ElementModQ(BigInt(i));
    } else {
        return null;
    }
}

// Given an integer, returns an ElementModQ.
// Returns `None` if the bigint is out of the allowed
// [0,Q) range.
const intToQ: (input: string | bigint) => ElementModQ | null = (input) => {
    const i: bigint = BigInt(input);
    if (0 <= i && i < Q) {
        return new ElementModQ(BigInt(i));
    } else {
        return null;
    }
}

// Given an integer, returns an ElementModQ. Allows
// for the input to be out-of-bounds, and thus creating an invalid
// element (i.e., outside of [0,Q)). Useful for tests of it
// you're absolutely, positively, certain the input is in-bounds.
const intToQUnchecked: (i: string | bigint) => ElementModQ = (i) => {
    return new ElementModQ(BigInt(i));
}

// Given an integer, returns an ElementModP.
// Returns `None` if the bigint is out of the allowed
// [0,P) range.
const intToP: (input: string | bigint) => ElementModP | null = (input) => {
    const i: bigint = BigInt(input);
    if (0 <= i && i < P) {
        return new ElementModP(BigInt(i));
    } else {
        return null;
    }
}

// TODO
const intToPUnchecked: (i: string | bigint) => ElementModP = (i) => {
    return new ElementModP(BigInt(i));
}

//TODO: what is bytes in python equivalent of?
// const qToBytes: (e: ElementModQ) => [] = (e) => {
//     return [];
// } 

// TODO
// const bytesToQ: (b: []) => ElementModQ = (b) => {
//     return new ElementModQ(BigInt(0));
// }

const addQ: (...elems: ElementModQorInt[]) => ElementModQ = (...elems) => {
    let t: bigint = BigInt(0);
    // console.log("Q is ", Q, "R is ", R, "P is ", P);
    elems.forEach((e) => {
        if (typeof e === 'bigint') {
            e = intToQUnchecked(e);
        }
        t = (t + e.elem) % BigInt(Q);
    });
    return new ElementModQ(t);
}

const aMinusBQ: (a: ElementModQorInt, b: ElementModQorInt) => ElementModQ = (a, b) => {
    if (typeof a === 'bigint') {
        a = intToQUnchecked(a);
    }
    if (typeof b === 'bigint') {
        b = intToQUnchecked(b);
    }
    return new ElementModQ((a.elem - b.elem) % BigInt(Q));
}

// Computes a/b mod p
const divP: (a: ElementModPOrQorInt, b: ElementModPOrQorInt) => ElementModP = (a, b) => {
    if (typeof a === 'bigint') {
        a = intToPUnchecked(a);
    }
    if (typeof b === 'bigint') {
        b = intToPUnchecked(b);
    } 

    // TODO: Need to find an algorithm to calculate modular multiplicative inverse in typescript

    // const inverse = invert(b.elem, BigInt(P));
    // return mult_p(a, int_to_p_unchecked(inverse))
    return new ElementModP(BigInt(0));
}

// TODO
const divQ: (a: ElementModPOrQorInt, b: ElementModPOrQorInt) => ElementModQ = (a, b) => {
    if (typeof a === 'bigint') {
        a = intToPUnchecked(a);
    }
    if (typeof b === 'bigint') {
        b = intToPUnchecked(b);
    } 

    // const inverse = invert(b.elem, BigInt(P));
    // return mult_p(a, int_to_p_unchecked(inverse))
    return new ElementModQ(BigInt(0));
}

// Computes (Q - a) mod q.
const negateQ: (a: ElementModQorInt) => ElementModQ = (a) => {
    if (typeof a === 'bigint') {
        a = intToQUnchecked(a);
    }
    return new ElementModQ(BigInt(Q) - a.elem);
}

// Computes (a + b * c) mod q.
const aPlusBCQ: (a: ElementModQorInt, b: ElementModQorInt, c: ElementModQorInt) => ElementModQ = (a, b, c) => {
    if (typeof a === 'bigint') {
        a = intToQUnchecked(a);
    }
    if (typeof b === 'bigint') {
        b = intToQUnchecked(b);
    }
    if (typeof c === 'bigint') {
        c = intToQUnchecked(c);
    }
    return new ElementModQ((a.elem + b.elem + c.elem) % BigInt(Q));
}

// Computes the multiplicative inverse mod p.
// e:  An element in [1, P).
const multInvP: (e: ElementModPOrQorInt) => ElementModP = (e) => {
    if (typeof e === 'bigint') {
        e = intToPUnchecked(e);
    }
    if (e.elem === 0n) throw(new Error("No multiplicative inverse for zero"));

    return new ElementModP((1n / e.elem ** 1n) % BigInt(P));
}

// Computes b^e mod p.
// b: An element in [0,P).
// e: An element in [0,P).
const powP: (b: ElementModPOrQorInt, e: ElementModPOrQorInt) => ElementModP = (b, e) => {
    if (typeof b === 'bigint') {
        b = intToPUnchecked(b);
    }
    if (typeof e === 'bigint') {
        e = intToPUnchecked(e);
    }

    return new ElementModP((b.elem ** e.elem) % BigInt(P));
}

// Computes b^e mod p.
// b: An element in [0,Q).
// e: An element in [0,Q).
const powQ: (b: ElementModQorInt, e: ElementModQorInt) => ElementModQ = (b, e) => {
    if (typeof b === 'bigint') {
        b = intToQUnchecked(b);
    }
    if (typeof e === 'bigint') {
        e = intToQUnchecked(e);
    }

    return new ElementModQ((b.elem ** e.elem) % BigInt(Q));
}

// Computes the product, mod p, of all elements.
// elems: Zero or more elements in [0,P).
const multP: (...elems: ElementModPOrQorInt[]) => ElementModP = (...elems) => {
    let product: bigint = BigInt(1);
    elems.forEach((x) => {
        if (typeof x === 'bigint') {
            x = intToPUnchecked(x);
        }
        product = (product * x.elem) % BigInt(P);
    })
    return new ElementModP(product);
}

// Computes the product, mod q, of all elements.
// elems: Zero or more elements in [0,P).
const multQ: (...elems: ElementModPOrQorInt[]) => ElementModQ = (...elems) => {
    let product: bigint = BigInt(1);
    elems.forEach((x) => {
        if (typeof x === 'bigint') {
            x = intToQUnchecked(x);
        }
        product = (product * x.elem) % BigInt(Q);
    })
    return new ElementModQ(product);
}

const gPowP: (e: ElementModPOrQ) => ElementModP = (e) => {
    return powP(G_MOD_P, e);
}

// Generate random bigint between 0 and Q
// return: Random value between 0 and Q
const randQ: () => ElementModQ = () => {
    return intToQUnchecked(getRandomIntExclusive(Q));
}

// Generate random bigint between start and Q
// start: Starting value of range
// return: Random value between start and Q
const randRangeQ: (start: ElementModQorInt) => ElementModQ = (start) => {
    if (start instanceof ElementModQ) {
        start = start.toInt();
    }
    let random: bigint = 0n;
    while (random < start) {
        random = getRandomIntExclusive(Q);
    }
    return intToQUnchecked(random);
}

const eqElems: (a: ElementModPOrQ, b: ElementModPOrQ) => boolean = (a, b) => {
    return a.elem === b.elem;
}

////////// Utils only used in this file ////////////
// Manually hash a string, code taken from https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
// The hash value of the empty string is zero.
const createStrHashCode: (s: string) => bigint = (s) => {
    let h: bigint = 0n;
    for(let i = 0; i < s.length; i++) {
        h = 31n * h + BigInt(s.charCodeAt(i)) | 0n;
    }
    return h;
}

export {ElementModP, ElementModQ, P, Q, ONE_MOD_P, ZERO_MOD_P, ZERO_MOD_Q, ONE_MOD_Q, G, R, Q_MINUS_ONE, TWO_MOD_P, TWO_MOD_Q, ElementModPOrQ, ElementModPOrQorInt, ElementModQorInt, ElementModPorInt, hexToQ, intToQ, intToQUnchecked, intToP, intToPUnchecked, addQ, aMinusBQ, divP, divQ, negateQ, aPlusBCQ, multInvP, powP, powQ, multP, multQ, gPowP, randQ, randRangeQ, eqElems}
