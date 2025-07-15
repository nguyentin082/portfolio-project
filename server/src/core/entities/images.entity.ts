export class FacesItem {
    bbox: number[];
    name: string;
    vectorId: string;
    personId: string;
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
