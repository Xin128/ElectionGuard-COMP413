import { ElementModQ} from "./group"
import { hash_elems } from "./hash"


export class Nonces {
    __seed: ElementModQ;
    public constructor(seed: ElementModQ, ...header: any[]) {
        if (header.length > 0) {
            this.__seed = hash_elems([seed].concat(header));
        }  else {
            this.__seed = seed;
        }
    }

    public get(index: number): ElementModQ {
        return this.get_with_headers(index);
    }

    public get_with_headers(item: number, ...headers: string[]): ElementModQ {
        const hash_lst:any[] = [this.__seed,item]
        hash_lst.concat(headers);
        return hash_elems(hash_lst);
    }
}