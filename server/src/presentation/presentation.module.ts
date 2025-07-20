import { Module } from '@nestjs/common';
// Import use-case modules
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { UserController } from 'src/presentation/controllers/user.controller';
import { ImagesController } from 'src/presentation/controllers/images.controller';
import { UploadController } from 'src/presentation/controllers/upload.controller';
import { PersonsController } from 'src/presentation/controllers/persons.controller';

import { UserModule } from 'src/application/use-cases/user/user.module';
import { ImagesModule } from 'src/application/use-cases/images/images.module';
import { UploadModule } from 'src/application/use-cases/upload/upload.module';
import { PersonsModule } from 'src/application/use-cases/persons/persons.module';
import { PlaygroundsModule } from 'src/application/use-cases/playgrounds/playgrounds.module';
import { ConfigModule } from '@nestjs/config';

import { AuthPresentationMapper } from './mappers/auth.mapper';
import { UserMapper } from 'src/infrastructure/database/mappers/user.mapper';
import { ImagesMapper } from 'src/presentation/mappers/images.mapper';
import { PersonsMapper } from 'src/infrastructure/database/mappers/persons.mapper';
import { PlaygroundsController } from 'src/presentation/controllers/playgrounds.controller';
import { PlaygroundsMapper } from 'src/infrastructure/database/mappers/playgrounds.mapper';

@Module({
    imports: [
        UserModule,
        ImagesModule,
        UploadModule,
        PersonsModule,
        PlaygroundsModule,
        ConfigModule,
    ],
    controllers: [
        AuthController,
        UserController,
        ImagesController,
        UploadController,
        PersonsController,
        PlaygroundsController,
    ],
    providers: [
        AuthPresentationMapper,
        UserMapper,
        ImagesMapper,
        PersonsMapper,
        PlaygroundsMapper,
    ],
    exports: [
        AuthPresentationMapper,
        UserMapper,
        ImagesMapper,
        PersonsMapper,
        PlaygroundsMapper,
    ],
})
export class PresentationModule {}
