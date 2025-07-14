import { UserRepository } from '../../../core/repositories/user.repository';
import { User } from '../../../core/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Inject } from '@nestjs/common';

export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('Email already exists');
    const hashed = await bcrypt.hash(password, 10);
    const user = new User(
      '',
      email,
      hashed,
      firstName,
      lastName,
      '',
      new Date(),
      new Date(),
    );
    return this.userRepository.save(user);
  }
}
