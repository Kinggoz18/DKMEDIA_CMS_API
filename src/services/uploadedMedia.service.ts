import { mongodb, ObjectId } from "@fastify/mongodb";
import IService from "../interfaces/IService";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { IReplyType } from "../interfaces/IReply";
import { UploadedMediaDocument, UploadedMediaModel } from "../schema/uploadedMedia";
import { UploadedMediaValidationType } from "../types/uploadedMedia.type";
import { ReplyError } from "../interfaces/ReplyError";

export class UploadedMediaService implements IService<UploadedMediaDocument> {
  dbModel = UploadedMediaModel;
  dbCollection: mongodb.Collection<UploadedMediaDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<UploadedMediaDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }
  /**
   * Upload a new media
   * @param request 
   * @param reply 
   * @returns 
   */
  addMedia = async (request: FastifyRequest<{ Body: UploadedMediaValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        mediaType,
        mediaLink
      } = request.body;

      // Validate the uploaded media
      const media = new this.dbModel({
        mediaType,
        mediaLink
      });

      await media.validate();
      const savedMedia = await this.dbCollection.insertOne(media);

      const getSavedMedia = await this.dbCollection.findOne({ _id: savedMedia?.insertedId });
      if (!getSavedMedia) {
        throw new ReplyError("Failed to save media", 400);
      }

      return reply.code(201).send({ data: getSavedMedia, success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete a media
   * @param request 
   * @param reply 
   * @returns 
   */
  deleteMedia = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const mediaToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (mediaToDelete.deletedCount != 1) {
        throw new ReplyError("Failed to delete media", 400);
      }
      return reply.code(200).send({ data: "deleted successfuly", success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get a media by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getMediaById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const media = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!media) {
        throw new ReplyError("Failed to get media", 400);
      }

      return reply.code(200).send({ data: media, success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all media
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllMedia = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allMedia = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ data: allMedia, success: true })
    } catch (error) {
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}