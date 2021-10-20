import {CryptoHashable, hash_elems} from "./hash";
import {OrderedObjectBase} from "./election_object_base";
import {ElementModQ} from "./group";
import {_list_eq} from "./simple_election_data";

// /**
//  * Enumeration for the type of geopolitical unit
//  * see: https://developers.google.com/elections-data/reference/reporting-unit-type
//  */
// enum ReportingUnitType{
//   unknown = "unknown",
//   ballot_batch = "ballot_batch",
//   ballot_style_area = "ballot_style_area",
//   borough = "borough",
//   city = "city",
//   city_council = "city_council",
//   combined_precinct = "combined_precinct",
//   congressional = "congressional",
//   country = "country",
//   county = "county",
//   county_council = "county_council",
//   drop_box = "drop_box",
//   judicial = "judicial",
//   municipality = "municipality",
//   polling_place = "polling_place",
//   precinct = "precinct",
//   school = "school",
//   special = "special",
//   split_precinct = "split_precinct",
//   state = "state",
//   state_house = "state_house",
//   state_senate = "state_senate",
//   township = "township",
//   utility = "utility",
//   village = "village",
//   vote_center = "vote_center",
//   ward = "ward",
//   water = "water",
//   other = "other",
// }
//
//
//
// /**
//  * For defining contact information about objects such as persons, boards of authorities, and organizations.
//  * See: https://developers.google.com/elections-data/reference/contact-information
//  */
// export class ContactInformation extends CryptoHashable{
//   address_line?: string[] = undefined;
//   email?: AnnotatedString[] = undefined;
//
//   crypto_hash(): ElementModQ {
//     return undefined;
//   }
//
// }
//
// /**
//  * Use this entity for defining geopolitical units such as cities, districts, jurisdictions, or precincts,
//  * for the purpose of associating contests, offices, vote counts, or other information with the geographies.
//  * See: https://developers.google.com/elections-data/reference/gp-unit
//  */
// export class GeopoliticalUnit extends CryptoHashable implements ElectionObjectBase {
//   object_id:string;
//   name: string;
//   type: ReportingUnitType;
//   contact_information: ContactInformation | null | undefined;
//
//   crypto_hash(): ElementModQ {
//     return undefined;
//   }
//
// }

/**
 * Use this as a type for character strings
 * See: https://developers.google.com/elections-data/reference/annotated-string
 */
class AnnotatedString extends CryptoHashable {
  annotation = "";
  value = "";

  constructor(annotation:string, value:string) {
    super();
    this.annotation = annotation;
    this.value = value;
  }

  //Hash representation of the object.
  crypto_hash(): ElementModQ {
    return hash_elems([this.annotation, this.value]);
  }

}

/**
 * Enumeration for contest algorithm or rules in the `Contest` entity
 * see: https://developers.google.com/elections-data/reference/vote-variation
 */
enum VoteVariationType {
  unknown = "unknown",
  one_of_m = "one_of_m",
  approval = "approval",
  borda = "borda",
  cumulative = "cumulative",
  majority = "majority",
  n_of_m = "n_of_m",
  plurality = "plurality",
  proportional = "proportional",
  range = "range",
  rcv = "rcv",
  super_majority = "super_majority",
  other = "other",
}

/**
 *Data entity for the ballot selections in a contest,
 * for example linking candidates and parties to their vote counts.
 * See: https://developers.google.com/elections-data/reference/ballot-selection
 * Note: The ElectionGuard Data Spec deviates from the NIST model in that
 * there is no difference for different types of selections.
 * The ElectionGuard Data Spec deviates from the NIST model in that
 * `sequence_order` is a required field since it is used for ordering selections
 * in a contest to ensure various encryption primitives are deterministic.
 * For a given election, the sequence of selections displayed to a user may be different
 * however that informat
 */
class SelectionDescription extends CryptoHashable implements OrderedObjectBase {
  object_id: string;
  sequence_order: number;

  candidate_id: string;

  constructor(object_id:string, sequence_order: number, candidate_id: string) {
    super();
    this.object_id = object_id;
    this.sequence_order = sequence_order;
    this.candidate_id = candidate_id;
  }

  //A hash representation of the object
  crypto_hash(): ElementModQ {
    return hash_elems([this.object_id, this.sequence_order, this.candidate_id]);
  }

}

/**
 * The ISO-639 language
 * see: https://en.wikipedia.org/wiki/ISO_639
 */
class Language extends CryptoHashable {
  value: string;
  language = "en";

  constructor(value:string, language: string) {
    super();
    this.value = value;
    this.language = language;
  }

  //A hash representation of the object
  crypto_hash(): ElementModQ {
    return hash_elems([this.value, this.language]);
  }

}

/**
 * Data entity used to represent multi-national text. Use when text on a ballot contains multi-national text.
 * See: https://developers.google.com/elections-data/reference/internationalized-text
 */
class InternationalizedText extends CryptoHashable {
  text: Language[];

  constructor(text: Language[]) {
    super();
    this.text = text;
  }

  //A hash representation of the object.
  crypto_hash(): ElementModQ {
    return hash_elems(this.text);
  }

}

/**
 * Use this data entity for describing a contest and linking the contest
 * to the associated candidates and parties.
 * See: https://developers.google.com/elections-data/reference/contest
 * Note: The ElectionGuard Data Spec deviates from the NIST model in that
 * `sequence_order` is a required field since it is used for ordering selections
 * in a contest to ensure various encryption primitives are deterministic.
 * For a given election, the sequence of contests displayed to a user may be different
 * however that information is not captured by default when encrypting a specific ballot.
 */
class ContestDescription extends CryptoHashable implements OrderedObjectBase {
  object_id: string;
  sequence_order: number;

  electoral_district_id: string;

  vote_variation: VoteVariationType;

  // Number of candidates that are elected in the contest ("n" of n-of-m).
  // Note: a referendum is considered a specific case of 1-of-m in ElectionGuard
  number_elected: number;

  // Maximum number of votes/write-ins per voter in this contest. Used in cumulative voting
  // to indicate how many total votes a voter can spread around. In n-of-m elections, this will
  // be None.
  votes_allowed?: number;

  // Name of the contest, not necessarily as it appears on the ballot.
  name: string;

  // For associating a ballot selection for the contest, i.e., a candidate, a ballot measure.
  ballot_selections:SelectionDescription[] = [];

  // Title of the contest as it appears on the ballot.
  ballot_title?: InternationalizedText = undefined;

  // Subtitle of the contest as it appears on the ballot.
  ballot_subtitle?: InternationalizedText = undefined;

  constructor() {
    super();
  }

  //!!! This operation changes the order of this and other's ballot_selections object order
  //Let Arthur Know if this is a problem
  equals(other: ContestDescription): boolean {
    return (
      this.electoral_district_id == other.electoral_district_id
      && this.sequence_order == other.sequence_order
      && this.vote_variation == other.vote_variation
      && this.number_elected == other.number_elected
      && this.votes_allowed == other.votes_allowed
      && this.name == other.name
      && _list_eq(this.ballot_selections, other.ballot_selections)
      && this.ballot_title == other.ballot_title
      && this.ballot_subtitle == other.ballot_subtitle
    );
  }

  /**
   * Given a ContestDescription, deterministically derives a "hash" of that contest,
   * suitable for use in ElectionGuard's "base hash" values, and for validating that
   * either a plaintext or encrypted voted context and its corresponding contest
   * description match up.
   */
  crypto_hash(): ElementModQ {
    return hash_elems([
      this.object_id,
      this.sequence_order,
      this.electoral_district_id,
      VoteVariationType[this.vote_variation],
      this.ballot_title,
      this.ballot_subtitle,
      this.name,
      this.number_elected,
      this.votes_allowed,
      this.ballot_selections,
    ]);
  }

  //Check the validity of the contest object by verifying its data
  is_valid(): boolean {
    const contest_has_valid_number_elected = this.number_elected <=
      this.ballot_selections.length;
    const contest_has_valid_votes_allowed = (
      this.votes_allowed == null || this.number_elected <= this.votes_allowed
    );

    // verify the candidate_ids, selection object_ids, and sequence_ids are unique
    const candidate_ids = new Set<string>();
    const selection_ids = new Set<string>();
    const sequence_ids = new Set<number>();
    // let selection_count = 0;
    const expected_selection_count = this.ballot_selections.length;

    for (const selection of this.ballot_selections) {
      // selection_count += 1;
      // validate the object_id
      if (!selection_ids.has(selection.object_id)) {
        selection_ids.add(selection.object_id);
      }
      // validate the sequence_order
      if (!sequence_ids.has(selection.sequence_order)) {
        sequence_ids.add(selection.sequence_order);
      }
      // validate the candidate id
      if (!candidate_ids.has(selection.candidate_id)){
        candidate_ids.add(selection.candidate_id);
      }
    }

    const selections_have_valid_candidate_ids = (
      candidate_ids.size == expected_selection_count
    );
    const selections_have_valid_selection_ids = (
      selection_ids.size == expected_selection_count
    );
    const selections_have_valid_sequence_ids = (
      sequence_ids.size == expected_selection_count
    );

    const success = (
      contest_has_valid_number_elected
    && contest_has_valid_votes_allowed
    && selections_have_valid_candidate_ids
    && selections_have_valid_selection_ids
    && selections_have_valid_sequence_ids
  );

    //Python library do logging here
    // if (!success):
      // log_warning(
      //   "Contest %s failed validation check: %s",
      //   self.object_id,
      //   str(
      //     {
      //       "contest_has_valid_number_elected": contest_has_valid_number_elected,
      //       "contest_has_valid_votes_allowed": contest_has_valid_votes_allowed,
      //       "selections_have_valid_candidate_ids": selections_have_valid_candidate_ids,
      //       "selections_have_valid_selection_ids": selections_have_valid_selection_ids,
      //       "selections_have_valid_sequence_ids": selections_have_valid_sequence_ids,
      //     }
      //   ),
      // )

    return success

  }

}

class ContestDescriptionWithPlaceholders extends ContestDescription {

}

/**
 * `InternalManifest` is a subset of the `Manifest` structure that specifies
 * the components that ElectionGuard uses for conducting an election.  The key component is the
 * `contests` collection, which applies placeholder selections to the `Manifest` contests
 */
export class InternalManifest{
  contests: ContestDescriptionWithPlaceholders[]
}
