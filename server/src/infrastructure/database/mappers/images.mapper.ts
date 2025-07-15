import { Images, FacesItem } from 'src/core/entities/images.entity';
import { ImagesDocument } from 'src/infrastructure/database/entities/images.schema';

export class ImagesMapper {
    static toDomain(doc: ImagesDocument): Images | null {
        // Debugging log
        // console.log('ImagesMapper.toDomain', doc);

        // Handle null or undefined documents
        if (!doc) {
            return null;
        }

        const images = new Images();
        images.id = doc.id.toString();
        images.userId = doc.userId;
        images.fileKey = doc.fileKey;
        images.playgroundId = doc.playgroundId;

        // Convert faces from MongoDB format to FacesItem[]
        images.faces = doc.faces
            ? doc.faces.map((face) => {
                  // Since MongoDB stores faces as objects directly, just ensure proper structure
                  return {
                      bbox: face.bbox || [],
                      name: face.name || '',
                      vectorId: face.vectorId || '',
                      personId: face.personId || '',
                  } as FacesItem;
              })
            : [];

        images.createdAt = doc.createdAt;
        images.updatedAt = doc.updatedAt;
        return images;
    }

    static toPersistence(Images: Images): any {
        return {
            userId: Images.userId,
            fileKey: Images.fileKey,
            playgroundId: Images.playgroundId,
            faces: Images.faces || [],
        };
    }
}
