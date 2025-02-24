import { mongodb } from "@fastify/mongodb";
import IService from "../interfaces/IService";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { OrganizerDocument, OrganizerModel } from "../schema/organizer";
import { OrganizerValidationType } from "../types/organizer.type";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { IReplyType } from "../interfaces/IReply";

export class OrganizerService implements IService<OrganizerDocument> {
  dbModel = OrganizerModel;
  dbCollection: mongodb.Collection<OrganizerDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<OrganizerDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  addOrganizer = async (request: FastifyRequest<{ Body: OrganizerValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  deleteOrganizer = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getOrganizerById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  updateOrganizer = async (request: FastifyRequest<{ Body: OrganizerValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getAllOrganizer = async (request: FastifyRequest, reply: FastifyReply) => {
  }
}