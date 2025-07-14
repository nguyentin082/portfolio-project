export abstract class BaseMapper<T> {
  abstract toDomain(doc: T): T;

  abstract toPersistence(domain: Omit<T, 'id'>): Omit<T, 'id'>;
}
