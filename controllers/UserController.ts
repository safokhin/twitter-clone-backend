import express from 'express';
const jwt = require('jsonwebtoken');
import {UserModel, UserModelDocumentInterface, UserModelInterface} from "../models/UserModel";
import {validationResult} from "express-validator";
import {generateMD5} from "../utils/gnerateHash";
import {sendEmail} from "../utils/sendEmail";
import {isValidObjectId} from "../utils/isValidObjectId";

class UserController {

  async show (req: any, res: express.Response): Promise<void> {
    try {
      const userId = req.params.id;

      if(!isValidObjectId(userId)) {
        res.status(400).send();
        return;
      }

      const user = await UserModel.findById(userId).populate('tweets').exec();

      if(!user) {
        res.status(404).send();
        return;
      }

      res.json({
        status: 'success',
        data: user
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async index(_: any, res: express.Response): Promise<void> {
    try {
      const users = await UserModel.find({}).exec();

      res.json({
        status: 'success',
        data: users
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
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        res.status(400).json({status: 'error', errors: errors.array()});
        return;
      }

      const data: UserModelInterface = {
        email: req.body.email,
        username: req.body.username,
        fullName: req.body.fullName,
        password: generateMD5(req.body.password + process.env.SECRET_KEY),
        confirmHash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
      }
      const user = await UserModel.create(data);

      sendEmail({
        emailFrom: 'admin@twitterClone.com',
        emailTo: data.email,
        subject: 'Подтверждение почты Twitter Clone Tutorial',
        html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:${process.env.PORT || 8888}/auth/verify?hash=${data.confirmHash}">по этой ссылке</a>`,
      }, (err: Error | null) => {
        if(err) {
          res.json({
            status: 'error',
            message: err
          })
        } else {
          res.json({
            status: 'success',
            data: user
          });
        }
      })
    } catch (err) {
      console.log(err)
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async verify(req: express.Request, res: express.Response): Promise<void> {
    try {
      const hash = req.query.hash;

      if(!hash) {
        res.status(400).send();
        return
      }

      // @ts-ignore
      const user = await UserModel.findOne({ confirmHash: hash }).exec();

      if (user) {
        user.confirmed = true;
        await user.save();

        res.json({
          status: 'success',
          data: {
            ... user.toJSON(),
            token: jwt.sign({data: user.toJSON()}, process.env.SECRET_KEY, {expiresIn: '30d'})
          }
        })
      } else {
        res.status(404).send();
      }

    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async getUserInfo(req: express.Request, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
      res.json({
        status: 'success',
        data: user,
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }

  async afterLogin(req: express.Request, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
      res.json({
        status: 'success',
        data: {
          ... user,
          token: jwt.sign({data: req.user}, process.env.SECRET_KEY, {expiresIn: '30d'})
        }
      })
    } catch (err) {
      res.json({
        status: 'error',
        message: err
      })
    }
  }
}

export const UserCtrl = new UserController();
