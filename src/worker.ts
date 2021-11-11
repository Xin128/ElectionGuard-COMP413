import {get_optional} from "./utils";
import {encrypt_ballot_contest} from "./simple_elections";
onmessage = function(e) {
    console.log("*******")
    const result = get_optional(encrypt_ballot_contest(e.data[0], e.data[1], e.data[2]));
    postMessage(result);
}