import { Static, Type } from "@sinclair/typebox";
import { EventValidationSchema } from "../types/event.type";
import { UserValidationSchema } from "../types/user.type";
import { AboutUsValidationSchema } from "../types/aboutUs.type";
import { ContactUsValidationSchema } from "../types/contactUs.type";
import { SubscriptionValidationSchema } from "../types/subscription.type";
import { OrganizerValidationSchema } from "../types/organizer.type";
import { UploadedMediaValidation } from "../types/uploadedMedia.type";

/**
 * IReply object used for request replies.
 */
export const IReply = Type.Object({
  '2xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation])
  }),

  '4xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation])
  }),

  500: Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema, AboutUsValidationSchema, ContactUsValidationSchema, SubscriptionValidationSchema, OrganizerValidationSchema, UploadedMediaValidation])
  }),
});

/**
 * IReply type used
 */
export type IReplyType = Static<typeof IReply>
