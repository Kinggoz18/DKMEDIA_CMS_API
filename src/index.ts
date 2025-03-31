import fastify, { FastifyInstance } from 'fastify'
import { mongodb } from '@fastify/mongodb';
import fastifyMongodb from '@fastify/mongodb';
import { initAppRoutes } from './routes/routes';
import fastifySecureSession from '@fastify/secure-session'
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';

import cors from '@fastify/cors'
import fs from 'fs';

import dotenv from 'dotenv';
import path from 'node:path';
import { PassportConfig } from './config/passport';

dotenv.config();
const server: FastifyInstance = fastify({ logger: true });
const MONGODB_URL = process.env.MONGODB_URL ?? "";
const BASE_PATH = process.env.BASE_PATH ?? "";
const DATABASE_NAME = process.env.DATABASE_NAME ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "";
const CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL ?? "";

// ****************************************************** END OF TESTS ****************************************************** //
//TODO: Configure server logs propely
const connectToDatabase = async () => {
  try {
    if (MONGODB_URL === "" || !MONGODB_URL) throw new Error("MongoDb URL is undefined");

    const client = await mongodb.MongoClient.connect(MONGODB_URL);
    if (!client) throw new Error("Something went wrong while trying to connect to Mongodb");

    // Add mongodb plugin
    await server.register(fastifyMongodb, {
      forceClose: true,
      client: client
    });

    return server
  } catch (error: any) {
    console.log("An error occured trying to connect to mongodb");
    throw new Error(error?.message);
  }
}

export const startServer = async (server: FastifyInstance) => {
  try {
    if (BASE_PATH === "" || !BASE_PATH) throw new Error("Base path url is undefined");
    if (DATABASE_NAME === "" || !DATABASE_NAME) throw new Error("database name is undefined");

    const database = server.mongo.client.db(DATABASE_NAME);
    if (!database) throw new Error("Failed to load database");

    //Set up cors
    await server.register(cors, {
      origin: [FRONTEND_URL, CRM_FRONTEND_URL],
      methods: ['GET', 'POST', 'DELETE', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    })

    //Set up multipart for file processing
    await server.register(fastifyMultipart, {
      limits: {
        fileSize: 90 * 1024 * 1024, // 90MB file size limit
      },
    });

    //Set up secure session 
    // set up secure sessions for @fastify/passport to store data in
    server.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key')) })

    //Set up passport
    PassportConfig(server, database)

    //Set up rate limiting
    await server.register(fastifyRateLimit, {
      global: false,
      max: 200,
      timeWindow: 5 * 1000 * 60 //5 minutes 
    })

    // Register routes
    await server.register((app, _, done) => initAppRoutes(app, database, done), {
      root: path.join(__dirname, 'public'),
      prefix: BASE_PATH,
    })

    return server;
  } catch (error: any) {
    console.log({ error })
    throw new Error(error.message)
  }
}

connectToDatabase() //Start the database
  .then((server) => startServer(server))  //Prepare the server
  .then((server) => { //Start listening
    server.listen({ port: 4000 }, (err, address) => {
      if (err) {
        console.log(err)
        process.exit(1);
      }
      console.log(`Server listening at ${address}`)
    })
  });


