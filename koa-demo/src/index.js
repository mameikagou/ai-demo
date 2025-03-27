import Koa from 'koa'
import { join } from 'path'
import Router from 'koa-router'
import { JSONFilePreset } from 'lowdb/node' // 7.0.1版本
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 手动获取__dirname变量
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Koa()
const router = new Router()

// 初始化数据库
const db = await JSONFilePreset(join(__dirname, './db.json'), { visits: [], count: 0 })

router.get('/', async(ctx, next) => {
  ctx.body = 'Hello World'

  const ip = ctx.header['x-forwarded-for'] || '-9999';
  const {user, page, agent} = ctx.query;

  // 更新数据库
  db.data.visits.push({ip, user, page, agent})
  db.data.count += 1
  await db.write()

  await next()
})

// 应用路由
app.use(router.routes())
// 一个中间件，
app.use(router.allowedMethods())

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})