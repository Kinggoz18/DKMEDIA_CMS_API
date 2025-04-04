import { Static, Type } from "@sinclair/typebox";
import { EventPriority } from "../Enums/eventPriority";
import { OrganizerValidationSchema } from "./organizer.type";

export const AddEventValidationSchema = Type.Object({
  title: Type.String(),
  date: Type.String(),
  image: Type.String({ format: 'uri' }),
  priority: Type.Enum(EventPriority),
  organizer: OrganizerValidationSchema,
  ticketLink: Type.String()
});

export const UpdateEventValidationSchema = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  date: Type.Optional(Type.String(),),
  image: Type.Optional(Type.String({ format: 'uri' })),
  priority: Type.Optional(Type.Enum(EventPriority)),
  organizer: Type.Optional(OrganizerValidationSchema),
  ticketLink: Type.Optional(Type.String())
});

export const EventValidationSchema = Type.Object({
  _id: Type.Unknown(),
  title: Type.String(),
  date: Type.String(),
  image: Type.String({ format: 'uri' }),
  priority: Type.Enum(EventPriority),
  organizer: OrganizerValidationSchema,
  ticketLink: Type.String()
});

export type EventValidationType = Static<typeof EventValidationSchema>;
export type AddEventValidationType = Static<typeof AddEventValidationSchema>;
export type UpdateEventValidationType = Static<typeof UpdateEventValidationSchema>;