import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  _id: string,
  firstName: string;
  lastName: string;
  email: string;
  provider: string;
}

export const UserMongooseSchema = new Schema<UserDocument>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  provider: { type: String },
})

export const UserModel = mongoose.model("Auth", UserMongooseSchema);