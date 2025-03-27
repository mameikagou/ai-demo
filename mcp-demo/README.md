```txt
npm install
npm run dev
```

```txt
npm run deploy
```

mcp/sdk库有一些兼容性的问题，它底层依赖cjs的node环境，calude flare不是完全的node，会提示少依赖；

这里使用了vite，所以可以安装这个插件
```ts
vite-plugin-node-polyfills
```

同时，hono早期不是为node设计的，他的context对象的res，跟node有所不同；

比如 node:crypto报错
```sh
[ERROR] service core:user:mcp-demo: Uncaught Error: No such module "node:crypto".

    imported from "index.js"



✘ [ERROR] The Workers runtime failed to start. There is likely additional logging output above.
```

解决方式：
```ts
// crypto-shim.js
// 这个文件解决 node:crypto 模块在 Cloudflare Workers 中的兼容性问题
import * as cryptoBrowserify from 'crypto-browserify';

export default cryptoBrowserify;
export const createHash = cryptoBrowserify.createHash;
export const createHmac = cryptoBrowserify.createHmac;
export const randomBytes = cryptoBrowserify.randomBytes;
export const createCipheriv = cryptoBrowserify.createCipheriv;
export const createDecipheriv = cryptoBrowserify.createDecipheriv;
export const pbkdf2 = cryptoBrowserify.pbkdf2;
export const pbkdf2Sync = cryptoBrowserify.pbkdf2Sync; 
```


nodejs的writeHead模块在 Cloudflare Workers（基于 Web 标准 Fetch API）中不存在；
解决方式是使用一个适配器
```sh
[wrangler:inf] GET /sse 200 OK (17ms)
✘ [ERROR] Uncaught (in response) TypeError: this.res.writeHead is not a function

      at SSEServerTransport.start
  (file:////mcp-demo/.wrangler/tmp/dev-ODGh0m/index.js:17608:14)
      at Server.connect
  (file:////mcp-demo/.wrangler/tmp/dev-ODGh0m/index.js:15385:27)
      at McpServer.connect
  (file:////mcp-demo/.wrangler/tmp/dev-ODGh0m/index.js:17269:30)
      at Object.start
  (file:////mcp-demo/.wrangler/tmp/dev-ODGh0m/index.js:17719:14)
      at
  file:////mcp-demo/.wrangler/tmp/dev-ODGh0m/index.js:1771
```