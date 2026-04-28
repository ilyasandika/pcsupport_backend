import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UserForLogin } from '../../common/types/user-login.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const { username, email } = dto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
      select: ['username', 'email'],
    });

    if (existingUser) {
      if (existingUser.username === username && existingUser.email === email) {
        throw new ConflictException('username and email already taken');
      }
      if (existingUser.username === username) {
        throw new ConflictException('username already taken');
      }
      if (existingUser.email === email) {
        throw new ConflictException('email already taken');
      }
    }

    const salt = parseInt(process.env.SALT || '10');
    dto.password = await bcrypt.hash(dto.password, salt);

    const newUser = this.userRepository.create(dto);
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOrThrow(id);
    this.userRepository.merge(user, dto);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: number, dto: UpdateUserPasswordDto) {
    const user = await this.userRepository.findOne({
      where: [{ id }],
      select: ['password'],
    });
    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException(`incorrect old password`);
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      parseInt(process.env.SALT || '10'),
    );
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async remove(id: number) {
    await this.findOrThrow(id);
    await this.userRepository.delete(id);
  }

  async findForLogin(username: string): Promise<UserForLogin> {
    const user = await this.userRepository.findOne({
      where: [{ username }],
      select: ['id', 'username', 'email', 'password', 'role'],
    });
    if (!user) {
      return null;
    }
    return user;
  }

  private async findOrThrow(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    return user;
  }
}
