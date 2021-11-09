import mongoose, {
  Schema
} from 'mongoose';

/**
 * Create database scheme for ballot
 */
const BallotScheme = new Schema({
  object_id: String,
  style_id: String,
  contests: [
    {
      object_id: String,
      sequence_order: Number,
      ballot_selections: [
        {
          object_id: String,
          sequence_order: Number,
          vote: Number,
          extended_data: {
            value: String,
            length: Number
          }
        }
      ]
    }
  ]
});

export default mongoose.model('Ballot', BallotScheme);
