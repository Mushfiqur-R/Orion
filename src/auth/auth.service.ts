import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/Dto/User.dto';
import { LoginDto } from 'src/Dto/Login.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signUp(createAuthDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createAuthDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER
    });

    return user;
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
 
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { 
        sub: user._id, 
        email: user.email, 
        role:user.role
        // orgId: user.orgId (ভবিষ্যতে মাল্টি-টেন্যান্সির জন্য এখানে দেবেন) 
    };
    
    const token = this.jwtService.sign(payload);

    return { token };
  }
}