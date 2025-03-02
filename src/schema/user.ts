import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface UserDocument extends Document {
  _id: ObjectId,
  firstName: string;
  lastName: string;
  email: string;
}

export const UserMongooseSchema = new Schema<UserDocument>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
})

export const UserModel = mongoose.model("Auth", UserMongooseSchema);