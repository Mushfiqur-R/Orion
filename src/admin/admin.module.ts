import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema'; // <-- correct relative path
// relative path, admin folder থেকে

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // register schema
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
