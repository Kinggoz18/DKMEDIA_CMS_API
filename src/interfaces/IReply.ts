import { Static, Type } from "@sinclair/typebox";
import { EventValidationSchema } from "../types/event.type";
import { UserValidationSchema } from "../types/user.type";

/**
 * IReply object used for request replies.
 */
export const IReply = Type.Object({
  '2xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema])
  }),

  '4xx': Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema])
  }),

  500: Type.Object({
    success: Type.Boolean(),
    data: Type.Union([Type.String(), EventValidationSchema, UserValidationSchema])
  }),
});

/**
 * IReply type used
 */
export type IReplyType = Static<typeof IReply>
