import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Author } from '../../authors/models/author.model';

@ObjectType()
export class Book {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  genre: string;

  // Рекомендуется добавить это поле, чтобы фронтенд мог запросить id автора напрямую
  @Field(() => Int)
  authorId: number;

  // Стрелочная функция () => Author спасает от циклической зависимости в схеме GraphQL,
  // позволяя NestJS вычислить тип Author позже, когда оба класса будут загружены.
  @Field(() => Author)
  author: Author;
}
