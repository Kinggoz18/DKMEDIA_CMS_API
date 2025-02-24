import IRoute from "../interfaces/IRoute";
import { EventDocument } from "../schema/events";
import { EventService } from "../services/events.service";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AddEventValidationSchema, AddEventValidationType, UpdateEventValidationSchema, UpdateEventValidationType } from "../types/event.type";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";

export class EventRoute implements IRoute<EventDocument> {
  service: EventService;
  server: FastifyInstance;
  collection: mongodb.Collection<EventDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/events';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<EventDocument>('event');
    this.service = new EventService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load event collection")
      this.logger.error("Failed to load event collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load event service")
      this.logger.error("Failed to load event service");
      return;
    }
  }

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addEventRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddEventValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddEventValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addEvent(request, reply)
      }

      const deleteEventRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteEvent(request, reply)
      }

      const getAllEventsRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllEvents(request, reply)
      }

      const getEventByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getEventById(request, reply)
      }

      const updateEventByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UpdateEventValidationType, Reply: IReplyType }> = {
        method: 'PUT',
        url: '/',
        schema: {
          body: UpdateEventValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.updateEventById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
        app.route(addEventRoute)
        app.route(deleteEventRoute)
        app.route(getEventByIdRoute)
        app.route(getAllEventsRoute)
        app.route(updateEventByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}