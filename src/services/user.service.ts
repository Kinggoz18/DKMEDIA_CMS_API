import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { IReplyType } from "../interfaces/IReply";
import IService from "../interfaces/IService";
import { UserDocument, UserModel } from "../schema/user";
import { RequestQueryValidationType } from "../types/RequestQuery.type";

export class UserService implements IService<UserDocument> {
  dbModel = UserModel;
  dbCollection: mongodb.Collection<UserDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<UserDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) throw new Error("Failed to load user collection");
  }

  registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(`Signup user route`)
  }

  loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(`Login user route`)
  }

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return 'delete user route'
  }

  getUser = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    const { id } = request.params;
    return reply.code(200).send({ success: true, data: `get user route ${id}` })
  }
}