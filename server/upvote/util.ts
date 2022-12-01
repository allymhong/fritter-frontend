import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Upvote, PopulatedUpvote} from './model';
import type {Freet, PopulatedFreet} from '../freet/model';

// Update this if you add a property to the Upvote type!
type UpvoteResponse = {
  _id: string;
  freetId: string;
  author: string;
  dateCreated: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Upvote object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Upvote>} upvote - An upvote
 * @returns {UpvoteResponse} - The upvote object formatted for the frontend
 */
const constructUpvoteResponse = (upvote: HydratedDocument<Upvote>): UpvoteResponse => {
  const upvoteCopy: PopulatedUpvote = {
    ...upvote.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = upvoteCopy.authorId;
  delete upvoteCopy.authorId;

  return {
    ...upvoteCopy,
    _id: upvoteCopy._id.toString(),
    freetId: upvoteCopy.freetId._id.toString(),
    author: username,
    dateCreated: formatDate(upvote.dateCreated),
  };
};

// count length of array for how many upvotes are on a freet

export {
  constructUpvoteResponse
};
