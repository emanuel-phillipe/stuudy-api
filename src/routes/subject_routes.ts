import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import { handleAuthorization } from "../lib/authentication_pre_handlers";
import type { User } from "@prisma/client";
import { createSlug } from "../lib/slug_creation";

const subject_creation_body_zod_schema = z.object({
  subject: z.object({
    name: z.string(),
    components: z.array(z.string())
  }),
  activities: z.array(z.object({
    name: z.string(),
    total: z.number().min(1),
  })).optional()
})

export default async function subjectRoutes(app:FastifyInstance){

  // POST subject/create
  app.post("/create", {preHandler: (req, reply, done) => {handleAuthorization(req, reply, done)}}, async (request, response) => {

    const requestBody = subject_creation_body_zod_schema.parse(request.body)
    const subjectSlug = createSlug(requestBody.subject.name) // NOME  EM LOWER-CASE E SEPARADO POR TRAÇOS (projeto-matemática)
    var subject_total = 0;

    if(requestBody.activities){
      requestBody.activities.map((activity) => {
        subject_total += activity.total
      })
    }

    var subject_to_create = {
      ...requestBody.subject,
      slug: subjectSlug,
      user_id: request.user.id,
      total: subject_total
    }

    const subject = await prisma.subject.create({data: subject_to_create}).then((created_subject) => {
      return created_subject
    })

    if(requestBody.activities){
      var activities_to_create = requestBody.activities.map((activity) => {
        return {
          name: activity.name,
          total: activity.total,
          grade: null,
          subject_id: subject.id
        }
      })

      await prisma.activity.createMany({data: [...activities_to_create]}).then((activities) => {
        return response.status(201).send(activities)
      })
    }
  })

  // POST subject/find
  app.get("/find", {preHandler: (req, reply, done) => {handleAuthorization(req, reply, done)}}, async (request, response) => {

    const subjects = await prisma.subject.findMany({where: {user_id: request.user.id}}).then((response) => {return response})

    return response.status(200).send(subjects)
  })
}

// model User {
//   id       String    @id @default(uuid())
//   name     String
//   slug     String    @unique // Nome do usuário simplificado e único name = Emanuel Phillipe && slug = emanuel-phillipe
//   email    String    @unique
//   password String
//   subjects Subject[]

//   @@map("users")
// }

// model Subject {
//   id         String     @id @default(cuid())
//   user       User?      @relation(fields: [user_id], references: [id])
//   user_id    String?
//   name       String
//   grade      Float?
//   total      Int?
//   slug       String     @unique
//   activities Activity[]

//   @@map("subjects")
// }

// model Activity {
//   id         String   @id @default(cuid())
//   name       String
//   grade      Float?
//   total      Int
//   date       DateTime @default(now())
//   subject    Subject? @relation(fields: [subject_id], references: [id])
//   subject_id String?

//   @@map("activities")
// }
