export class FacesItem {
    milvusId: string;
    bbox: number[];
    personId: string;
    personName: string;
}

export class Images {
    id: string;
    userId: string;
    fileKey: string;
    faces: FacesItem[];
    playgroundId: string;
    createdAt: Date;
    updatedAt: Date;
}
