export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public channel?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
