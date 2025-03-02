import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { UserService } from "../services/user.service";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { UserDocument } from "../schema/user";
import IRoute from "../interfaces/IRoute";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { AuthRequestQueryValidationType } from "../types/AuthRequestQuery.type";

/**
 * Auth route class. Used to create and register auth routes
 * TODO: Complete user route
 */
export class UserRoute implements IRoute<UserDocument> {
  service: UserService;
  server: FastifyInstance;
  collection: mongodb.Collection<UserDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/auth';

  /**
   * Creates auth route instance
   * @param server The fastify server
   * @param database The MongoDb database
   */
  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {

    this.server = server;
    this.logger = logger;
    this.collection = database.collection<UserDocument>('auth');
    this.service = new UserService(this.collection, logger);

    if (!this.server) {
      console.log("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.log("Error: Failed to load auth collection")
      this.logger.error("Failed to load auth collection");
      return;
    }

    if (!this.service) {
      console.log("Error: Failed to load auth service")
      this.logger.error("Failed to load auth service");
      return;
    }
  }

  initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      //TODO: Create schemas for all these and complete the service logic if needed
      const getUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType; Reply: IReplyType }> = {
        method: 'GET',
        url: `/:id`,
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema
        },
        handler: (request, reply) => this.service.getUser(request, reply)
      }

      const loginUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse, {Body: AuthRequestQueryValidationType}> = {
        method: 'POST',
        url: `/`,
        handler: (request, reply) => this.service.googleAuthHandler(request, reply)
      }

      const registerUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'POST',
        url: '/google/callback',
        handler: (request, reply) => this.service.googleAuthHandlerCallback(request, reply)
      }

      const deleteUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'DELETE',
        url: '/',
        handler: (request, reply) => this.service.deleteUser(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      this.server.register(function (app, _, done) {
        app.route(registerUserRoute)
        app.route(loginUserRoute)
        app.route(getUserRoute)
        app.route(deleteUserRoute)
        done()
      }, { prefix: this.basePath })

    } catch (error: any) {
      console.log({ error })
      this.logger.error({ error });
      return;
    }

  }
}