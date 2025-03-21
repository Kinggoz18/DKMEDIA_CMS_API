import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { AboutUsDocument } from "../schema/aboutUs";
import { AboutUsService } from "../services/aboutUs.service";
import { AddAboutUsValidation, AddAboutUsValidationType } from "../types/aboutUs.type";
import { RequestQueryValidationType } from "../types/RequestQuery.type";

export class AboutUsRoute implements IRoute<AboutUsDocument> {
  service: AboutUsService;
  server: FastifyInstance;
  collection: mongodb.Collection<AboutUsDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/about-us';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<AboutUsDocument>('about');
    this.service = new AboutUsService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load about us collection")
      this.logger.error("Failed to load about us collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load about us service")
      this.logger.error("Failed to load about us service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Update about us section route
       */
      const updateAboutUsRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddAboutUsValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddAboutUsValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.updateAboutUs(request, reply)
      }

      /**
       * Delete about us section route
       */
      const deleteAboutUsRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/',
        schema: {
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteAboutUs(request, reply)
      }

      /**
       * Get about us section route
       */
      const getAboutUs: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAboutUs(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(updateAboutUsRoute)
        app.route(deleteAboutUsRoute)
        app.route(getAboutUs);

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}