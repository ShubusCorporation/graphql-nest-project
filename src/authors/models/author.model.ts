import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Book } from '../../books/models/book.model';

@ObjectType() // Это говорит NestJS сгенерировать "type Author" в схеме
export class Author {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => [Book], { nullable: 'items' })
  books?: Book[];
}
