import { Persons } from 'src/core/entities/persons.entity';
import { PersonsDocument } from 'src/infrastructure/database/entities/persons.schema';

export class PersonsMapper {
    static toDomain(doc: PersonsDocument): Persons | null {
        // Handle null or undefined documents
        if (!doc) {
            return null;
        }

        const persons = new Persons();
        persons.id = doc.id.toString();
        persons.userId = doc.userId;
        persons.name = doc.name;
        persons.createdAt = doc.createdAt;
        persons.updatedAt = doc.updatedAt;

        return persons;
    }

    static toPersistence(persons: Persons): any {
        return {
            userId: persons.userId,
            name: persons.name,
            createdAt: persons.createdAt,
            updatedAt: persons.updatedAt,
        };
    }
}
