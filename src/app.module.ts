import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { single } from 'rxjs';


@Module({
   imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Orion'), 
    AdminModule,
    RedisModule.forRoot({
      type:'single',
      url: 'redis://localhost:6379',
    })
  ],
  controllers: [AppController,],
  providers: [AppService, ],
})
export class AppModule {}
