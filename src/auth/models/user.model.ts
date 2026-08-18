import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType() // На основании этого класса NestJS сгенерирует "type User" в GraphQL схеме
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  // Поле password мы здесь НЕ объявляем, чтобы случайно не слить хеш пароля на фронтенд!
}
