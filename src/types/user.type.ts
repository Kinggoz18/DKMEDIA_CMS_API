import { Static, Type } from "@sinclair/typebox";

export const UserValidationSchema = Type.Object({
  _id: Type.Unknown(),
  authId: Type.String(),
  displayName: Type.String(),
  email: Type.String(),
})

export type UserValidationType = Static<typeof UserValidationSchema>;
