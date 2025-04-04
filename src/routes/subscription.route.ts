import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { AddSubscriptionValidationSchema, AddSubscriptionValidationType } from "../types/subscription.type";
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
      console.error("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.error("Error: Failed to load subscription collection")
      this.logger.error("Failed to load subscription collection");
      return;
    }

    if (!this.service) {
      console.error("Error: Failed to load subscription service")
      this.logger.error("Failed to load subscription service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Add subscription route
       */
      const addSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddSubscriptionValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        config: {
          rateLimit: {
            max: 2, //2 Subscription attempt per every 1 hour
            timeWindow: 60 * 1000 * 60 //1 hour
          }
        },
        schema: {
          body: AddSubscriptionValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addSubscription(request, reply)
      }

      /**
       * Delete subscription route
       */
      const deleteSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteSubscription(request, reply)
      }

      /**
       * Get all subscription route
       */
      const getAllSubscriptionRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllSubscription(request, reply)
      }

      /**
      * Get subscription route
      */
      const getSubscriptionByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getSubscription(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addSubscriptionRoute)
        app.route(deleteSubscriptionRoute)
        app.route(getAllSubscriptionRoute)
        app.route(getSubscriptionByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}