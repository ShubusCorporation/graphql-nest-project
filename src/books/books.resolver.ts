import {
  Resolver,
  Query,
  Mutation,
  ResolveField,
  Parent,
  Args,
  Int,
} from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorsLoader } from '../authors/authors.loader';
import { Book as GqlBook } from './models/book.model';
import { Author as GqlAuthor } from '../authors/models/author.model';
import type { BookModel, AuthorModel } from '../generated/prisma/models.cjs';
import { pubSub } from './books.signals'; // general pubsub

@Resolver(() => GqlBook)
export class BooksResolver {
  constructor(
    private prisma: PrismaService,
    private authorsLoader: AuthorsLoader, // Оставляем лоадер здесь
  ) {}

  @Query(() => [GqlBook], { name: 'books' })
  async getBooks(): Promise<BookModel[]> {
    return this.prisma.book.findMany();
  }

  @ResolveField(() => GqlAuthor)
  async author(@Parent() book: BookModel): Promise<AuthorModel | null> {
    return this.authorsLoader.authorLoader.load(book.authorId);
  }

  @Mutation(() => GqlBook)
  async addBook(
    @Args('title') title: string,
    @Args('genre') genre: string,
    @Args('authorId', { type: () => Int }) authorId: number,
  ): Promise<BookModel> {
    const newBook = await this.prisma.book.create({
      data: { title, genre, authorId },
    });
    pubSub.publish('bookAdded', { bookAdded: newBook }); // Публикуем событие
    return newBook;
  }
}
