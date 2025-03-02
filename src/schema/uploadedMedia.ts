import mongoose, { Document } from "mongoose";
import { mediaType } from "../Enums/mediaType";
import { ObjectId } from "@fastify/mongodb";


export interface UploadedMediaDocument extends Document {
  _id: ObjectId,
  mediaType: mediaType;
  mediaLink: string;
}

export const UploadedMediaMongooseSchema = new mongoose.Schema<UploadedMediaDocument>({
  mediaType: {
    type: String,
    enum: mediaType,
    required: true
  },
  mediaLink: {
    type: String,
    Required: true,
  }
}, { timestamps: true })

export const UploadedMediaModel = mongoose.model('UploadedMedia', UploadedMediaMongooseSchema);
