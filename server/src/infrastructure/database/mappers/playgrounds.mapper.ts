import { Playgrounds } from 'src/core/entities/playgrounds.entity';
import { PlaygroundsDocument } from 'src/infrastructure/database/entities/playgrounds.schema';

export class PlaygroundsMapper {
    static toDomain(doc: PlaygroundsDocument): Playgrounds | null {
        // Handle null or undefined documents
        if (!doc) {
            return null;
        }

        const playgrounds = new Playgrounds();
        playgrounds.id = doc.id.toString();
        playgrounds.userId = doc.userId;
        playgrounds.domainName = doc.domainName;
        playgrounds.name = doc.name;
        playgrounds.createdAt = doc.createdAt;
        playgrounds.updatedAt = doc.updatedAt;

        return playgrounds;
    }

    static toPersistence(playgrounds: Playgrounds): any {
        return {
            userId: playgrounds.userId,
            domainName: playgrounds.domainName,
            name: playgrounds.name,
            createdAt: playgrounds.createdAt,
            updatedAt: playgrounds.updatedAt,
        };
    }
}
