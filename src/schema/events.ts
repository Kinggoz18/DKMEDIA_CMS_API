import { OrganizerMongooseSchema } from "./organizer";
import mongoose, { Document, Schema } from "mongoose";
import { EventPriority } from "../Enums/eventPriority";
import { OrganizerValidationType } from "../types/organizer.type";
import { ObjectId } from "@fastify/mongodb";


export interface EventDocument extends Document {
  _id: ObjectId,
  title: string;
  date: string;
  image: string;
  priority: EventPriority;
  organizer: OrganizerValidationType;
}

export const EventMongooseSchema = new Schema<EventDocument>({
  title: { type: String },
  date: { type: String },
  image: { type: String },
  priority: {
    type: String,
    required: true,
    enum: EventPriority,
  },
  organizer: OrganizerMongooseSchema
}, { timestamps: true });

export const EventModel = mongoose.model("Event", EventMongooseSchema) 