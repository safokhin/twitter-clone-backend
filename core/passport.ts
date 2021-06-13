import {generateMD5} from "../utils/gnerateHash";
import {UserModel, UserModelInterface} from "../models/UserModel";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new LocalStrategy(
  async (username: string, password: string, done: any): Promise<void> => {
    try {
      const user = await UserModel.findOne({$or: [{email: username}, {username}]}).exec();

      if (!user) {
        return done(null, false)
      }

      if (user.confirmed && user.password === generateMD5(password + process.env.SECRET_KEY)) done(null, user);
      else done(null, false);


    } catch (err) {
      return done(err, false);
    }
  }))

passport.use(
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromHeader('token')
    }, async (payload: {data: UserModelInterface}, done: any): Promise<void> => {
      try {
        const user = await UserModel.findById(payload.data._id).exec();

        if(user) {
          return done(null, user);
        }

        done(null, false)
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user: UserModelInterface, done: any) => {
  done(null, user?._id);
});

passport.deserializeUser(function(id: string, done: any) {
  UserModel.findById(id, (err: any, user: any) => {
    done(err, user);
  });
});

export { passport };
