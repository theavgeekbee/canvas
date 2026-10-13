import { Elysia, t } from "elysia";
import { staticPlugin } from '@elysiajs/static'

const canvas = [];
const clients = new Map<string, { send: (data: string) => unknown }>()

const app = new Elysia()
.use(
    await staticPlugin({
        assets: 'static',
        prefix: '/',
        indexHTML: true
    })
)
.ws('/global', {
    body: t.Object({
        originX: t.Number(),
        originY: t.Number(),
        destX: t.Number(),
        destY: t.Number(),
        lineColor: t.String(),
        lineSize: t.String()
    }),
    open: (ws) => {
        clients.set(ws.id, ws);

        ws.send({
            type: "initial",
            contents: canvas
        });

        console.log(`Client ${ws.id} connected`);
    },
    message: (ws, body) => {
        for (const client of clients.values()) {
            client.send({
                type: "message",
                contents: body
            });
        }
        canvas.push(body);
    },

    close: (ws) => {
        clients.delete(ws.id);
        console.log(`Client ${ws.id} disconnected`);
    },

    error({ error, code }) {
        console.error('WebSocket handler error:', code, error);
    },
})
.listen(3000)

console.log(
    `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
