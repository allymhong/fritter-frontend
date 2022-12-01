import { Freet } from '../freet/model';
import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Upvote
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Upvote on the backend
export type Upvote = {
  _id: Types.ObjectId; // MongoDB assigns each Upvote a unique ID
  freetId: Types.ObjectId; // Freet being upvoted
  authorId: Types.ObjectId; // whoever is upvoting
  dateCreated: Date;
};

// not an ID, but going through a user model
export type PopulatedUpvote = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Freet;
  authorId: User;
  dateCreated: Date;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Upvotes stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const UpvoteSchema = new Schema<Upvote>({
  // The Upvoted Freet ID
  freetId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  // The author userId
  authorId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the Upvote was created
  dateCreated: {
    type: Date,
    required: true
  }
});

const UpvoteModel = model<Upvote>('Upvote', UpvoteSchema);
export default UpvoteModel;
