import fastify, { FastifyInstance } from 'fastify'
import { mongodb } from '@fastify/mongodb';
import dotenv from 'dotenv';
import fastifyMongodb from '@fastify/mongodb';
import path from 'node:path';
import { initAppRoutes } from './routes/routes';

dotenv.config();
const server: FastifyInstance = fastify({ logger: true });
const MONGODB_URL = process.env.MONGODB_URL ?? "";
const BASE_PATH = process.env.BASE_PATH ?? "";
const DATABASE_NAME = process.env.DATABASE_NAME ?? "";

// ****************************************************** END OF TESTS ****************************************************** //

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

    // Register routes
    await server.register((app, _, done) => initAppRoutes(app, database, done), {
      root: path.join(__dirname, 'public'),
      prefix: BASE_PATH,
    })

    return server;
  } catch (error: any) {
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


