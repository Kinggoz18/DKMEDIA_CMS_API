import { mongodb } from "@fastify/mongodb";
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { IReplyType } from "../interfaces/IReply";
import IService from "../interfaces/IService";
import { UserDocument, UserModel } from "../schema/user";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import passport from "passport"
import { AuthRequestQueryValidationType } from "../types/AuthRequestQuery.type";

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

  googleAuthHandler = (request: FastifyRequest<{ Body: AuthRequestQueryValidationType }>, reply: FastifyReply) => {
    try {
      console.log("googleSignUp");

      const { mode } = request.body;
      passport.authenticate("google", {
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        prompt: "consent",
        state: JSON.stringify({ mode }),
      })(request, reply);
    } catch (error) {
      console.log("Error while saving user", error);

    }
  };

  googleAuthHandlerCallback = async (request: FastifyRequest, reply: FastifyReply) => {
    console.log("googleSignUpCallback");
    try {
      passport.authenticate("google", async (err: any, user: any, info: any) => {
        const { userData, mode } = user;

        if (err) {
          console.error("Error during Google authentication callback", err);
        }

        if (!userData) {
          console.error("Error during Google authentication callback", err);

          if (mode === "login") {

          } else {

          }
        }

        // Redirect to the frontend on success status
        if (mode === "signup") {

        } else if (mode === "login") {

        } else {

        }
      })(request, reply);
    } catch (error) {

    }
  }

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return 'delete user route'
  }

  getUser = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    const { id } = request.params;
    return reply.code(200).send({ success: true, data: `get user route ${id}` })
  }
}