import { Static, Type } from "@sinclair/typebox";

export const UserValidationSchema = Type.Object({
  _id: Type.Unknown(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: "email" }),
  provider: Type.String(),
})

export type UserValidationType = Static<typeof UserValidationSchema>;
