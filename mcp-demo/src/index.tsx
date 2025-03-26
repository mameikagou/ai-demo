import { Context, Hono } from "hono";
import { renderer } from "./renderer";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from "http";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

const server = new McpServer({
  name: "my-app",
  version: "1.0.0",
});
const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (ctx: Context) => {
  const stream = new ReadableStream({
    start(controller) {
      // 使用类型断言直接转换类型
      const transport = new SSEServerTransport("/msg", ctx.res as unknown as ServerResponse); // 这里有hono的类型与node的类型不匹配
      transports[transport.sessionId] = transport;

      //  req.raw能获取到整个请求体, 它的类型就是Request
      ctx.req.raw.signal.addEventListener("abort", () => {
        console.log(`Client ${transport.sessionId} disconnected`);
        delete transports[transport.sessionId];
        controller.close();
      });

      server.connect(transport).catch((error) => {
        console.error("Connection error:", error);
        controller.error(error);
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});


app.post("/msg", async (ctx: Context) => {
  try {
    const sessionId = ctx.req.query("sessionId");
    if (!sessionId) {
      ctx.text("sessionId is required", 400, {
        "X-Error-Type": "MissingParameter",
      });
      return;
    }
    const transport = transports[sessionId];
    if (!transport) {
      ctx.text("session not found", 400, { "X-Error-Type": "SessionNotFound" });
      return;
    }
    // 接口请求，然后通过sse转发消息
    // 直接使用类型断言
    await transport.handlePostMessage(
      ctx.req.raw as unknown as IncomingMessage,
      ctx.res as unknown as ServerResponse
    );
  } catch (e) {
    console.error(e);
    ctx.text("internal server error", 500, {
      "X-Error-Type": "InternalServerError",
    });
  }
});

export default app;
