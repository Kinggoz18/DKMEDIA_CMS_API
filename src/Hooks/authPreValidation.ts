import { HookHandlerDoneFunction, preValidationAsyncHookHandler, preValidationHookHandler } from "fastify";

export const authPreValidation = function (reques: any, reply: any, done: any) {
  console.log("Checking request data...");
  done()
}