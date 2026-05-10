import { model, Schema } from 'mongoose';

export type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
};

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const UserModel = model<UserDocument>('User', userSchema);

export default UserModel;
