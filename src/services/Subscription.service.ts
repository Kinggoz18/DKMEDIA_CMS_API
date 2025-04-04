import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { IReplyType } from "../interfaces/IReply";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { AddSubscriptionValidationType } from "../types/subscription.type";
import { SubscriptionDocument, SubscriptionModel } from "../schema/subscription";
import { ReplyError } from "../interfaces/ReplyError";

export class SubscriptionService implements IService<SubscriptionDocument> {
  dbModel = SubscriptionModel;
  dbCollection: mongodb.Collection<SubscriptionDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<SubscriptionDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

  /**
   * Add a new subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  addSubscription = async (request: FastifyRequest<{ Body: AddSubscriptionValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        firstName,
        lastName,
        email,
      } = request.body;

      //Validate new subscription
      const newSubscription = new this.dbModel({
        firstName,
        lastName,
        email,
      });

      await newSubscription.validate();

      const isSubscribed = await this.dbCollection.findOne({email: email});
      if(isSubscribed) {
        request.log.error("Error: User is already subscribed to DKMEDIA newsletter")
        throw new ReplyError("Error: User is already subscribed to DKMEDIA newsletter", 400);
      }

      //Insert the new subscription
      const saveNewSubscription = await this.dbCollection.insertOne(newSubscription);
      const getNewSubscription = await this.dbCollection.findOne({ _id: saveNewSubscription?.insertedId });

      if (!getNewSubscription) {
        throw new ReplyError("Failed to save new subscription", 400);
      }

      return reply.code(201).send({ data: getNewSubscription, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete a subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  deleteSubscription = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const subscriptionToDelete = await this.dbCollection.deleteOne({ _id: new ObjectId(id) })

      if (subscriptionToDelete.deletedCount != 1) throw new ReplyError("Subscription not deleted", 404);

      return reply.code(200).send({ data: "Subscription deleted", success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get a subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  getSubscription = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      const getSubscription = await this.dbCollection.findOne({ _id: new ObjectId(id) })

      if (!getSubscription) throw new ReplyError("Subscription not found", 404);

      return reply.code(200).send({ data: getSubscription, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all subscription
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllSubscription = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allSubcriptions = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ data: allSubcriptions, success: true })
    } catch (error: any) {
      request.log.error(error?.message)
      return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }
}