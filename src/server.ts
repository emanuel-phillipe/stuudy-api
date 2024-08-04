import fastify from "fastify"
import userRoutes from "./routes/user_routes";
import authenticationRoutes from "./routes/authentication_routes";

const app = fastify()

app.register(userRoutes, {prefix: "/user"})
app.register(authenticationRoutes, {prefix: "/auth"})

app.listen({port: 3333}).then(() => {
  console.log(" ");
  console.log("Server running");
  console.log(" ");
})