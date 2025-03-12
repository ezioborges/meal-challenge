import fastify from 'fastify'
import { usersRoutes } from './routes/usersRoutes'
import cookie from '@fastify/cookie'
import { metricRoutes } from './routes/metricRutes'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(metricRoutes, {
  prefix: 'metric',
})
