import { Inject } from '@nestjs/common';
import { User } from 'src/core/entities/user.entity';
import { UserRepository } from 'src/core/repositories/user.repository';

export class MyProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}
  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}
