import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { OrganizerService } from "../services/organizer.service";
import { OrganizerDocument } from "../schema/organizer";
import { OrganizerValidationSchema, OrganizerValidationType } from "../types/organizer.type";

export class OrganizerRoute implements IRoute<OrganizerDocument> {
  service: OrganizerService;
  server: FastifyInstance;
  collection: mongodb.Collection<OrganizerDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/organizers';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<OrganizerDocument>('organizer');
    this.service = new OrganizerService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load organizer collection")
      this.logger.error("Failed to load organizer collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load organizer service")
      this.logger.error("Failed to load organizer service");
      return;
    }
  }

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addOrganizerRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: OrganizerValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: OrganizerValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addOrganizer(request, reply)
      }

      const deleteOrganizerRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteOrganizer(request, reply)
      }

      const getAllOrganizersRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllOrganizer(request, reply)
      }

      const getOrganizerByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getOrganizerById(request, reply)
      }

      const updateOrganizerByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: OrganizerValidationType, Reply: IReplyType }> = {
        method: 'PUT',
        url: '/',
        schema: {
          body: OrganizerValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.updateOrganizer(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
        app.route(addOrganizerRoute)
        app.route(deleteOrganizerRoute)
        app.route(getOrganizerByIdRoute)
        app.route(getAllOrganizersRoute)
        app.route(updateOrganizerByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}