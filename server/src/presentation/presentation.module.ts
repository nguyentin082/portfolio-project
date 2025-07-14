import { Module } from '@nestjs/common';
// Import use-case modules
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { UserController } from 'src/presentation/controllers/user.controller';
import { ImagesController } from 'src/presentation/controllers/images.controller';
import { UploadController } from 'src/presentation/controllers/upload.controller';

import { UserModule } from 'src/application/use-cases/user/user.module';
import { ImagesModule } from 'src/application/use-cases/images/images.module';
import { UploadModule } from 'src/application/use-cases/upload/upload.module';
import { ConfigModule } from '@nestjs/config';

import { AuthPresentationMapper } from './mappers/auth.mapper';
import { UserMapper } from 'src/infrastructure/database/mappers/user.mapper';
import { ImagesMapper } from 'src/presentation/mappers/images.mapper';

@Module({
    imports: [UserModule, ImagesModule, UploadModule, ConfigModule],
    controllers: [
        AuthController,
        UserController,
        ImagesController,
        UploadController,
    ],
    providers: [AuthPresentationMapper, UserMapper, ImagesMapper],
    exports: [AuthPresentationMapper, UserMapper, ImagesMapper],
})
export class PresentationModule {}
