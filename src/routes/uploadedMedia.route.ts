import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { UploadedMediaService } from "../services/uploadedMedia.service";
import { UploadedMediaDocument } from "../schema/uploadedMedia";
import { UploadedMediaValidation, UploadedMediaValidationType } from "../types/uploadedMedia.type";

export class UploadMediaRoute implements IRoute<UploadedMediaDocument> {
  service: UploadedMediaService;
  server: FastifyInstance;
  collection: mongodb.Collection<UploadedMediaDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/upload-media';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<UploadedMediaDocument>('uploaded_media');
    this.service = new UploadedMediaService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load uploaded media collection")
      this.logger.error("Failed to load uploaded media collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load uploaded media service")
      this.logger.error("Failed to load uploaded media service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      /**
       * Add a media route
       */
      const addMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UploadedMediaValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: UploadedMediaValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addMedia(request, reply)
      }

      /**
       * Delete a media route
       */
      const deleteMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteMedia(request, reply)
      }

      /**
       * Get all Media route
       */
      const getAllMediaRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllMedia(request, reply)
      }

      /**
       * Get a media by id route
       */
      const getMediaByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getMediaById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addMedia)
        app.route(deleteMedia)
        app.route(getAllMediaRoute)
        app.route(getMediaByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}