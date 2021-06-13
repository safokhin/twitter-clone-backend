import {model, Schema, Document} from "mongoose";

export interface UserModelInterface {
  _id?: string,
  email: string,
  fullName: string,
  username: string,
  password: string,
  confirmed?: boolean,
  confirmHash: string,
  location?: string,
  about?: string,
  website?: string,
  tweets?: string[],
}

export type UserModelDocumentInterface = UserModelInterface & Document;

const UserSchema = new Schema<UserModelDocumentInterface>({
  email: {
    unique: true,
    required: true,
    type: String
  },
  fullName: {
    required: true,
    type: String
  },
  username: {
    unique: true,
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  confirmHash: {
    required: true,
    type: String
  },
  location: String,
  about: String,
  website: String,
  tweets: [{type: Schema.Types.ObjectId, ref: 'Tweet'}]
}, {  timestamps: true})

UserSchema.set('toJSON', {
  transform: function (_: any, obj: any) {
    delete obj.password;
    delete obj.confirmHash;
    return obj;
  }
})

export const UserModel = model<UserModelDocumentInterface>('User', UserSchema);

