import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  app.get('/:id', async (req) => {
    const createUserParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = createUserParamsSchema.parse(req.params)

    const user = await knex('users').where('id', id).select()

    return user
  })

  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(req.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
    })

    return res.status(201).send()
  })
}
