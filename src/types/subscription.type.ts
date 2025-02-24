import { Static, Type } from "@sinclair/typebox";

export const SubscriptionValidation = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({ format: 'email' }),
})

export type SubscriptionValidationType = Static<typeof SubscriptionValidation>