import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/database/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(data: any) {
    const userExists = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (userExists) {
      throw new NotFoundException('User already exists');
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      email: data.email,
      password: hashed,
      name: data.name,
    });
    return this.userRepo.save(user);
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = this.userRepo.create({
        email,
        name: profile.name.givenName + ' ' + profile.name.familyName,
        googleId: profile.id,
      });
      return await this.userRepo.save(user);
    } else {
      return user;
    }
    // return user;
  }
}
