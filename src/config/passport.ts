import bcrypt from "bcryptjs";
import dotenv from 'dotenv'
import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyPassport from '@fastify/passport';
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { UserDocument, UserModel } from "../schema/user";
import { mongodb } from "@fastify/mongodb";
import { AuthRequestQueryValidationType, PassportRequestQueryValidationType } from "../types/AuthRequestQuery.type";
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const PassportConfig = (sevrer: FastifyInstance, database: mongodb.Db) => {
  console.log("Initalizing passport...")
  sevrer.register(fastifyPassport.initialize());
  sevrer.register(fastifyPassport.secureSession());

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRegisterCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
  const authCollection = database.collection<UserDocument>('auth')
  console.log({ googleRegisterCallbackUrl });

  //Passport google
  fastifyPassport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleSecret,
        callbackURL: googleRegisterCallbackUrl,
        passReqToCallback: true, // Pass the request to the callback to access query parameters
      },

      async function (request: FastifyRequest<{ Querystring: PassportRequestQueryValidationType }>, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) {
        console.log("Calling google strategy");

        try {
          const state = request.query.state ? JSON.parse(request.query.state) : {};
          const { mode, } = state;

          const searchUser = await authCollection.findOne({
            authId: profile.id,
          });

          console.log({ mode, profile });
          // Handle login scenario
          if (mode === "login") {
            // The user does not exist
            if (!searchUser) {
              console.log("Google account not registered for login");
              return cb(null, { userId: false, mode, erroMessage: "Google account not registered" });
            }

            console.log("Login successful");
            return cb(null, { userId: searchUser?.authId, mode });
          }

          // Handle signup scenario
          if (mode === "signup") {
            //The user already exists
            if (searchUser) {
              console.log("Google account already registered for signup");
              return cb(null, { userId: false, mode, erroMessage: "Google account already registered" });
            }

            //Create the new user
            const newUser = new UserModel({
              authId: profile?.id,
              displayName: profile?.displayName,
              email: profile.emails ? profile.emails[0].value : "",
            })

            await newUser.validate();

            authCollection.insertOne(newUser)
            return cb(null, { userId: newUser?.id, mode });
          }

          return cb(
            null,
            { userId: false, mode, erroMessage: "Invalid mode" },
          );
        } catch (error: any) {
          console.log("Error in Google Passport authentication", error);
          return cb(null, { userId: false, mode: "login", erroMessage: error.message ?? error },);
        }
      }
    )
  );

  fastifyPassport.registerUserSerializer(async (user, req) => { return user });

  fastifyPassport.registerUserDeserializer(async (user, req) => { return user });
};

export { PassportConfig };
