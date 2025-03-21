import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface UserDocument extends Document {
  _id: ObjectId,
  authId: string;
  displayName: string;
  email: string;
}

export const UserMongooseSchema = new Schema<UserDocument>({
  authId: { type: String },
  displayName: { type: String },
  email: { type: String },
})

export const UserModel = mongoose.model("Auth", UserMongooseSchema);