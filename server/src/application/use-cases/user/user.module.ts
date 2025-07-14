import { Module } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { LoginUserUseCase } from './login-user.use-case';
import { UserRepositoryImpl } from 'src/infrastructure/database/repositories/user.repository.impl';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/infrastructure/database/entities/user.schema';
import { JwtService } from 'src/infrastructure/services/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserCrudUseCase } from './user-crud.use-case';
import { MyProfileUseCase } from 'src/application/use-cases/user/my-profile.use-case';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        MyProfileUseCase,
        UserCrudUseCase,
        { provide: 'UserRepository', useClass: UserRepositoryImpl },
        JwtService,
    ],
    exports: [
        RegisterUserUseCase,
        LoginUserUseCase,
        MyProfileUseCase,
        JwtService,
        JwtModule,
        UserCrudUseCase,
    ],
})
export class UserModule {}
