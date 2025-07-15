import { Module } from '@nestjs/common';
import { GeneratePresignedUrlUseCase } from 'src/application/use-cases/upload/get-file-presigned-url.use-case';
import { UploadImageUseCase } from 'src/application/use-cases/upload/upload-image.use-case';
import { SupabaseModule } from 'src/infrastructure/integrates/supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [GeneratePresignedUrlUseCase, UploadImageUseCase],
    exports: [GeneratePresignedUrlUseCase, UploadImageUseCase, SupabaseModule],
})
export class UploadModule {}
