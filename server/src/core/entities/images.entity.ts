import { ImageStatusEnum } from 'src/core/enums/images.enum';

export class FacesItem {
    milvusId: string;
    bbox: number[];
    personId: string;
}

export class Images {
    id: string;
    userId: string;
    fileKey: string;
    faces: FacesItem[];
    playgroundId: string;
    status: ImageStatusEnum;
    createdAt: Date;
    updatedAt: Date;
}
