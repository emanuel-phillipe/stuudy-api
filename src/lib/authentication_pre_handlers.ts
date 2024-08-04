import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import jwt from "jsonwebtoken"

interface IJwtPayload {
  id: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user_id: string
  }
}

export async function isUserAuthorized(request:FastifyRequest){
  if(request.headers.authorization) return true

  return false
}

export async function handleAuthorization(request:FastifyRequest, reply:FastifyReply, done:HookHandlerDoneFunction) {
  
  const jwtToken = request.headers.authorization?.replace(/^Bearer /,"")
  
  if(!jwtToken) return reply.status(401).send({"message":"Session unauthorized"})

  const userInfo = await decodeJwtToken(jwtToken)
  if(!userInfo) return reply.status(401).send({"message": "Session unauthorized"})

  request.user_id = userInfo;

  done()
}

export async function decodeJwtToken(token:string){
  const decoded_token = jwt.verify(token, process.env.JWT_SECRET+"") as IJwtPayload
  
  return decoded_token.id
}