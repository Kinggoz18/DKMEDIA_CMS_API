import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { IReplyType } from "../interfaces/IReply";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { SubscriptionValidationType } from "../types/subscription.type";
import { SubscriptionDocument, SubscriptionModel } from "../schema/subscription";

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

  addSubscription = async (request: FastifyRequest<{ Body: SubscriptionValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }

  deleteSubscription = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
  }
}