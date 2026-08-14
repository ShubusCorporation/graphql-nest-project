import { Field, InputType } from '@nestjs/graphql';

@InputType() // Этот декоратор говорит NestJS, что класс является аргументом (input) в GraphQL
export class AuthInputDto {
  @Field()
  email: string;

  @Field()
  password: string;
}
