import { Static, Type } from "@sinclair/typebox";

export const OrganizerValidationSchema = Type.Object({
  _id: Type.Unknown(),
  name: Type.String(),
  logo: Type.String(),
})

export type OrganizerValidationType = Static<typeof OrganizerValidationSchema>;