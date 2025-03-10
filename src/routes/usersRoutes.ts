import { FastifyInstance } from 'fastify'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    console.log('aqui ta vindo!')
  })
}
