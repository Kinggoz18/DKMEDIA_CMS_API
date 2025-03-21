import { mongodb, ObjectId } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { IReplyType } from "../interfaces/IReply";
import IService from "../interfaces/IService";
import { UserDocument, UserModel } from "../schema/user";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { AuthRequestQueryValidationType, PassportRequestQueryValidationType } from "../types/AuthRequestQuery.type";
import dotenv from 'dotenv';
import { AuthCallbackValidationType } from "../types/userAuth";
import { ReplyError } from "../interfaces/ReplyError";
dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "";

//TODO: Complete user service
export class UserService implements IService<UserDocument> {
  dbModel = UserModel;
  dbCollection: mongodb.Collection<UserDocument>;
  logger: FastifyBaseLogger;

  constructor(dbCollection: mongodb.Collection<UserDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) throw new Error("Failed to load user collection");
  }

  googleAuthHandler = (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log("googleSignUp");
      const { userId, mode, erroMessage } = request.user as AuthCallbackValidationType;
      console.log({ userId, mode });
      if (userId) {
        return reply.redirect(`${FRONTEND_URL}/login?authId=${userId}`);
      } else {
        return reply.redirect(`${FRONTEND_URL}/login?errorMsg="${erroMessage}"`);
      }

    } catch (error) {
      console.log("Error while saving user", error);

    }
  };

  // googleAuthHandlerCallback = async (request: FastifyRequest, reply: FastifyReply) => {
  //   console.log("googleSignUpCallback");
  //   try {
  //     passport.authenticate("google", async (err: any, user: any, info: any) => {
  //       const { userData, mode } = user;

  //       if (err) {
  //         console.error("Error during Google authentication callback", err);
  //       }

  //       if (!userData) {
  //         console.error("Error during Google authentication callback", err);

  //         if (mode === "login") {
  //           reply.code(400).send({ success: false, data: "Failed to login user" })
  //         } else {
  //           reply.code(400).send({ success: false, data: "Failed to signup user" })
  //         }
  //       }

  //       // Redirect to the frontend on success status
  //       reply.code(200).send({ success: true, data: userData })
  //     })(request, reply);
  //   } catch (error) {
  //     console.error(error)
  //     reply.code(200).send({ success: true, data: error })
  //   }
  // }

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
}