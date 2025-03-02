import { Static, Type } from "@sinclair/typebox";

export const AddContactUsValidation = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  company: Type.Optional(Type.String()),
  email: Type.String({ format: 'email' }),
  phone: Type.String(),
  message: Type.String(),
})

export const ContactUsValidationSchema = Type.Object({
  _id: Type.Unknown(),
  firstName: Type.String(),
  lastName: Type.String(),
  company: Type.Optional(Type.String()),
  email: Type.String({ format: 'email' }),
  phone: Type.String(),
  message: Type.String(),
})

export type ContactUsValidationType = Static<typeof ContactUsValidationSchema>
export type AddContactUsValidationType = Static<typeof AddContactUsValidation>