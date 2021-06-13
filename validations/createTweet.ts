import {body} from "express-validator";

export const createTweetValidations = [
  body('text', 'Введите текст Твита')
    .isString()
    .isLength({
      max: 280
    }).withMessage('Максимальная длинна твита 280 символов')
];
