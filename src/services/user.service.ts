import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { IReplyType } from "../interfaces/IReply";
import IService from "../interfaces/IService";
import { AuthSession, AuthSessionDocument, AuthSessionModel, UserDocument, UserModel } from "../schema/user";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import dotenv from 'dotenv';
import { AuthCallbackValidationType } from "../types/userAuth";
import { ReplyError } from "../interfaces/ReplyError";
import { createHmac } from 'crypto'

dotenv.config();
const CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL ?? "";
const SIGNUP_SECRET = process.env.SIGNUP_SECRET ?? "";
const SIGNUP_CODE_HASHED = process.env.SIGNUP_CODE_HASHED ?? "";

export class UserService implements IService<UserDocument> {
  dbModel = UserModel;
  dbCollection: mongodb.Collection<UserDocument>;
  logger: FastifyBaseLogger;
  private authSessionCollection: mongodb.Collection<AuthSessionDocument>;

  constructor(dbCollection: mongodb.Collection<UserDocument>, logger: FastifyBaseLogger, authSessionCollection: mongodb.Collection<AuthSessionDocument>) {
    this.dbCollection = dbCollection;
    this.authSessionCollection = authSessionCollection;
    this.logger = logger;

    if (!dbCollection) throw new Error("Failed to load user collection");
  }

  googleAuthHandler = (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log("googleAuth");
      const { userId, mode, erroMessage } = request.user as AuthCallbackValidationType;
      console.log({ userId, mode });
      if (userId) {
        return reply.redirect(`${CRM_FRONTEND_URL}/auth?authId=${userId}`);
      } else {
        return reply.redirect(`${CRM_FRONTEND_URL}/auth?errorMsg="${erroMessage}"`);
      }

    } catch (error) {
      console.log("Error while saving user", error);

    }
  };

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return 'delete user route'
  }

  getUser = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    const { id } = request.params;
    try {
      const { id } = request.params;
      const user = await this.dbCollection.findOne({ authId: id });

      if (!user) {
        throw new ReplyError("Failed to get user", 400);
      }

      return reply.code(200).send({ data: user, success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  authenticateSignupCode = async (request: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { code } = request.body;
      if (!code || SIGNUP_SECRET === "") {
        throw new ReplyError("Signup code is missing", 400);
      }

      //Veirfy the code
      const hashedCode = this.createHash(code, SIGNUP_SECRET);
      console.log({ hashedCode });

      if (hashedCode != SIGNUP_CODE_HASHED) {
        throw new ReplyError("Unathorized access", 400);
      }

      //Create the auth session
      const currentDate = new Date();  // Get the current date and time
      const expires = new Date(currentDate.getTime() + 5 * 60 * 1000);  // Add 5 minutes

      const newAuthSession = new AuthSessionModel({
        expires: expires,
      });

      await this.authSessionCollection.insertOne(newAuthSession)
      return reply.code(200).send({ data: newAuthSession._id.toString(), success: true })
    } catch (error) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  private createHash(code: string, secretKey: string) {
    return createHmac("sha256", secretKey)
      .update(code)
      .digest("hex");
  }
}