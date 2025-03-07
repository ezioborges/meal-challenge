import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exist'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies
    const users = await knex('users').where('session_id', sessionId).select()

    return { users }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (req) => {
    const createUserParamSchema = z.object({
      id: z.string().uuid(),
    })
    const { sessionId } = req.cookies
    const { id } = createUserParamSchema.parse(req.params)

    const user = await knex('users').where({
      session_id: sessionId,
      id,
    })

    return { user }
  })

  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
      diets: null,
    })

    return res.status(201).send()
  })

  app.post('/:id/meals', async (req, res) => {
    const createUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      inTheDiet: z.boolean(),
    })

    const { id } = createUserParamsSchema.parse(req.params)
    const { name, description, inTheDiet } = createMealBodySchema.parse(
      req.body,
    )

    if (id) {
      await knex('users').where('id', id).insert({
        id: randomUUID(),
        name,
        description,
        inTheDiet,
      })
    }

    return res.status(201).send()
  })
}
