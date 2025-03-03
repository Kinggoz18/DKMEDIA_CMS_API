import { Static, Type } from "@sinclair/typebox";

export const AddArticleValidationSchema = Type.Object({
  title: Type.String(),
  link: Type.String(),
})

export const UpdateArticleValidationSchema = Type.Object({
  title: Type.Optional(Type.String()),
  link: Type.Optional(Type.String()),
})

export const ArticleValidationSchema = Type.Object({
  _id: Type.Unknown(),
  title: Type.String(),
  link: Type.String(),
})

export type AboutUsValidationType = Static<typeof ArticleValidationSchema>
export type AddAboutUsValidationType = Static<typeof AddArticleValidationSchema>
