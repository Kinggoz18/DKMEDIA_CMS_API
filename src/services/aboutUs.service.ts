import { mongodb } from "@fastify/mongodb";
import { AboutUsDocument, AboutUsModel } from "../schema/aboutUs";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { IReplyType } from "../interfaces/IReply";
import { AddAboutUsValidationType } from "../types/aboutUs.type";
import { ReplyError } from "../interfaces/ReplyError";

export class AboutUsService implements IService<AboutUsDocument> {
  dbModel = AboutUsModel;
  dbCollection: mongodb.Collection<AboutUsDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<AboutUsDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  /**
   * Add/Update about us section
   * @param request 
   * @param reply 
   */
  updateAboutUs = async (request: FastifyRequest<{ Body: AddAboutUsValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        title,
        paragraphs,
      } = request.body;

      //Validate the request 
      const aboutUs = new this.dbModel({ title, paragraphs });
      await aboutUs.validate();

      const currentAboutUs = await this.dbCollection.findOne({});

      //If there is no about us
      if (!currentAboutUs) {
        const updateAboutUs = await this.dbCollection.insertOne(aboutUs);
        const getSavedAboutUs = await this.dbCollection.findOne({ _id: updateAboutUs?.insertedId });

        if (!getSavedAboutUs) {
          this.logger.error('Failed to save about us')
          throw new ReplyError("Failed to save about us", 400);
        }

        return reply.code(200).send({ data: getSavedAboutUs, success: updateAboutUs.acknowledged })
      } else {
        //Update the values
        const updatedTitle = title === "" ? currentAboutUs.title : title;
        const updatedParagraphs = paragraphs?.length == 0 ? currentAboutUs.paragraphs : paragraphs;

        const newUpdate = new this.dbModel({ title: updatedTitle, paragraphs: updatedParagraphs })
        await newUpdate.validate();

        // Insert the new update
        const updateAboutUs = await this.dbCollection.insertOne(newUpdate);
        const getSavedAboutUs = await this.dbCollection.findOne({ _id: updateAboutUs?.insertedId });

        if (!getSavedAboutUs) {
          this.logger.error('Failed to update about us')
          throw new ReplyError("Failed to update about us", 400);
        }

        return reply.code(200).send({ data: getSavedAboutUs, success: updateAboutUs.acknowledged })
      }

    } catch (error: any) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get about us section
   */
  getAboutUs = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const aboutUsSection = await this.dbCollection.findOne({});
      return reply.code(200).send({ data: aboutUsSection, success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete about us section
   */
  deleteAboutUs = async (requst: FastifyRequest, reply: FastifyReply) => {
    try {
      const deleteAboutUs = await this.dbCollection.deleteOne({});
      if (deleteAboutUs.deletedCount != 1) throw new ReplyError("Nothing to delete", 404);
      return reply.code(200).send({ data: "Deleted about us", success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}