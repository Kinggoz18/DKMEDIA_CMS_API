import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { SubscriptionValidation, SubscriptionValidationType } from "../types/subscription.type";
import { SubscriptionService } from "../services/Subscription.service";
import { SubscriptionDocument } from "../schema/subscription";

export class SubscriptionRoute implements IRoute<SubscriptionDocument> {
  service: SubscriptionService;
  server: FastifyInstance;
  collection: mongodb.Collection<SubscriptionDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/subscriptions';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<SubscriptionDocument>('subscription');
    this.service = new SubscriptionService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load subscription collection")
      this.logger.error("Failed to load subscription collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load subscription service")
      this.logger.error("Failed to load subscription service");
      return;
    }
  }

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: SubscriptionValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: SubscriptionValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => { }
      }

      const deleteSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => { }
      }

      const getAllSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => { }
      }

      const getSubscriptionByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => { }
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
        app.route(addSubscriptionRoute)
        app.route(deleteSubscriptionRoute)
        app.route(getAllSubscriptionRoute)
        app.route(getSubscriptionByIdRoute)
        
        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}