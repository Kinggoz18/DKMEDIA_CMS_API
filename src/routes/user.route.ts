import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { UserService } from "../services/user.service";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { AuthSessionDocument, UserDocument } from "../schema/user";
import IRoute from "../interfaces/IRoute";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { AuthRequestQueryValidationType } from "../types/AuthRequestQuery.type";
import fastifyPassport from '@fastify/passport';
import { AuthenticateOptions } from "passport";

/**
 * Auth route class. Used to create and register auth routes
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
    const authSessionCollection = database.collection<AuthSessionDocument>('authSession');
    this.service = new UserService(this.collection, logger, authSessionCollection);

    if (!this.server) {
      console.error("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.error("Error: Failed to load auth collection")
      this.logger.error("Failed to load auth collection");
      return;
    }

    if (!this.service) {
      console.error("Error: Failed to load auth service")
      this.logger.error("Failed to load auth service");
      return;
    }
  }

  async initRoutes() {

    try {
      /******************************************* Route Declarations *******************************************/
      const getUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType; Reply: IReplyType }> = {
        method: 'GET',
        url: `/:id`,
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema
        },
        handler: (request, reply) => this.service.getUser(request, reply)
      }

      const logoutUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: `/`,
        handler: (request, reply) => this.service.logoutUser(request, reply)
      }

      const loginUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Querystring: AuthRequestQueryValidationType }> = {
        method: 'GET',
        url: `/google/callback`,
        config: {
          rateLimit: {
            max: 10, //5 login attempts
            timeWindow: 5 * 1000 * 60 //5 minutes 
          }
        },
        preValidation: (request, reply) => {
          const { id, mode } = request.query;
          const googleAuthOptions = {
            scope: [
              "https://www.googleapis.com/auth/userinfo.profile",
              "https://www.googleapis.com/auth/userinfo.email",
            ],
            state: JSON.stringify({ mode: request.query.mode, id: request.query.id }),
            prompt: "select_account", // Add prompt here
          } as AuthenticateOptions & { prompt: string }; // Type assertion

          if (mode === "signup" && id) {
            // Encrypt the signupCode before sending it in the state
            return fastifyPassport.authenticate("google", googleAuthOptions).call(this.server, request, reply); // Use `.call(fastify, request, reply)` to ensure the correct context
          } else {
            return fastifyPassport.authenticate("google", googleAuthOptions).call(this.server, request, reply); // Use `.call(fastify, request, reply)` to ensure the correct context
          }


        },
        handler: (request, reply) => this.service.googleAuthHandler(request, reply)
      }

      const deleteUserRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'DELETE',
        url: '/',
        handler: (request, reply) => this.service.deleteUser(request, reply)
      }

      const authenticateSignupCodeRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: { code: string }; Reply: IReplyType }> = {
        method: 'POST',
        config: {
          rateLimit: {
            max: 5, //5 login attempts
            timeWindow: 5 * 1000 * 60 //5 minutes 
          }
        },
        url: `/authenticate-code`,
        handler: (request, reply) => this.service.authenticateSignupCode(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(logoutUserRoute)
        app.route(loginUserRoute)
        app.route(getUserRoute)
        app.route(deleteUserRoute)
        app.route(authenticateSignupCodeRoute)
        done()
      }, { prefix: this.basePath })

    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }

  }
}