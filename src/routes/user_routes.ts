import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { handleAuthorization } from "../lib/authentication_pre_handlers";
import { createSlug } from "../lib/slug_creation";

const user_creation_body_zod_schema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

export default async function userRoutes(app:FastifyInstance){

  // POST user/create
  app.post("/create", async (request, response) => {

    const requestBody = user_creation_body_zod_schema.parse(request.body)
    const userSlug = createSlug(requestBody.name) // NOME DO USUÁRIO EM LOWER-CASE E SEPARADO POR TRAÇOS (emanuel-phillipe-ribeiro)

    const hashPassword = await bcrypt.hash(requestBody.password, 10)

    const user_model = {
      ...requestBody,
      slug: userSlug,
      password: hashPassword
    }

    await prisma.user.create({data: user_model}).then((created_user) => {
      return response.status(201).send({"message": "User created", "id": created_user.id, "slug": created_user.slug})
    })
  })

  // GET user/find/
  app.get("/find", {preHandler: (req, reply, done) => {handleAuthorization(req, reply, done)}}, async (request, response) => {

    const finded_user = await prisma.user.findFirst({where: {id: request.user.id}})

    if(!finded_user) return response.status(404).send({"error": "User not found"})   

    return response.status(200).send(finded_user)
  })
}