import fastify from 'fastify'
import { usersRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})
