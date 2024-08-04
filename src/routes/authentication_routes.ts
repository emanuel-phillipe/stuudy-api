import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { isUserAuthorized } from "../lib/authentication_pre_handlers";

const authentication_body_zod_schema = z.object({
  email: z.string(),
  password: z.string(),
})

export default async function authenticationRoutes(app:FastifyInstance){

  // POST auth/login
  app.post("/login", {preHandler: async (req, reply, done) => {await isUserAuthorized(req) ? reply.status(403).send({"error":"User already authorized"}) : done()}}, async (request, response) => {

    const requestBody = authentication_body_zod_schema.parse(request.body)

    const finded_user = await prisma.user.findFirst({where: {email: requestBody.email}})
    if(!finded_user) return response.status(404).send({"message": "User not found"})

    const is_password_valid = await bcrypt.compare(requestBody.password, finded_user.password)
    if(!is_password_valid) return response.status(403).send({"message": "Incorrect password"})

    const jwt_secret = process.env.JWT_SECRET+""
    const jwt_token = jwt.sign({id: finded_user.id}, jwt_secret)

    return response.status(202).send({"token": jwt_token})
  })
}