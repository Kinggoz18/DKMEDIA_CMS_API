import { Static, Type } from "@sinclair/typebox";
import { mediaType } from "../Enums/mediaType";

export const UploadedMediaValidation = Type.Object({
  mediaType: Type.Enum(mediaType),
  mediaLink: Type.String({ format: 'uri' }),
})

export type UploadedMediaValidationType = Static<typeof UploadedMediaValidation>
