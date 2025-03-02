import bcrypt from "bcryptjs";
import dotenv from 'dotenv'
import { FastifyInstance, FastifyRequest } from "fastify";
import passport from "passport"
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { UserDocument, UserModel } from "../schema/user";
import { mongodb } from "@fastify/mongodb";
import { AuthRequestQueryValidationType } from "../types/AuthRequestQuery.type";
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const PassportConfig = (sevrer: FastifyInstance, authCollection: mongodb.Collection<UserDocument>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRegisterCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  console.log({ googleRegisterCallbackUrl });

  //Passport google
  //Add sign-up and login logic here or at least get more information from google profile
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleSecret,
        callbackURL: googleRegisterCallbackUrl,
        passReqToCallback: true, // Pass the request to the callback to access query parameters
      },
      async function (request: FastifyRequest<{ Body: AuthRequestQueryValidationType }>, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) {
        console.log("Calling google strategy");

        try {
          const { mode, firstName, lastName, email } = request.body

          const searchUser = await authCollection.findOne({
            accountId: profile.id,
          });

          console.log({ mode });
          if (mode === "login") {
            // Handle login scenario
            if (!searchUser) {
              console.log("Google account not registered for login");
              return cb(
                null,
                { userData: false, mode },
                {
                  message: "Google account not registered",
                }
              );
            }

            console.log("Login successful");
            return cb(null, { userData: searchUser, mode }); // Return the existing user
          }

          if (mode === "signup") {
            // Handle signup scenario
            if (searchUser) {
              console.log("Google account already registered for signup");
              return cb(
                null,
                { userData: false, mode },
                {
                  message: "Google account already registered",
                }
              );
            }

            const newUser = new UserModel({
              firstName,
              lastName,
              email,
            });

            await newUser.validate();

            const addNewUser = await authCollection.insertOne(newUser);
            const getNewUser = await authCollection.findOne({ _id: addNewUser.insertedId });

            if (!getNewUser) {
              console.log("Failed to get new user");
              return cb(
                null,
                { userData: false, mode },
                {
                  message: "Failed to get new user",
                }
              );
            }

            console.log("Signup successful");
            return cb(null, { getNewUser, mode });
          }

          return cb(
            null,
            { userData: false, mode },
            { message: "Invalid mode" }
          );
        } catch (error) {
          console.log("Error in Google Passport authentication", error);
          return cb(error);
        }
      }
    )
  );

  sevrer.register(() => passport.initialize());
};

module.exports = PassportConfig;
