import { ElementModQ, ElementModPOrQ} from "./group"
import { hash_elems } from "./hash"


export class Nonces {
    __seed: ElementModQ;
    public constructor(seed: ElementModQ, ...header: any[]) {
        if (header.length > 0) {
            this.__seed = hash_elems(seed, header);
        } else {
            this.__seed = seed;
        }
    }

    public get(index: number): ElementModQ {
        return this.get_with_headers(index);
    }

    public get_with_headers(item: number, ...headers: string[]): ElementModQ {
        return hash_elems(this.__seed, item, ...headers);
    }
}