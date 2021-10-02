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
import { context_and_ballots } from "./simpleElectionsUtil";

describe("TestPart1", () => {
    test("test_part1_encryption_decryption_inverses", () => {
        const [context, ballots] = context_and_ballots(1);
        const seed_nonce: ElementModQ = elements_mod_q_no_zero();

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

    test("test_part1_proof_validation", () => {
       const [context, ballots] = context_and_ballots(1);
       const seed_nonce: ElementModQ = elements_mod_q_no_zero();

       const selections: PlaintextSelection[] = ballots[0].selections;
       const nonces = new Nonces(seed_nonce, "part1-ballot-nonces").slice(0 , selections.length);
       const decrypt_nonces = new Nonces(seed_nonce, "part1-ballot-decrypt-nonces").slice(0 , selections.length);

       let encryptions = [];
       selections.forEach((selection , idx) => {
           encryptions = [...encryptions, encrypt_selection(context, selection, nonces[idx])];
       });
       expect(encryptions).not.toEqual(null);
       
       encryptions.forEach((e) => {
        expect(validate_encrypted_selection(context, e[0])).toBe(true);
       });

       let decryptions_with_key: PlaintextSelectionWithProof[] = [];
        selections.forEach((selection, idx) => {
            decryptions_with_key = [...decryptions_with_key, decrypt_selection(context, encryptions[idx][0], decrypt_nonces[idx])];
        });

        decryptions_with_key.forEach((d, idx) => {
            expect(validate_decrypted_selection(context, d, encryptions[idx][0]));
        });

    });

    test("test_part1_invalid_encryption_proofs_fail", () => {
        const [context, ballots] = context_and_ballots(1);
        const original_seed_nonce: ElementModQ = elements_mod_q_no_zero();
        const substitute_seed_nonce: ElementModQ = elements_mod_q();

        const selections: PlaintextSelection[] = ballots[0].selections;
        const original_decrypt_nonces = new Nonces(original_seed_nonce, "part1-ballot-decrypt-nonces").slice(0, Math.floor(selections.length / 2));
        const substitute_decrypt_nonces = new Nonces(substitute_seed_nonce, "part1-ballot-decrypt-nonces").slice(0, Math.floor(selections.length / 2));
        let original_encryptions = [];
        selections.forEach((selection , idx) => {
            original_encryptions = [...original_encryptions, encrypt_selection(context, selection, original_decrypt_nonces[idx])];
        });
        let substitute_encryptions = [];
        selections.forEach((selection , idx) => {
            substitute_encryptions = [...substitute_encryptions, encrypt_selection(context, selections[Math.floor(selections.length / 2) + idx], substitute_decrypt_nonces[idx])];
        });
        expect(original_encryptions).not.toBeNull();
        expect(substitute_encryptions).not.toBeNull();

        let original_decryptions_with_key: PlaintextSelectionWithProof[] = [];
        original_encryptions.forEach((o, idx) => {
            original_decryptions_with_key = [...original_decryptions_with_key, decrypt_selection(context, o[0], original_decrypt_nonces[idx])];
        });

        // make changes to proof
        let original_decryptions_with_wrong_proof: PlaintextSelectionWithProof[] = [];
        original_encryptions.forEach((o, idx) => {
            original_decryptions_with_wrong_proof = [...original_decryptions_with_wrong_proof, new PlaintextSelectionWithProof(selections[idx], new ChaumPedersenDecryptionProof(make_fake_chaum_pedersen_generic(ONE_MOD_P, ONE_MOD_P, ONE_MOD_P, ONE_MOD_P, original_seed_nonce, substitute_seed_nonce)))];
        });

        original_decryptions_with_wrong_proof.forEach((d, idx) => {
            expect(validate_decrypted_selection(context, d, original_encryptions[idx][0])).toBe(false);
        });

        // make changes to ciphertext
        let substitute_decryptions_with_key: PlaintextSelectionWithProof[] = [];
        substitute_encryptions.forEach((s, idx) => {
            substitute_decryptions_with_key = [...substitute_decryptions_with_key, decrypt_selection(context, s[0], substitute_decrypt_nonces[idx])];
        });

        original_encryptions.forEach((e, idx) => {
            expect(validate_decrypted_selection(context, substitute_decryptions_with_key[idx], e[0])).toBe(false);
        });

        original_encryptions.forEach((e, idx) => {
            expect(validate_decrypted_selection(context, original_decryptions_with_key[idx], e[0])).toBe(true);
        });

    });


});
