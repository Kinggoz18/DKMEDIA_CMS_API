import { Type, Static } from "@sinclair/typebox";

export const AuthRequestQueryValidation = Type.Object({
  id: Type.String(),
  mode: Type.String(),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: 'email' })),
})

export type AuthRequestQueryValidationType = Static<typeof AuthRequestQueryValidation>;
