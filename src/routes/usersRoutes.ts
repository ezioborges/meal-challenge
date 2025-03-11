import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

type mealType = {
  title: string
  description: string
  inTheDiet: boolean
}

type responseType = {
  userId: string
  userName: string
  userMeals: object[]
}

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies

    const users = await knex('users').where('session_id', sessionId).select()

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

  app.get('/meals', async () => {
    const meals = await knex('meals').select()

    return { meals }
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
    })

    return res.status(201).send()
  })

  app.post('/:id/meals', async (req, res) => {
    const createMealBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      inTheDiet: z.boolean(),
    })

    const createMealParamSchema = z.object({
      id: z.string(),
    })

    const { title, description, inTheDiet } = createMealBodySchema.parse(
      req.body,
    )

    const { id } = createMealParamSchema.parse(req.params)

    await knex('meals').insert({
      id: randomUUID(),
      title,
      description,
      inTheDiet,
      user_id: id,
    })

    return res.status(201).send()
  })

  app.put('/:id/meals/:mealId', async (req, res) => {
    const createUserAndMealParamsSchema = z.object({
      id: z.string(),
      mealId: z.string(),
    })

    const createMealBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      inTheDiet: z.boolean(),
    })

    const paramsID = req.params
    const { id, mealId } = createUserAndMealParamsSchema.parse(paramsID)
    const { title, description, inTheDiet } = createMealBodySchema.parse(
      req.body,
    )
    const meals = await knex('meals').select()

    const mealsId = meals.filter((meal) => meal.user_id === id)
    const mealItem = mealsId.filter((item) => item.id === mealId)

    if (mealItem) {
      await knex('meals').where('id', mealId).update({
        title,
        description,
        inTheDiet,
      })

      return res.status(200).send()
    }

    return res.status(404).send()
  })

  app.delete('/:id/meals/:mealId', async (req, res) => {
    const createMealParamSchema = z.object({
      mealId: z.string(),
    })

    const { mealId } = createMealParamSchema.parse(req.params)

    await knex('meals').where('id', mealId).delete()

    res.status(200).send()
  })

  // Lista todas as refeições de um usuário
  app.get('/:id/all-meals', async (req) => {
    const createUserMealsParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = createUserMealsParamsSchema.parse(req.params)
    const [user] = await knex('users').where('id', id).select()

    const response: responseType = {
      userId: user.id,
      userName: user.name,
      userMeals: [],
    }

    const userMealList = await knex('users')
      .innerJoin('meals', 'meals.user_id', 'users.id')
      .select()

    userMealList.forEach(({ title, description, inTheDiet }: mealType) => {
      return response.userMeals.push({
        title,
        description,
        inTheDiet,
      })
    })
    return response
  })
}
