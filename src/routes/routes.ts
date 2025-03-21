import { FastifyInstance } from "fastify"
import { UserRoute } from "./user.route"
import { mongodb } from "@fastify/mongodb";
import { EventRoute } from "./event.route";
import { UploadMediaRoute } from "./uploadedMedia.route";
import { OrganizerRoute } from "./organizer.route";
import { SubscriptionRoute } from "./subscription.route";
import { ContactUsRoute } from "./contactUs.route";
import { AboutUsRoute } from "./aboutUs.route";
import { ContactRoute } from "./contact.route";
import { ArticleRoute } from "./ArticleRoute";


export const initAppRoutes = async (server: FastifyInstance, database: mongodb.Db, done: any) => {
  try {
    const authRoute: UserRoute = new UserRoute(server, database, server.log);
    const eventRoute: EventRoute = new EventRoute(server, database, server.log);
    const aboutUsRoute: AboutUsRoute = new AboutUsRoute(server, database, server.log);
    const contactUsRoute: ContactUsRoute = new ContactUsRoute(server, database, server.log);
    const subscriptionRoute: SubscriptionRoute = new SubscriptionRoute(server, database, server.log);
    const organizerRoute: OrganizerRoute = new OrganizerRoute(server, database, server.log);
    const uploadedMediaRoute: UploadMediaRoute = new UploadMediaRoute(server, database, server.log);
    const contactRoute: ContactRoute = new ContactRoute(server, database, server.log);
    const articleRoute: ArticleRoute = new ArticleRoute(server, database, server.log);

    /***************************************************** Initialize Routes *****************************************************/
    await authRoute.initRoutes();
    await eventRoute.initRoutes();
    await aboutUsRoute.initRoutes();
    await contactUsRoute.initRoutes();
    await subscriptionRoute.initRoutes();
    await organizerRoute.initRoutes();
    await uploadedMediaRoute.initRoutes();
    await contactRoute.initRoutes();
    await articleRoute.initRoutes();

    done()
  } catch (error: any) {
    throw new Error(error.message)
  }
}