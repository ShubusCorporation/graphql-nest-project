import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../models/user.model'; // Импортируем нашу новую модель

@ObjectType()
export class AuthPayloadDto {
  @Field()
  token: string;

  @Field(() => User) // Явно указываем NestJS использовать GraphQL-тип User
  user: User;
}
