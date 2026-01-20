import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { single } from 'rxjs';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
   imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Orion'), 
    AdminModule,
    RedisModule.forRoot({
      type:'single',
      url: 'redis://localhost:6379',
    }),
    ThrottlerModule.forRoot([{
      ttl:60000,
      limit:2
    }])
  ],
  controllers: [AppController,],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass:ThrottlerGuard
    }
   ],
})
export class AppModule {}
