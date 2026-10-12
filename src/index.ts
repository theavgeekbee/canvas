import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'

const app = new Elysia()
  .use(
    await staticPlugin({
      assets: 'static',
      prefix: '/',
      indexHTML: true
    })
  )
  .get('/api/hello', () => ({ message: 'Hello!' }))
  .listen(3000)

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
