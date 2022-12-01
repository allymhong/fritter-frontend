import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import UpvoteCollection from './collection';
import FreetCollection from '../freet/collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as upvoteValidator from './middleware';
import * as util from './util';

const router = express.Router();

// Queries (part of the URL, after '?q='), Parameters (Freet ID, also part of URL, but not identified after "q="), User Request Body (User Input – like the content)
// Only difference between Queries and Parameters is that Queries, you have to identify the variable by name (?q=author:authorId), whereas with parameters, you can just have the ID (freets/218930821094)
// Look at the Discourse for discovering when what's used for when (Queries are ideally OPTIONAL – query questioning whether something exists or not) – if it exists, then it's the actual type

/**
 * Get all the upvotes
 *
 * @name GET /api/upvotes
 *
 * @return {UpvoteResponse[]} - A list of all the upvotes sorted in descending
 *                      order by date created
 */

/**
 * Get upvotes by author.
 *
 * @name GET /api/upvotes?authorId=id
 *
 * @return {UpvoteResponse[]} - An array of upvotes created by user with authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allUpvotes = await UpvoteCollection.findAll();
    const response = allUpvotes.map(util.constructUpvoteResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorUpvotes = await UpvoteCollection.findAllByUsername(req.query.author as string);
    const response = authorUpvotes.map(util.constructUpvoteResponse);
    res.status(200).json(response);
  }
);

/**
 * Get upvotes by freet.
 *
 * @name GET /api/upvotes?freetId=id
 *
 * @return {UpvoteResponse[]} - An array of upvotes created for freet with freetId
 * @throws {400} - If freetId is not given
 * @throws {404} - If no freet has given freetId
 *
 */
 router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if freetId query parameter was supplied
    if (req.query.freetId !== undefined) {
      next();
      return;
    }

    const allUpvotes = await UpvoteCollection.findAll();
    const response = allUpvotes.map(util.constructUpvoteResponse);
    res.status(200).json(response);
  },
  [
    freetValidator.isFreetExists,
  ],
  async (req: Request, res: Response) => {
    const freetUpvotes = await UpvoteCollection.findAllByFreet(req.query.freetId as string);
    const response = freetUpvotes.map(util.constructUpvoteResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new upvote.
 *
 * @name POST /api/upvotes/:freetId
 *
 * @param {string} freetId - The ID of freet being upvoted
 * @return {UpvoteResponse} - The created upvote
 * @throws {403} - If the user is not logged in
 */
router.post(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    upvoteValidator.isFreetUpvotedbyUser
  ],
  async (req: Request, res: Response) => {
    const freetId = (req.params.freetId);
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const upvote = await UpvoteCollection.addOne(freetId, userId);

    res.status(201).json({
      message: 'You have upvoted this freet successfully.',
      upvote: util.constructUpvoteResponse(upvote)
    });
  }
);

/**
 * Delete an upvote
 *
 * @name DELETE /api/upvotes/:id
 *
 * @param {string} upvoteId - The upvote Id
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the upvote
 * @throws {404} - If the upvoteId is not valid
 */
router.delete(
  '/:upvoteId?',
  [
    userValidator.isUserLoggedIn,
    upvoteValidator.isUpvoteExists,
    upvoteValidator.isValidUpvoteModifier
  ],
  async (req: Request, res: Response) => {
    const freetId = (await UpvoteCollection.findOne(req.params.upvoteId)).freetId;
    await UpvoteCollection.deleteOne(req.params.upvoteId, req.session.userId, freetId);
    res.status(200).json({
      message: 'Your upvote was deleted successfully.'
    });
  }
);

export {router as upvoteRouter};
