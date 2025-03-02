import { Static, Type } from "@sinclair/typebox";

export const AddSubscriptionValidationSchema = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: 'email' }),
})

export const SubscriptionValidationSchema = Type.Object({
  _id: Type.Unknown(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: 'email' }),
})

export type SubscriptionValidationType = Static<typeof SubscriptionValidationSchema>
export type AddSubscriptionValidationType = Static<typeof AddSubscriptionValidationSchema>