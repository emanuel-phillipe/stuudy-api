import fastify from "fastify"
import userRoutes from "./routes/user_routes";
import authenticationRoutes from "./routes/authentication_routes";
import cors from '@fastify/cors'
import subjectRoutes from "./routes/subject_routes";
import activityRoutes from "./routes/activity_routes";

const app = fastify()

app.register(cors, {
  origin: "*",
})

app.register(userRoutes, {prefix: "/user"})
app.register(authenticationRoutes, {prefix: "/auth"})
app.register(subjectRoutes, {prefix: "/subject"})
app.register(activityRoutes, {prefix: "/activity"})

app.listen({port: 3333}).then(() => {
  console.log(" ");
  console.log("Server running");
  console.log(" ");
})