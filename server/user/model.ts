import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a User
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for User on the backend
export type User = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  username: string;
  password: string;
  dateJoined: Date;

  // only Users 15+ are allowed, so users must provide their birthdays when creating an account;
  // and whether or not they are "underage" (under 18) will be checked for censored Freets
  birthday: Date;
  underage: Boolean;

  // updates everytime user upvotes Freets
  upvotedFreets: Array<string>;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Users stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const UserSchema = new Schema({
  // The user's username
  username: {
    type: String,
    required: true
  },
  // The user's password
  password: {
    type: String,
    required: true
  },
  // The date the user joined
  dateJoined: {
    type: Date,
    required: true
  },
  // The birthday of the user
  birthday: {
    type: Date,
    required: true
  },
  // Underage Flag
  underage: {
    type: Boolean,
    required: true
  },
  // Array of Freets that the User Upvoted
  upvotedFreets: {
    type: Array,
    required: true
  }
});

const UserModel = model<User>('User', UserSchema);
export default UserModel;
