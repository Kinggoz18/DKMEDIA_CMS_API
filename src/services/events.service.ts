import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { IReplyType } from "../interfaces/IReply";
import { EventDocument, EventModel } from "../schema/events";
import { AddEventValidationType, UpdateEventValidationType } from "../types/event.type";
import { mongodb, ObjectId } from "@fastify/mongodb";
import { ReplyError } from "../interfaces/ReplyError";
import { RequestQueryValidationType } from "../types/RequestQuery.type";

export class EventService implements IService<EventDocument> {
  dbModel = EventModel;
  dbCollection: mongodb.Collection<EventDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<EventDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  /**
   * Post an event to the database
   * @param request 
   * @param reply 
   * @returns 
   */
  addEvent = async (request: FastifyRequest<{ Body: AddEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        title,
        date,
        image,
        priority,
        organizer,
      } = request.body;

      //MongoDb Validation step
      const newEvent = new this.dbModel({
        title,
        date,
        image,
        priority,
        organizer,
      })
      await newEvent.validate();

      //Save the data to mongodb
      const saveEvent = await this.dbCollection.insertOne(newEvent);
      const getSavedEvent = await this.dbCollection.findOne({ _id: saveEvent?.insertedId });

      if (!getSavedEvent) {
        this.logger.error('Failed to add event')
        throw new ReplyError('Failed to add event', 400);
      }

      return reply.code(201).send({ data: getSavedEvent, success: true });
    } catch (error: any) {
      console.log({ error })
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete an event from the database
   * @param request 
   * @param reply 
   */
  deleteEvent = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      //Check if the event exists
      const eventExists = await this.dbCollection.findOne({ _id: new ObjectId(id) })
      if (!eventExists?._id) throw new ReplyError("Event does not exists", 404);

      //Delete the event
      const deleteResult = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (!deleteResult.acknowledged) throw new ReplyError("Failed to delete devent", 400);

      return reply.code(200).send({ success: deleteResult.acknowledged, data: "event deleted" })
    } catch (error: any) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all events
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllEvents = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allEvents = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ success: true, data: allEvents })
    } catch (error) {
      console.log({ error })
      reply.code(400).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get an event by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getEventById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      console.log({ id })
      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });
      console.log({ event })

      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      return reply.status(200).send({ success: true, data: event })
    } catch (error: any) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Update an event id
   * @param request 
   * @param reply 
   * @returns 
   */
  updateEventById = async (request: FastifyRequest<{ Body: UpdateEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        id,
        title,
        date,
        image,
        priority,
        organizer, } = request.body;

      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });
      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      const updateResult = await this.dbCollection.updateOne({ _id: event?._id }, {
        $set: {
          title: title ?? event.title,
          date: date ?? event.date,
          image: image ?? event.image,
          priority: priority ?? event.priority,
          organizer: organizer ?? event.organizer,
        }
      });

      if (!updateResult.acknowledged) {
        throw new ReplyError("Failed to update event", 400);
      }

      const updatedEvent = await this.dbCollection.findOne({ _id: event?._id });

      if (!updatedEvent) {
        throw new ReplyError("Failed to get updated event", 404);
      }

      console.log({ Updated: updatedEvent })
      return reply.status(200).send({ success: true, data: updatedEvent })
    } catch (error: any) {
      console.log({ error })
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}