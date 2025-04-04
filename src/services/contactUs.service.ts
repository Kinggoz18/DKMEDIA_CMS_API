import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { AddContactUsValidationType } from "../types/contactUs.type";
import { IReplyType } from "../interfaces/IReply";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { ContactUsDocument, ContactUsModel } from "../schema/contactUs";
import { ReplyError } from "../interfaces/ReplyError";

export class ContactUsService implements IService<ContactUsDocument> {
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

  /**
   * Update contact us service
   * @param request 
   * @param reply 
   */
  addContact = async (request: FastifyRequest<{ Body: AddContactUsValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        company,
        firstName,
        subject,
        lastName,
        email,
        phone,
        message,
      } = request.body;

      //Validate the request 
      const contactUs = new this.dbModel({
        company,
        firstName,
        lastName,
        subject,
        email,
        phone,
        message,
      });

      await contactUs.validate();

      // Save the user contact response
      const newContactUs = await this.dbCollection.insertOne(contactUs);
      const getNewContactUs = await this.dbCollection.findOne({ _id: newContactUs?.insertedId });

      if (!getNewContactUs) {
        this.logger.error('Failed to save contact us inquiry')
        throw new ReplyError("Failed to save contact us inquiry", 400);
      }

      //TODO: Send email here

      return reply.code(201).send({ data: getNewContactUs, success: newContactUs.acknowledged })

    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  deleteContact = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const contactUsToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (contactUsToDelete.deletedCount != 1) {
        this.logger.error('"Contact us inquiry not found')
        throw new ReplyError("Contact us inquiry not found", 404);
      }

      return reply.status(200).send({ data: "Deleted successfuly", success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  getContactInquiryById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const contactUsInquiry = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!contactUsInquiry) {
        this.logger.error('"Contact us inquiry not found')
        throw new ReplyError("Contact us inquiry not found", 404);
      }
      return reply.status(200).send({ data: contactUsInquiry, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  getAllContact = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allContactUsInquiries = await this.dbCollection.find({}).toArray();
      return reply.status(200).send({ data: allContactUsInquiries, success: true });
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}