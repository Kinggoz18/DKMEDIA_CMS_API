import mongoose, { Document, Schema } from "mongoose";

export interface OrganizerDocument extends Document {
  _id: string,
  name: string;
  logo: string;
}

export const OrganizerMongooseSchema = new Schema<OrganizerDocument>({
  name: { type: String },
  logo: { type: String },
}, { timestamps: true });

export const OrganizerModel = mongoose.model("Organizer", OrganizerMongooseSchema);
