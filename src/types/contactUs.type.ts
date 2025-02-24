import { Static, Type } from "@sinclair/typebox";

export const ContactUsValidation = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  company: Type.Optional(Type.String()),
  email: Type.String({ format: 'email' }),
  phone: Type.String()
})

export type ContactUsValidationType = Static<typeof ContactUsValidation>