import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from '../freet/model';
import type {Upvote} from './model';
import UpvoteModel from './model';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore Upvotes
 * stored in MongoDB, including adding, finding, updating, and deleting Upvotes.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Upvote> is the output of the UpvoteModel() constructor,
 * and contains all the information in Upvote. https://mongoosejs.com/docs/typescript.html
 */

class UpvoteCollection {
  /**
   * Add a Upvote to the collection
   *
   * @param {string} freetId - The id of the freet being Upvoted
   * @param {string} authorId - The id of the author of the Upvote
   * @return {Promise<HydratedDocument<Upvote>>} - The newly created Upvote
   */
  
  static async addOne(freetId: Types.ObjectId | string, authorId: Types.ObjectId | string): Promise<HydratedDocument<Upvote>> {
    const date = new Date();
    const upvote = new UpvoteModel({
      freetId,
      authorId,
      dateCreated: date
    });
    // updates user's array of upvoted Freets
    const author = await UserCollection.findOneByUserId(authorId.toString());
    author.upvotedFreets.push(freetId.toString());
    await author.save();
    
    await upvote.save(); // Saves upvote to MongoDB
    return upvote.populate('authorId');
  }

  /**
   * Find a upvote by upvoteId
   *
   * @param {string} upvoteId - The id of the upvote to find
   * @return {Promise<HydratedDocument<Upvote>> | Promise<null> } - The upvote with the given upvoteId, if any
   */
  static async findOne(upvoteId: Types.ObjectId | string): Promise<HydratedDocument<Upvote>> {
    return UpvoteModel.findOne({_id: upvoteId}).populate('authorId');
  }

  /**
   * Get all the upvotes in the database
   *
   * @return {Promise<HydratedDocument<Upvote>[]>} - An array of all of the upvotes
   */
  static async findAll(): Promise<Array<HydratedDocument<Upvote>>> {
    // Retrieves upvotes and sorts them from most to least recent
    return UpvoteModel.find({}).sort({dateModified: -1}).populate('authorId');
  }

  /**
   * Get all the upvotes by given author
   *
   * @param {string} username - The username of author of the upvotes
   * @return {Promise<HydratedDocument<Upvote>[]>} - An array of all of the upvotes
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Upvote>>> {
    const author = await UserCollection.findOneByUsername(username);
    return UpvoteModel.find({authorId: author._id}).populate('authorId');
  }

  /**
   * Get all the upvotes by given Freet
   * Note: can use findAllByFreet to count how many upvotes a Freet has
   *
   * @param {string} freetId - The id of Freet to display upvotes
   * @return {Promise<HydratedDocument<Upvote>[]>} - An array of all of the upvotes
   */
     static async findAllByFreet(freetId: Types.ObjectId | string): Promise<Array<HydratedDocument<Upvote>>> {
      const freet = await FreetCollection.findOne(freetId);
      return UpvoteModel.find({freetId: freet._id}).populate('freetId');
  }

  /**
   * Delete an upvote with given upvoteId.
   *
   * @param {string} upvoteId - The upvoteId of upvote to delete
   * @param {string} authorId - The authorId who upvoted
   * @param {string} freetId - The freet that has the upvote to delete
   * @return {Promise<Boolean>} - true if the upvote has been deleted, false otherwise
   */
  static async deleteOne(upvoteId: Types.ObjectId | string, authorId: Types.ObjectId | String, freetId: Types.ObjectId | String): Promise<boolean> {
    // updates user's array of upvoted Freets
    const author = await UserCollection.findOneByUserId(authorId.toString());
    author.upvotedFreets.splice(author.upvotedFreets.indexOf(freetId.toString()), 1);
    await author.save();

    const upvote = await UpvoteModel.deleteOne({_id: upvoteId});

    return upvote !== null;
  }

  /**
   * Delete all the upvotes by the given author
   *
   * @param {string} authorId - The id of author of upvotes
   */
  static async deleteManyByAuthorId(authorId: Types.ObjectId | string): Promise<void> {
    // delete whole array of Freets upvoted by author, if author exists
    if (await UserCollection.findOneByUserId(authorId.toString())) {
      const author = await UserCollection.findOneByUserId(authorId.toString());
      author.upvotedFreets = Array<string>();
      await author.save();
    }

    // delete all upvotes by the author
    await UpvoteModel.deleteMany({authorId});
  }

  /**
   * Delete all the upvotes by the given Freet
   *
   * @param {string} freetId - The id of freet of upvotes
   */
  static async deleteManyByFreetId(freetId: Types.ObjectId | string, authorId: Types.ObjectId | string): Promise<void> {
    // delete from array of Freets upvoted by user
    const author = await UserCollection.findOneByUserId(authorId.toString());
    author.upvotedFreets.splice(author.upvotedFreets.indexOf(freetId.toString()), 1);
    await author.save();

    // delete all Freet's upvotes
    await UpvoteModel.deleteMany({freetId});
  }

}

export default UpvoteCollection;