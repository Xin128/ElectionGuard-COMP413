import { ElementModQ } from "./group";
import { make_fake_chaum_pedersen_generic, ChaumPedersenDecryptionProof } from "./chaum_pedersen";
import { ONE_MOD_P } from "./group";
import { Nonces } from "./nonces";
import {
    PrivateElectionContext,
    PlaintextBallot,
    PlaintextSelection,
    PlaintextSelectionWithProof,
} from "./simple_election_data";
import {
    encrypt_selection,
    decrypt_selection,
    validate_encrypted_selection,
    validate_decrypted_selection,
} from "./simple_elections";
import { elements_mod_q_no_zero, elements_mod_q } from "./groupUtils";
import { context_and_ballots } from "./simple_elections";

describe("TestPart1", () => {
    // TODO
    test("test_part1_encryption_decryption_inverses", () => {
        const [context, ballots] = context_and_ballots;
        const seed_nonce: ElementModQ = new ElementModQ(0n);

        const selections: PlaintextSelection[] = ballots[0].selections;
        const nonces = new Nonces(seed_nonce, "part1-ballot-nonces").slice(0 , selections.length);
        const decrypt_nonces = new Nonces(seed_nonce, "part1-ballot-decrypt-nonces").slice(0 , selections.length);

        let encryptions = [];
        selections.forEach((selection , idx) => {
            encryptions = [...encryptions, encrypt_selection(context, selection, nonces[idx])];
        });
        expect(encryptions).not.toEqual(null);

        let decryptions_with_nonce: bigint[] = [];
        encryptions.forEach((e) => {
            decryptions_with_nonce = [...decryptions_with_nonce, e[0].ciphertext.decrypt_known_nonce(context.keypair.public_key, e[1])];
        });

        let decryptions_with_key: PlaintextSelectionWithProof[] = [];
        selections.forEach((selection, idx) => {
            decryptions_with_key = [...decryptions_with_key, decrypt_selection(context, encryptions[idx][0], decrypt_nonces[idx])];
        });

        selections.forEach((selection, idx) => {
            const dn = decryptions_with_nonce[idx];
            const dk = decryptions_with_key[idx];
            expect(selection.choice).toEqual(dn);
            expect(selection).toEqual(dk.selection);

        });

    });

    // TODO
    test("test_part1_proof_validation", () => {

    });

    // TODO
    test("test_part1_invalid_encryption_proofs_fail", () => {

    });


});
