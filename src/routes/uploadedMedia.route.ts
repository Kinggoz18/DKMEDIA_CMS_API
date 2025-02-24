import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { UploadedMediaService } from "../services/uploadedMedia.service";
import { UploadedMediaDocument, UploadedMediaMongooseSchema } from "../schema/uploadedMedia";
import { UploadedMediaValidationType } from "../types/uploadedMedia.type";

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

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UploadedMediaValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: UploadedMediaMongooseSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => { }
      }

      const deleteMedia: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => { }
      }

      const getAllMediaRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => { }
      }

      const getMediaByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => { }
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
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