import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';
import UpvoteCollection from './collection';

/**
 * Checks if an upvote with upvoteId in req.params exists
 */
const isUpvoteExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.upvoteId);
  const upvote = validFormat ? await UpvoteCollection.findOne(req.params.upvoteId) : '';
  if (upvote) {"exists"}
  if (!upvote) {
    res.status(404).json({
      error: {
        upvoteNotFound: `Upvote with upvote ID ${req.params.upvoteId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if user already upvoted Freet (as it can only be upvoted once)
 */
 const isFreetUpvotedbyUser = async (req: Request, res: Response, next: NextFunction) => {
  const author = await UserCollection.findOneByUserId(req.session.userId)
  if (author.upvotedFreets.includes(req.params.freetId.toString())) {
    res.status(409).json({
      error: {
        upvoteAlreadyExists: `User has already upvoted this Freet.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the upvote whose upvoteId is in req.params
 */
const isValidUpvoteModifier = async (req: Request, res: Response, next: NextFunction) => {
  const upvote = await UpvoteCollection.findOne(req.params.upvoteId);
  const userId = upvote.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(400).json({
      error: 'Cannot modify other users\' upvotes.'
    });
    return;
  }

  next();
};

export {
  isUpvoteExists,
  isValidUpvoteModifier,
  isFreetUpvotedbyUser
};
