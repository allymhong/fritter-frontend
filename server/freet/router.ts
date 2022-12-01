import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetCollection from './collection';
import UpvoteCollection from '../upvote/collection';
import UserCollection from '../user/collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all AVAILABLE freets (personalized to user)
 * – so underage (age 15+, but under 18) users 
 *   will only get the unflagged freets (as the selfFlagged ones are not available to them).
 *
 * @name GET /api/freets
 *
 * @return {FreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?author=username
 *
 * @return {FreetResponse[]} - An array of freets created by user with username, author
 * @throws {400} - If author is not given
 * @throws {404} - If no user has given username
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if author query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    // Underage users will not be able to view flagged Freets at all;
    // Users that are not signed in + 18+ users will be able to see flagged Freets,
    // but still only with the censored content. You can only show content when you
    // "Show Freet By ID" with Freet ID. Will be more fluid in A6.

    let underage = null
    if (req.session.userId) {
      underage = (await UserCollection.findOneByUserId(req.session.userId.toString())).underage
    }

    if (underage) {
      const allFreets = await FreetCollection.findAllUnflagged();
      const response = allFreets.map(util.constructFreetResponse);
      res.status(200).json(response);
    } else {
      const allFreets = await FreetCollection.findAll();
      const response = allFreets.map(util.constructFreetResponse);
      res.status(200).json(response);  
    };
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const authorFreets = await FreetCollection.findAllByUsername(req.query.author as string);
    const response = authorFreets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * View Flagged Freets by ID. Making up for "Show Freet" in wireframe in A4.
 * Most useful for users who want to see content of flagged Freets. But this option
 * will only be available for users who are signed in and are not underage.
 * 
 * At the moment, because of API allows for empty string to go to /api/freets (I didn't want
 * to use a query to stay consistent with all the other freetIds), the display on A5 backend
 * will show all the Freets. For A6, this function will only be used for Freets that have 
 * IDs, so this error will not persist.
 * 
 * @name GET /api/freets/:id
 *
 * @param {string} freetId - The freet Id
 * @return {string} - A success message
 * @throws {400} - If freetId is not given
 * @throws {404} - If the freetId is not valid
 */
 router.get(
  '/:freetId?',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if freetId query parameter was supplied
    if (req.params.freetId !== undefined) {
      next();
      return;
    }
  },
  [
    freetValidator.isFreetExists,
    userValidator.isUserLoggedIn,
    userValidator.isUserAdult
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.findOne(req.params.freetId);
    let message = "Success. Here is the unflagged Freet."
    if (!freet.selfFlagged) {
      message = "Freet is not flagged, but here it is still for viewing!"
    }
    res.status(200).json({
      freet: util.constructRawFreetResponse(freet),
      message: message
    });
  }
);

/**
 * Create a new freet – including Citations!
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @return {RawFreetResponse} - The created freet (raw, not considering flag filters)
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 280 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isValidFreetContent
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn

    // checking if user flagged Freet
    console.log(req.body)

    let flag_responses: Array<string> = []; 
    for (let flags in req.body){
      // skip over "content" flag!
      if (flags === "content") {
        continue;
      }
      flag_responses.push(req.body[flags]); // checking only through req.body with name="flags_"
    }

    const freet = await FreetCollection.addOne(userId, req.body.content, flag_responses);
    // for citationLink of req.body.citations:
      // await CitationCollection.addOne(freetId, userId, citationLink, citationTitle, citationAuthor)
    // 0 or more citations created here using req.body.citations
    // save ID of freet above (const freet / 71)

    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: util.constructRawFreetResponse(freet)
    });
  }
);

/**
 * Delete a freet
 *
 * @name DELETE /api/freets/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier
  ],
  async (req: Request, res: Response) => {
    await FreetCollection.deleteOne(req.params.freetId);
    await UpvoteCollection.deleteManyByFreetId(req.params.freetId, req.session.userId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);


export {router as freetRouter};
