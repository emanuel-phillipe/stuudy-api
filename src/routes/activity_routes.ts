import type { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import { handleAuthorization } from "../lib/authentication_pre_handlers";

const activity_creation_body_zod_schema = z.object({
  subject_id: z.string(),
  activities: z.array(z.object({
    name: z.string(),
    total: z.number().min(1),
    date: z.string().transform( arg => new Date( arg ) )
  }))
})

const activity_grade_change_body_zod_schema = z.object({
  activity_id: z.string(),
  new_grade: z.number().min(0)
})

export default async function activityRoutes(app:FastifyInstance){

  // POST activity/create
  app.post("/create", {preHandler: (req, reply, done) => {handleAuthorization(req, reply, done)}}, async (request, response) => {

    const requestBody = activity_creation_body_zod_schema.parse(request.body)    

    var activities_to_create = requestBody.activities.map((activity) => {
      return {
        name: activity.name,
        total: activity.total,
        grade: null,
        date: new Date(activity.date),
        subject_id: requestBody.subject_id
      }
    })

    await prisma.activity.createMany({data: [...activities_to_create]})

    var subject_new_total = 0;

    await prisma.activity.findMany({where: {subject_id: requestBody.subject_id}}).then((activities) => {
      activities.map((activity) => {
        subject_new_total += activity.total
      })
    })

    await prisma.subject.update({where: {id: requestBody.subject_id}, data: {total: subject_new_total}}).then((new_subject) => {
      return response.status(201).send({"message": "New Activity(ies) were created"})
    })

  })

  // GET activity/find/:subject_id
  app.get<{ Params: {subject_id: string} }>("/find/:subject_id", {preHandler: (req, reply, done) => {handleAuthorization(req, reply, done)}}, async (request, response) => {

    const activities = await prisma.activity.findMany({where: {subject_id: request.params.subject_id}}).then((response) => {return response})

    return response.status(200).send(activities)
  })

  app.put("/grade", async (request, response) => {
    const requestBody = activity_grade_change_body_zod_schema.parse(request.body)   

    const activity = await prisma.activity.update({where: {id: requestBody.activity_id}, data: {grade: requestBody.new_grade}}).then((response) => {return response})

    const subject_to_update = await prisma.subject.findFirst({where: {id: activity.subject_id || ""}}).then((subject) => {
      return subject
    })

    const activities = await prisma.activity.findMany({where: {subject_id: subject_to_update?.id}}).then((response) => {return response})

    const new_grade = () => {

      var grade = 0
      activities.map((activityMap) => {
        grade += activityMap.grade || 0
      })
      
      return grade
    }

    await prisma.subject.update({where: {id: activity.subject_id || ""}, data: {grade: new_grade()}}).then((subject) => {
      return response.status(200).send(subject)
    })
  })
}

// model Subject {
//   id         String     @id @default(cuid())
//   user       User?      @relation(fields: [user_id], references: [id])
//   user_id    String?
//   name       String
//   slug       String     @unique
//   activities Activity[]

//   @@map("subjects")
// }

// model Activity {
//   id         String   @id @default(cuid())
//   name       String
//   grade      Float
//   total      Int
//   subject    Subject? @relation(fields: [subject_id], references: [id])
//   subject_id String?

//   @@map("activities")
// }