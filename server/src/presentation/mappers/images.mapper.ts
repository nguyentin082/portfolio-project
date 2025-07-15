import { Images } from 'src/core/entities/images.entity';

export class ImagesMapper {
    static toResponse(Images: Images) {
        return {
            id: Images.id,
            userId: Images.userId,
            fileKey: Images.fileKey,
            createdAt: Images.createdAt,
            updatedAt: Images.updatedAt,
        };
    }
}
