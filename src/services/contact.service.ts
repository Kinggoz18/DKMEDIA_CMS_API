import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { ContactUsValidationType } from "../types/contactUs.type";
import { IReplyType } from "../interfaces/IReply";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { ContactUsDocument, ContactUsModel } from "../schema/contactUs";

export class ContactService implements IService<ContactUsDocument> {
  dbModel = ContactUsModel;
  dbCollection: mongodb.Collection<ContactUsDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<ContactUsDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  addContact = async (request: FastifyRequest<{ Body: ContactUsValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  deleteContact = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getContactById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  getAllContact = async (request: FastifyRequest, reply: FastifyReply) => {
  }
}