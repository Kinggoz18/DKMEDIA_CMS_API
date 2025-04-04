import IRoute from "../interfaces/IRoute";
import { FastifyBaseLogger, FastifyInstance, RouteOptions } from "fastify";
import { mongodb } from "@fastify/mongodb";
import { IncomingMessage, Server, ServerResponse } from "http";
import { IReply, IReplyType } from "../interfaces/IReply";
import { RequestQueryValidation, RequestQueryValidationType } from "../types/RequestQuery.type";
import { AddArticleValidationSchema, AddArticleValidationType } from "../types/article.type";
import { ArticleDocument } from "../schema/article";
import { ArticleService } from "../services/article.service";

export class ArticleRoute implements IRoute<ArticleDocument> {
  service: ArticleService;
  server: FastifyInstance;
  collection: mongodb.Collection<ArticleDocument>;
  logger: FastifyBaseLogger;
  basePath: string = '/articles';

  constructor(server: FastifyInstance, database: mongodb.Db, logger: FastifyBaseLogger) {
    this.server = server;
    this.collection = database.collection<ArticleDocument>('articles');
    this.service = new ArticleService(this.collection, logger);
    this.logger = logger

    if (!this.server) {
      console.error("Error: Failed to load server")
      this.logger.error("Failed to load server");
      return;
    }

    if (!this.collection) {
      console.error("Error: Failed to load articles collection")
      this.logger.error("Failed to load articles collection");
      return;
    }

    if (!this.service) {
      console.error("Error: Failed to load articles service")
      this.logger.error("Failed to load articles service");
      return;
    }
  }

  async initRoutes() {
    try {
      /******************************************* Route Declarations *******************************************/
      const addAtricleRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Body: AddArticleValidationType, Reply: IReplyType }> = {
        method: 'POST',
        url: '/',
        schema: {
          body: AddArticleValidationSchema,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.addArticle(request, reply)
      }

      const deleteArticleRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'DELETE',
        url: '/:id',
        schema: {
          params: RequestQueryValidation,
          response: IReply.$schema,
        },
        handler: (request, reply) => this.service.deleteArticle(request, reply)
      }

      const getAllArticleRoute: RouteOptions<Server, IncomingMessage, ServerResponse> = {
        method: 'GET',
        url: '/',
        handler: (request, reply) => this.service.getAllArticle(request, reply)
      }

      const getArticleByIdRoute: RouteOptions<Server, IncomingMessage, ServerResponse, { Params: RequestQueryValidationType, Reply: IReplyType }> = {
        method: 'GET',
        url: '/:id',
        handler: (request, reply) => this.service.getArticleById(request, reply)
      }

      /******************************************* Register Routes *******************************************/
      await this.server.register(function (app, _, done) {
        app.route(addAtricleRoute)
        app.route(deleteArticleRoute)
        app.route(getAllArticleRoute)
        app.route(getArticleByIdRoute)

        done()
      }, { prefix: this.basePath })
    } catch (error: any) {
      console.error({ error })
      this.logger.error({ error });
      return;
    }
  }
}