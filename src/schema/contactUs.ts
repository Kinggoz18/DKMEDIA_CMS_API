import mongoose, { Document, Schema } from "mongoose";
import { ObjectId } from "@fastify/mongodb";

export interface ContactUsDocument extends Document {
  _id: ObjectId,
  firstName: string;
  lastName: String;
  company: string;
  email: string;
  phone: string;
}

export const ContactUsMongooseSchema = new Schema<ContactUsDocument>({
  firstName: { type: String },
  lastName: { type: String },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
}, { timestamps: true });

export const ContactUsModel = mongoose.model("ContactUs", ContactUsMongooseSchema) 