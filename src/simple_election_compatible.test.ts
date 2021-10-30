import {    
    // PrivateElectionContext,   
    CiphertextBallot,
    PlaintextBallot,
    // PlaintextBallotWithProofs,
    CiphertextElectionContext,
    make_ciphertext_election_context,
} from './simple_election_data';
import {
    context_and_ballots,
} from "./simpleElectionsUtil";
import { ElementModP, ElementModQ } from "./group";
// import { elements_mod_q_no_zero } from "./groupUtils";
import { 
    // decrypt_ballot, 
    encrypt_ballot } from './simple_elections';
import { get_optional } from './utils';
import { InternalManifest } from './manifest';

describe("TestPart2", () => {
    test("test_encryption_decryption_inverses", () => {
        // let context: CiphertextElectionContext;
        // let ballots: PlaintextBallot[];
        // eslint-disable-next-line prefer-const
        // [context, ballots] = context_and_ballots(1);
        // console.log(context);
        // const seed_nonce: ElementModQ = elements_mod_q_no_zero();
        const ballot = new PlaintextBallot('xin001', []);
        const ciphertext: CiphertextElectionContext = make_ciphertext_election_context(1, 1, new ElementModP(BigInt('11621479678980606145')), new ElementModQ(BigInt('2')), new ElementModQ(BigInt('19846')) ,null);
        const manifest = new InternalManifest([],[]);
        const encryption_seed = new ElementModQ(BigInt('52523'));
        const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(ballot, manifest, ciphertext,encryption_seed, null));
        console.log(encrypted_ballot);
        // ballots.forEach((ballot) => {
        //     // eslint-disable prefer-const
        //     const encrypted_ballot: CiphertextBallot = get_optional(encrypt_ballot(ballot, manifest, ciphertext,encryption_seed, null));
        //     console.log('encrypted_ballot', encrypted_ballot);
        //     // eslint-disable-next-line prefer-const
        //     // let decrypted_ballot: PlaintextBallotWithProofs = decrypt_ballot(context, encrypted_ballot, seed_nonce);
        //     // for (let i = 0 ; i < decrypted_ballot.num_contests(); i++){
        //     //     // Question from Xin: why did we do -1 here? 
        //     //     for (let j = 0; j < decrypted_ballot.contests[i].num_selections(); j++) {
        //     //         // console.log("compare");
        //     //         // console.log(ballot.contests[i].selections[j]);
        //     //         // console.log(decrypted_ballot.contests[i].selections[j].selection);
        //     //         expect(ballot.contests[i].selections[j]).toEqual(decrypted_ballot.contests[i].selections[j].selection);
        //     //     }
        //     // }
        // });
    });
}); 