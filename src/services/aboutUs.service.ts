import { mongodb } from "@fastify/mongodb";
import { AboutUsDocument, AboutUsModel } from "../schema/aboutUs";
import { FastifyBaseLogger } from "fastify";
import IService from "../interfaces/IService";

export class AboutUsService implements IService<AboutUsDocument> {
  dbModel = AboutUsModel;
  dbCollection: mongodb.Collection<AboutUsDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<AboutUsDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }
  }

}