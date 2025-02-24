import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface SubscriptionDocument extends Document {
  _id: ObjectId,
  firstName: string;
  lastName: String;
  company: string;
  email: string;
  phone: string;
}

export const SubscriptionMongooseSchema = new Schema<SubscriptionDocument>({
  firstName: { type: String },
  lastName: { type: String },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
}, { timestamps: true });

export const SubscriptionModel = mongoose.model("Subscription", SubscriptionMongooseSchema) 