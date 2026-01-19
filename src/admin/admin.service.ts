import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';


@Injectable()
export class AdminService {
 constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
     getHello(): string {
    return 'Hello Admin!';
  }
   async createUser(data: { name: string; email: string; password?: string }): Promise<User> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Delete user by email
  async deleteUserByEmail(email: string): Promise<any> {
    return this.userModel.deleteOne({ email }).exec();
  }

  // Find user by email (optional)
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
 
}
