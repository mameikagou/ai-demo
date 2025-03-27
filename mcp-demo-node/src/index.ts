import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import type { ServerResponse } from "node:http";

const server = new McpServer({
  name: "Echo",
  version: "1.0.0",
});

// 提示（Prompts）：用户控制的模板，让用户选择预定义的交互模式
// 工具（Tools）：模型控制的功能，执行操作并产生副作用
// 资源（Resources）：应用程序控制的数据，提供只读信息


// 类似于get端点，只用于获取数据，不应有显著计算或副作用
// 文档、配置信息、数据库记录等静态或动态内容
server.resource(
  "echo", //name
  new ResourceTemplate(`echo://{message}`, { list: undefined }), // 资源模板，用于描述资源的URI模式和元数据；相当于自定义的端点，这里使用不存在的echo协议; 触发时机：客户端向这个uri请求资源
  async (uri, { message }) => ({
    // 从uri中获取message参数
    contents: [
      {
        // 因为是数组，所以可以返回多个资源
        uri: uri.href, // 完整的uri字符串
        text: `Resource echo: ${message}`, //
      },
      {
        uri: uri.href,
        text: `Resource echo2: ${message}`,
      },
    ],
  })
);

// 让LLM通过服务器执行操作
// tools are expected to perform computation and have side effects:
server.tool("fetch-weather", { city: z.string() }, async ({ city }) => {
  const weather = await fetch(`https://wttr.in/${city}?format=j1`).then((res) =>
    res.json()
  );
  return {
    content: [
      {
        type: "text",
        text: `Weather in ${city}: ${weather.current_condition[0].temp_C}C`,
      },
    ],
  };
});

server.prompt("review-code", { code: z.string() }, async ({ code }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please review the following code: ${code}`,
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I'll help debug this error. What have you tried so far?",
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: "I've restarted the service but still seeing the error.",
      },
    },
  ],
}));

// const transport = new StdioServerTransport();
// await server.connect(transport);

const app = new Hono();
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const transports = {};

app.get("/sse", async (c: Context) => {
  const res = c.res as Response;
  const transport = new SSEServerTransport('/api/messages', res as unknown as ServerResponse ); // 不使用额外的属性就没事

    // 当连接关闭时删除transport
    res.on("close", () => {
      delete transports[transport.sessionId];
    });
    
    // 连接MCP服务器到传输层
    await server.connect(transport);
    
    // 这个请求会保持打开状态
    return c.body(null);
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
