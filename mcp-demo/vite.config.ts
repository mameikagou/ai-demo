import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import ssrHotReload from 'vite-plugin-ssr-hot-reload'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// pnpm i -D @types/node
import path from 'path'
import { fileURLToPath } from 'url'

// ESM 环境下获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    ssrHotReload(), 
    cloudflare(),
    // 使用配置来包含所有 Node.js 内置模块 polyfills 并处理 node: 协议
    nodePolyfills({
      // 明确列出需要的 polyfill 模块
      include: [
        'buffer',
        'crypto',
        'stream',
        'string_decoder',
        'util'
      ],
      // 启用全局对象
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      // 启用 node: 协议导入的处理
      protocolImports: true
    })
  ],
  resolve: {
    alias: {
      // 重定向 node:crypto 和 crypto 到我们的自定义 shim
      'node:crypto': path.resolve(__dirname, 'src/crypto-shim.js'),
      'crypto': path.resolve(__dirname, 'src/crypto-shim.js')
    }
  }
})
