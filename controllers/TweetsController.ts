import express from 'express';

import {UserModelInterface} from "../models/UserModel";
import {validationResult} from "express-validator";
import {TweetModel} from "../models/TweetModel";
import {isValidObjectId} from "../utils/isValidObjectId";


class TweetsController {

  async index(_: any, res: express.Response): Promise<void> {
    try {
      const tweets = await TweetModel.find({}).populate('user').sort({'createdAt': '-1'}).exec();

      res.json({
        status: 'success',
        data: tweets
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async show (req: any, res: express.Response): Promise<void> {
    try {
      const tweetId = req.params.id;

      if(!isValidObjectId(tweetId)) {
        res.status(400).send();
        return;
      }

      const tweet = await TweetModel.findById(tweetId).populate('user').exec();

      if(!tweet) {
        res.status(404).send();
        return;
      }

      res.json({
        status: 'success',
        data: tweet
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async getUserTweets (req: any, res: express.Response): Promise<void> {
    try {
      const userId = req.params.id;

      if(!isValidObjectId(userId)) {
        res.status(400).send();
        return;
      }

      const tweet = await TweetModel.find({ user: userId }).populate('user').exec();

      if(!tweet) {
        res.status(404).send();
        return;
      }

      res.json({
        status: 'success',
        data: tweet
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    try {
      const user = req.user as UserModelInterface;
      if(user?._id) {
        // const errors = validationResult(req);

        // console.log(!errors.isEmpty())
        // if(!errors.isEmpty()) {
        //   res.status(400).json({status: 'error', errors: errors.array()});
        //   return;
        // }
        console.log(req.body)
        const data: any = {
          text: req.body.textTweet,
          images: req.body.images,
          user: user._id,
        }

        const tweet = await TweetModel.create(data);

        user.tweets.push(tweet._id);

        res.json({
          status: 'success',
          data: await tweet.populate('user').execPopulate()
        });
      }

    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err
      })
    }
  }

  async update(req: express.Request, res: express.Response): Promise<void> {
    const user = req.user as UserModelInterface;

    try {
      if(user) {
        const tweetId = req.params.id;

        if(!isValidObjectId(tweetId)) {
          res.status(400).send();
          return;
        }

        const tweet = await TweetModel.findById(tweetId);

        if(tweet) {
          if(tweet.user._id.toString() === user._id.toString()) {
            tweet.text = req.body.text;
            tweet.save();
            res.send();
          }
          else {
            res.status(403).send();
          }
        } else {
          res.status(404).send();
        }
      }
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err
      })
    }
  }

  async delete(req: express.Request, res: express.Response): Promise<void> {
    const user = req.user as UserModelInterface;

    try {
      if(user) {
        const tweetId = req.params.id;

        if(!isValidObjectId(tweetId)) {
          res.status(400).send();
          return;
        }

        const tweet = await TweetModel.findById(tweetId);

        if(tweet) {
          if(tweet.user._id.toString() === user._id.toString()) {
            tweet.remove();
            res.send();
          }
          else {
            res.status(403).send();
          }
        } else {
          res.status(404).send();
        }
      }
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err
      })
    }
  }

}

export const TweetsCtrl = new TweetsController();
