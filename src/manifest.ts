import {CryptoHashable, hash_elems} from "./hash";
import {ElectionObjectBase, OrderedObjectBase} from "./election_object_base";
import {ElementModQ} from "./group";
import {_list_eq} from "./simple_election_data";
import {get_optional} from "./utils";

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

// /**
//  * Use this as a type for character strings
//  * See: https://developers.google.com/elections-data/reference/annotated-string
//  */
// class AnnotatedString extends CryptoHashable {
//   annotation = "";
//   value = "";
//
//   constructor(annotation:string, value:string) {
//     super();
//     this.annotation = annotation;
//     this.value = value;
//   }
//
//   //Hash representation of the object.
//   crypto_hash(): ElementModQ {
//     return hash_elems([this.annotation, this.value]);
//   }
//
// }

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

  constructor(object_id: string,
              sequence_order: number,
              electoral_district_id: string,
              vote_variation: VoteVariationType,
              number_elected: number,
              votes_allowed:number,
              name:string,
              ballot_selections:SelectionDescription[],
              ballot_title: InternationalizedText,
              ballot_subtitle: InternationalizedText) {
    super();
    this.object_id = object_id;
    this.sequence_order = sequence_order;
    this.electoral_district_id = electoral_district_id;
    this.vote_variation = vote_variation;
    this.number_elected = number_elected;
    this.votes_allowed = votes_allowed;
    this.name = name;
    this.ballot_selections = ballot_selections;
    this.ballot_title = ballot_title;
    this.ballot_subtitle = ballot_subtitle;
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

/**
 * ContestDescriptionWithPlaceholders is a `ContestDescription` with ElectionGuard `placeholder_selections`.
 * (The ElectionGuard spec requires for n-of-m elections that there be *exactly* n counters that are one
 * with the rest zero, so if a voter deliberately undervotes, one or more of the placeholder counters will
 * become one. This allows the `ConstantChaumPedersenProof` to verify correctly for undervoted contests.)
 */
export class ContestDescriptionWithPlaceholders extends ContestDescription {
  placeholder_selections: SelectionDescription[] = [];

  constructor(object_id: string,
              sequence_order: number,
              electoral_district_id: string,
              vote_variation: VoteVariationType,
              number_elected: number,
              votes_allowed:number,
              name:string,
              ballot_selections:SelectionDescription[],
              ballot_title: InternationalizedText,
              ballot_subtitle: InternationalizedText,
              placeholder_selections: SelectionDescription[]) {
    super(object_id,
      sequence_order,
      electoral_district_id,
      vote_variation,
      number_elected,
      votes_allowed,
      name,
      ballot_selections,
      ballot_title,
      ballot_subtitle,
      );
    this.placeholder_selections = placeholder_selections;
  }

  //Checks is contest description is valid
  is_valid(): boolean {
    const contest_description_validates = super.is_valid();
    return (
      contest_description_validates
      && this.placeholder_selections.length == this.number_elected
    );
  }

  //Checks is contest description is placeholder
  is_placeholder(selection: SelectionDescription): boolean {
    return this.placeholder_selections.includes(selection);
  }

  //Gets the description for a particular id
  selection_for(selection_id: string): SelectionDescription | null {
    const matching_selections: SelectionDescription[]
      = this.ballot_selections.filter(selection => selection.object_id == selection_id);
    if (matching_selections.length > 0) {
      return matching_selections[0];
    }

    const matching_placeholders: SelectionDescription[]
      = this.placeholder_selections.filter(selection => selection.object_id == selection_id);

    if (matching_placeholders.length > 0) {
      return matching_placeholders[0];
    }

    return null;
  }

}

//A BallotStyle works as a key to uniquely specify a set of contests. See also `ContestDescription`.
class BallotStyle extends CryptoHashable implements ElectionObjectBase {
  object_id: string;

  geopolitical_unit_ids?: string[] = undefined;
  party_ids?: string[] = undefined;
  image_uri?: string = undefined;

  constructor(object_id: string) {
    super();
    this.object_id = object_id;
  }

  //A hash representation of the object
  crypto_hash(): ElementModQ {
    return hash_elems([this.object_id, this.geopolitical_unit_ids, this.party_ids, this.image_uri]);
  }

}

/**
 * This is just the minimal implemented internal manifest that encryption required.
 * more fields are supported in the electionguard python.
 *
 * `InternalManifest` is a subset of the `Manifest` structure that specifies
 * the components that ElectionGuard uses for conducting an election.  The key component is the
 * `contests` collection, which applies placeholder selections to the `Manifest` contests
 */
export class InternalManifest{
  contests: ContestDescriptionWithPlaceholders[]
  ballot_styles: BallotStyle[];

  constructor(contest: ContestDescriptionWithPlaceholders[], ballot_styles: BallotStyle[]) {
    this.contests = contest;
    this.ballot_styles = ballot_styles;
    //TODO: With implementaiton of Manifest class, we can do more initialization here. see: https://github.com/microsoft/electionguard-python/blob/3a56cee6ba9cb722ab02d7bf885c87f8d788b0ee/src/electionguard/manifest.py#L180
  }

  /**
   * Get contest by id
   * @param contest_id contest id
   */
  contest_for(contest_id: string): ContestDescriptionWithPlaceholders | null {
    const matching_contests:ContestDescriptionWithPlaceholders[]
      = this.contests.filter(contest => contest.object_id == contest_id);

    if (matching_contests.length > 0) {
      return matching_contests[0];
    }
    return null;
  }

  /**
   * Get a ballot style for a specified ballot_style_id
   * @param ballot_style_id the ballot style id
   */
  get_ballot_style(ballot_style_id: string): BallotStyle | null {
    const style: BallotStyle[]
      = this.ballot_styles.filter(ballot_style => ballot_style.object_id == ballot_style_id);

    if (style.length > 0) {
      return style[0];
    }

    return null;
  }

  /**
   * Get contests for a ballot style
   * @param ballot_style_id ballot style id
   */
  get_contests_for(ballot_style_id: string): ContestDescriptionWithPlaceholders[] {
    const style = get_optional(this.get_ballot_style(ballot_style_id));
    if (style.geopolitical_unit_ids == null) {
      return [];
    }
    const gp_unit_ids = style.geopolitical_unit_ids;
    return this.contests.filter(contest => gp_unit_ids.includes(contest.electoral_district_id));
  }

  //TODO: With full implementation of Manifest class, we can do generate contests with placeholders, see https://github.com/microsoft/electionguard-python/blob/3a56cee6ba9cb722ab02d7bf885c87f8d788b0ee/src/electionguard/manifest.py#L180
  //_generate_contests_with_placeholders
}
