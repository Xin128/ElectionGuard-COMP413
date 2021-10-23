import {get_optional} from "./utils";
import { buildFakeBallot, encryptBallot } from "./API/APIUtils";

get_optional(document.getElementById("myBtn")).addEventListener("click", function () {
  console.log('click');
  const fakeBallot = buildFakeBallot();
  const result = encryptBallot(fakeBallot);
  get_optional(document.getElementById("output")).innerHTML = result.hash;
  get_optional(document.getElementById("seed_nonce")).innerHTML = result.seed;
  get_optional(document.getElementById("qrcode")).appendChild(result.hashImg);
  get_optional(document.getElementById("qrcode")).appendChild(result.seedImg);
});
