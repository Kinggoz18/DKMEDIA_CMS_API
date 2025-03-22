import { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import IService from "../interfaces/IService";
import { IReplyType } from "../interfaces/IReply";
import { EventDocument, EventModel } from "../schema/events";
import { AddEventValidationType, UpdateEventValidationType } from "../types/event.type";
import { mongodb, ObjectId } from "@fastify/mongodb";
import { ReplyError } from "../interfaces/ReplyError";
import { RequestQueryValidationType } from "../types/RequestQuery.type";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import dotenv from 'dotenv';
import { pipeline } from "stream/promises";

dotenv.config();
export class EventService implements IService<EventDocument> {
  dbModel = EventModel;
  dbCollection: mongodb.Collection<EventDocument>;
  logger: FastifyBaseLogger;
  cloudName = process.env.CLOUDINARY_NAME
  cloudSecrete = process.env.CLOUDINARY_SECRETE
  cloudKey = process.env.CLOUDINARY_KEY

  constructor(dbCollection: mongodb.Collection<EventDocument>, logger: FastifyBaseLogger) {
    this.dbCollection = dbCollection;
    this.logger = logger;

    if (!dbCollection) {
      logger.error("Failed to load event collection")
      return;
    }

    if (!this.cloudName) {
      throw new Error("Cloudinary cloud name evn is missing");
    }

    if (!this.cloudSecrete) {
      throw new Error("Cloudinary cloud secrete evn is missing");
    }

    if (!this.cloudKey) {
      throw new Error("Cloudinary cloud key evn is missing");
    }

    //Configure cloudinary
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.cloudKey,
      api_secret: this.cloudSecrete
    });
  }

  /**
   * Post an event to the database
   * TODO: Add a check limit for 3 Hightlights before creating a new event ones
   * @param request 
   * @param reply 
   * @returns 
   */
  addEvent = async (request: FastifyRequest<{ Body: AddEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        title,
        date,
        image,
        priority,
        organizer,
      } = request.body;

      //MongoDb Validation step
      const newEvent = new this.dbModel({
        title,
        date,
        image,
        priority,
        organizer,
      })
      await newEvent.validate();

      //Save the data to mongodb
      const saveEvent = await this.dbCollection.insertOne(newEvent);
      const getSavedEvent = await this.dbCollection.findOne({ _id: saveEvent?.insertedId });

      if (!getSavedEvent) {
        this.logger.error('Failed to add event')
        throw new ReplyError('Failed to add event', 400);
      }

      return reply.code(201).send({ data: getSavedEvent, success: true });
    } catch (error: any) {
      console.log({ error })
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Delete an event from the database
   * @param request 
   * @param reply 
   */
  deleteEvent = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      console.log({ id })
      //Check if the event exists
      const eventExists = await this.dbCollection.findOne({ _id: new ObjectId(id) })
      if (!eventExists?._id) throw new ReplyError("Event does not exists", 404);

      console.log({ eventExists })
      //Delete the event
      const deleteResult = await this.dbCollection.deleteOne({ _id: new ObjectId(id) });
      if (!deleteResult.acknowledged) throw new ReplyError("Failed to delete devent", 400);

      console.log({ deleteResult })
      return reply.code(200).send({ success: deleteResult.acknowledged, data: "event deleted" })
    } catch (error: any) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get all events
   * @param request 
   * @param reply 
   * @returns 
   */
  getAllEvents = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const allEvents = await this.dbCollection.find({}).toArray();
      return reply.code(200).send({ success: true, data: allEvents })
    } catch (error) {
      console.log({ error })
      reply.code(400).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Get an event by id
   * @param request 
   * @param reply 
   * @returns 
   */
  getEventById = async (request: FastifyRequest<{ Params: RequestQueryValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const { id } = request.params;
      console.log({ id })
      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });
      console.log({ event })

      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      return reply.status(200).send({ success: true, data: event })
    } catch (error: any) {
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }

  /**
   * Update an event id
   * @param request 
   * @param reply 
   * @returns 
   */
  updateEventById = async (request: FastifyRequest<{ Body: UpdateEventValidationType }>, reply: FastifyReply<{ Reply: IReplyType }>) => {
    try {
      const {
        id,
        title,
        date,
        image,
        priority,
        organizer, } = request.body;

      const event = await this.dbCollection.findOne({ _id: new ObjectId(id) });
      if (!event?._id) throw new ReplyError("Event does not exist", 404);

      const updateResult = await this.dbCollection.updateOne({ _id: event?._id }, {
        $set: {
          title: title ?? event.title,
          date: date ?? event.date,
          image: image ?? event.image,
          priority: priority ?? event.priority,
          organizer: organizer ?? event.organizer,
        }
      });

      if (!updateResult.acknowledged) {
        throw new ReplyError("Failed to update event", 400);
      }

      const updatedEvent = await this.dbCollection.findOne({ _id: event?._id });

      if (!updatedEvent) {
        throw new ReplyError("Failed to get updated event", 404);
      }

      console.log({ Updated: updatedEvent })
      return reply.status(200).send({ success: true, data: updatedEvent })
    } catch (error: any) {
      console.log({ error })
      if (error instanceof ReplyError)
        return reply.status(error.code).send({ success: false, data: error.message });
      else return reply.status(500).send({ success: false, data: "Sorry, something went wrong" })
    }
  }


  /**
 * Handle uploads for images
 */
  uploadCloudinaryImage = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ success: false, data: 'No file uploaded' });
    }

    try {
      // Create a Cloudinary upload stream wrapped in a Promise
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: "DKMedia_Test_image" },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject("Something went wrong, while uploading video to cloudinary");
            resolve(result);
          }
        );

        // Pipe file stream directly to Cloudinary's upload stream
        data.file.pipe(uploadStream);

        // Handle errors in file stream
        data.file.on('error', (err) => {
          reject(err);
        });

        uploadStream.on('error', (err) => {
          reject(err);
        });
      });

      return reply.code(200).send({ success: true, data: result?.secure_url });
    } catch (error: any) {
      console.error('Cloudinary Image Upload Error:', error);
      return reply.status(500).send({ success: false, data: "Cloudinary image upload failed" })
    }
  }

  /**
   * Handle uploads for videos
   */
  uploadCloudinaryVideo = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ success: false, data: 'No file uploaded' });
    }

    try {
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: "DKMedia_Test_video",
            transformation: [
              { format: "mp4" }  // Convert to MP4
            ]
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject("Something went wrong, while uploading video to cloudinary");
            resolve(result);
          }
        );

        pipeline(data.file, uploadStream).then(() => {
          uploadStream.end()
        }).catch(reject);
      });

      return reply.code(200).send({ success: true, data: result?.secure_url });
    } catch (error: any) {
      console.error('Cloudinary video Upload Error:', error);
      return reply.status(500).send({ success: false, data: "Cloudinary video upload failed" })
    }
  }

}