import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/Dto/User.dto';
import { LoginDto } from 'src/Dto/Login.dto';
import { OrgRole, UserOrgMap, UserOrgMapDocument } from 'src/schemas/UserOrg.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserOrgMap.name) private userOrgMapModel: Model<UserOrgMapDocument>,
    private jwtService: JwtService,
  ) {}

//   async signUp(createAuthDto: CreateUserDto): Promise<any> {
//     const { name, email, password, orgId, role } = createAuthDto;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     let user;
//     try{
//         user = await this.userModel.create({
//             name,
//             email,
//             password: hashedPassword,
//         });}
//      catch (error) {
//         if (error.code === 11000) {
//             throw new BadRequestException('Email already exists');
//         }
//         throw error;
//     }
    
//     if(orgId){
//     await this.userOrgMapModel.create({
//         userId: user._id,
//         orgId: orgId, 
//         role: role || OrgRole.CUSTOMER 
//     });
// }

//     return { message: 'Signup successful', userId: user._id,useremail:user.email};
//   }

async signUp(createAuthDto: CreateUserDto): Promise<any> {
    const { name, email, password, orgId, role } = createAuthDto;

    
    let user = await this.userModel.findOne({ email: email });

    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
       
        user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
        });
    } 
    

    if (orgId) {
        
        const existingMember = await this.userOrgMapModel.findOne({
            userId: user._id,
            orgId: orgId
        });

        if (existingMember) {
            
            throw new BadRequestException('User is already a member of this organization');
        }

    
        await this.userOrgMapModel.create({
            userId: user._id,
            orgId: new Types.ObjectId(orgId), 
            role: role || OrgRole.CUSTOMER 
        });
    }

    return { 
        message: user.isNew ? 'User created and added' : 'Existing user added to organization', 
        userId: user._id, 
        email: user.email 
    };
}

  async login(loginDto: LoginDto): Promise<{ token: string; user: any; organizations: any[] }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
        throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid email or password');
    }

    const memberships = await this.userOrgMapModel.find({ userId: user._id })
        .populate('orgId', 'name')
        .exec();


    const organizations = memberships.map((m: any) => ({
        _id: m.orgId._id,
        name: m.orgId.name,
        slug: m.orgId.slug,
        address: m.orgId.address,
        role: m.role 
    }));


    const payload = { 
        sub: user._id, 
        email: user.email, 
        allowedOrgs: organizations.map(o => o._id) 
    };
    
    const token = this.jwtService.sign(payload);

    return { 
        token,
        user: {
            name: user.name,
            email: user.email,
        },
        organizations: organizations 
    };
  }
}