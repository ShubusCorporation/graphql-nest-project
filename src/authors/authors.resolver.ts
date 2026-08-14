import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorsLoader } from './authors.loader';

// Импортируем GraphQL-модели для декораторов NestJS
import { Author as GqlAuthor } from './models/author.model';
import { Book as GqlBook } from '../books/models/book.model';

// Импортируем Prisma-модели для типизации данных из БД
import type { AuthorModel as PrismaAuthor, BookModel as PrismaBook } from '../generated/prisma/models.cjs';

@Resolver(() => GqlAuthor)
export class AuthorsResolver {
  constructor(
    private prisma: PrismaService,
    private authorsLoader: AuthorsLoader, // Внедряем лоадер через конструктор
  ) {}

  // Получить всех авторов
  @Query(() => [GqlAuthor]) 
  async authors(): Promise<PrismaAuthor[]> {
    return this.prisma.author.findMany();
  }

  // Разрешение поля "books" внутри каждого автора БЕЗ проблемы N+1
  @ResolveField(() => [GqlBook])
  async books(@Parent() author: PrismaAuthor): Promise<PrismaBook[]> {
    // Вместо этого: return this.prisma.book.findMany({ where: { authorId: author.id } });
    // Используем пакетную загрузку:
    return this.authorsLoader.booksByAuthorLoader.load(author.id);
  }
}
