import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { PlaygroundsCrudUseCase } from 'src/application/use-cases/playgrounds/playgrounds-crud.use-case';

@Module({
    imports: [DatabaseModule],
    providers: [PlaygroundsCrudUseCase],
    exports: [PlaygroundsCrudUseCase],
})
export class PlaygroundsModule {}
