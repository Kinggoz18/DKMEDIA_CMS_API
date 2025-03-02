import { mongodb, ObjectId } from "@fastify/mongodb";
import IService from "../interfaces/IService";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { OrganizerDocument, OrganizerModel } from "../schema/organizer";
import { AddOrganizerValidationType, UpdateOrganizerValidationType } from "../types/organizer.type";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { IReplyType } from "../interfaces/IReply";
import { ReplyError } from "../interfaces/ReplyError";

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

  /**
   * Add a new organizer
   * @param request 
   * @param reply 
   * @returns 
   */
  addOrganizer = async (request: FastifyRequest<{ Body: AddOrganizerValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { name, logo } = request.body;
      //Validate organzier
      const organizer = new this.dbModel({ name, logo });
      await organizer.validate();

      // Add the organizer
      const organizerToAdd = await this.dbCollection.insertOne(organizer);
      const newOrganizer = await this.dbCollection.findOne({ _id: organizerToAdd?.insertedId });

      if (!newOrganizer) {
        throw new ReplyError("Failed to add new organizer", 400);
      }

      return reply.code(201).send({ data: newOrganizer, success: true });
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete an organizer
   * @param request 
   * @param reply 
   * @returns 
   */
  deleteOrganizer = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const organizerToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (organizerToDelete.deletedCount != 1) {
        throw new ReplyError("Failed to delete organizer", 404);
      }
      return reply.code(200).send({ data: "deleted susccessfuly", success: true });
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get an organizer
   * @param request 
   * @param reply 
   * @returns 
   */
  getOrganizerById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const organizer = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!organizer) {
        throw new ReplyError("Organizer not found", 404);
      }

      return reply.code(200).send({ data: organizer, success: true });
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Update an organizer
   * @param request 
   * @param reply 
   * @returns 
   */
  updateOrganizer = async (request: FastifyRequest<{ Body: UpdateOrganizerValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id, name, logo } = request.body;
      //Get the old organizer to be updated
      const organizerToUpdate = await this.dbCollection.findOne({ _id: new ObjectId(id) });

      if (!organizerToUpdate) {
        throw new ReplyError("Organizer not found", 404);
      }

      // Update the neccessary fields
      const newName = name ?? organizerToUpdate.name;
      const newLogo = logo ?? organizerToUpdate.logo;

      await this.dbCollection.updateOne({ _id: organizerToUpdate._id }, {
        name: newName,
        logo: newLogo
      });

      // Return the updated document
      const updatedOrganizer = await this.dbCollection.findOne({ _id: organizerToUpdate._id });

      if (!updatedOrganizer) {
        throw new ReplyError("Updated organizer not found", 404);
      }

      return reply.code(200).send({ data: updatedOrganizer, success: true });

    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all organizers
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllOrganizer = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allOrganizer = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ data: allOrganizer, success: true })
    } catch (error) {
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}