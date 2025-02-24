import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { ContactUsDocument } from "../schema/contactUs";
import { ContactService } from "../services/contact.service";
import { ContactUsValidation, ContactUsValidationType } from "../types/contactUs.type";

export class ContactsRoute implements IRoute<ContactUsDocument> {
  service: ContactService;
  server: FastifyInstance;
  collection: mongodb.Collection<ContactUsDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/contact-us';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ContactUsDocument>('contacts');
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

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: ContactUsValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: ContactUsValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addContact(request, reply)
      }

      const deleteContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteContact(request, reply)
      }

      const getAllContactRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllContact(request, reply)
      }

      const getContactByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getContactById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
        app.route(addContactRoute)
        app.route(deleteContactRoute)
        app.route(getAllContactRoute)
        app.route(getContactByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }
  }
}