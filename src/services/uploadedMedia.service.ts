import { mongodb } from "@fastify/mongodb";
import IService from "../interfaces/IService";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { IReplyType } from "../interfaces/IReply";
import { UploadedMediaDocument, UploadedMediaModel } from "../schema/uploadedMedia";
import { UploadedMediaValidationType } from "../types/uploadedMedia.type";

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

  addOrganizer = async (request: FastifyRequest<{ Body: UploadedMediaValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  deleteOrganizer = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getOrganizerById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getAllOrganizer = async (request: FastifyRequest, reply: FastifyReply) => {
  }
}