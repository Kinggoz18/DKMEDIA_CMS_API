import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { ContactDocument } from "../schema/contact";
import { ContactService } from "../services/contact.service";
import { UpdateContactValidationSchema, UpdateContactValidationType } from "../types/contact.type";

export class ContactRoute implements IRoute<ContactDocument> {
  service: ContactService;
  server: FastifyInstance;
  collection: mongodb.Collection<ContactDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/contact';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ContactDocument>('contact');
    this.service = new ContactService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load contacts collection")
      this.logger.error("Failed to load contacts collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load contacts service")
      this.logger.error("Failed to load contacts service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: UpdateContactValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: UpdateContactValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.updateContact(request, reply)
      }

      const deleteContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/',
        schema: {
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteContact(request, reply)
      }

      const getAllContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Reply: IReplyType }> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getContact(request, reply)
      }


      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addContactRoute)
        app.route(deleteContactRoute)
        app.route(getAllContactRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}