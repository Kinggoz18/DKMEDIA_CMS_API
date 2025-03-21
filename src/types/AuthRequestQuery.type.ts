import { Type, Static } from "@sinclair/typebox";

export const AuthRequestQueryValidation = Type.Object({
  mode: Type.String(),
  signupCode: Type.Optional(Type.String())
})

export const PassportRequestQueryValidation = Type.Object({
  state: Type.Optional(Type.String({
    mode: Type.String(),
    signupCode: Type.Optional(Type.String())
  }))
})


export type AuthRequestQueryValidationType = Static<typeof AuthRequestQueryValidation>;
export type PassportRequestQueryValidationType = Static<typeof PassportRequestQueryValidation>;
