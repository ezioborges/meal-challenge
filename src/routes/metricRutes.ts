import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function metricRoutes(app: FastifyInstance) {
  // Quantidade total de refeições registradas
  app.get('/:id', async (req) => {
    const createMetricParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = createMetricParamsSchema.parse(req.params)
    const [user] = await knex('users').where('id', id).select()
    const userMealList = await knex('meals').where('user_id', id).select()

    // 0 - false
    // 1 - true
    const helthyMeal = userMealList.filter((meal) => meal.inTheDiet === 1)
    const badMeal = userMealList.filter((meal) => meal.inTheDiet === 0)

    const response = {
      userId: user.id,
      userName: user.name,
      userMealAmount: userMealList.length,
      userMealHelthy: helthyMeal.length,
      userMealNotHelthy: badMeal.length,
    }

    return response
  })
}
