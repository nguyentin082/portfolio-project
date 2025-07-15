import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { ImagesCrudUseCase } from './images-crud.use-case';

@Module({
    imports: [DatabaseModule],
    providers: [
        ImagesCrudUseCase,
        {
            provide: 'ImagesCrudUseCase',
            useClass: ImagesCrudUseCase,
        },
    ],
    exports: [ImagesCrudUseCase],
})
export class ImagesModule {}
