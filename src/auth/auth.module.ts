import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserOrgMap, UserOrgMapSchema } from 'src/schemas/UserOrg.schema';

@Module({
  imports: [
    
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      { name: UserOrgMap.name, schema: UserOrgMapSchema }
    ]), 
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: 'mysecretkey', 
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
