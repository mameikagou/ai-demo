import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'biang',
      
      // 自动同步数据库结构
      // 开发环境使用，生产环境建议关闭
      // 会根据实体定义自动创建/更新数据库表
      synchronize: true,

      logging: true,
      // 数据库名称
      database: 'mrbs',
      // 实体类数组，用于定义数据库表结构
      entities: [],
      // 连接池大小，控制同时可以建立的数据库连接数
      poolSize: 10,
      // 连接器包
      connectorPackage: 'mysql2',
      // 额外配置，这里指定使用 SHA256 密码认证插件
      // 解决某些 MySQL 版本的认证问题
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
