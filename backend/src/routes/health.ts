import { Hono } from 'hono'

const health = new Hono()

health.get('/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

export default health