import {TweetsCtrl} from "./controllers/TweetsController";

require('dotenv').config();
import './core/db';
const multer  = require('multer');
const express = require('express');
import {passport} from "./core/passport";
import {UserCtrl} from "./controllers/UserController";
import { UploadFileCtrl } from "./controllers/UploadFileController";
import {registerValidations} from "./validations/register";
import {createTweetValidations} from "./validations/createTweet";

const app = express();
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });



app.use(express.json());
app.use(passport.initialize())

app.get('/users', UserCtrl.index);
app.get('/users/me', passport.authenticate('jwt', {session: false}), UserCtrl.getUserInfo);
app.get('/users/:id', UserCtrl.show);

app.get('/tweets', TweetsCtrl.index);
app.get('/tweets/:id', TweetsCtrl.show);
app.get('/tweets/user/:id', TweetsCtrl.getUserTweets);
app.delete('/tweets/:id', passport.authenticate('jwt'), TweetsCtrl.delete);
app.post('/tweets', passport.authenticate('jwt'), createTweetValidations, TweetsCtrl.create);
app.patch('/tweets/:id', passport.authenticate('jwt'), createTweetValidations, TweetsCtrl.update);

app.get('/auth/verify', registerValidations, UserCtrl.verify);
app.post('/auth/register', registerValidations, UserCtrl.create);
app.post('/auth/login', passport.authenticate('local'), UserCtrl.afterLogin);

app.post('/upload', upload.single('image'), UploadFileCtrl.upload);

// app.patch('/users', UserCtrl.update);
// app.delete('/users', UserCtrl.delete);

app.listen(process.env.PORT, (): void => {
  console.log('Server Running!')
});
