import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import DataLoader from 'dataloader';
// Импортируем типы из вашей новой сгенерированной папки Prisma 7
import {
  AuthorModel as PrismaAuthor,
  BookModel as PrismaBook,
} from '../generated/prisma/models.cjs';

@Injectable({ scope: Scope.REQUEST }) // Лоадер пересоздается на каждый HTTP-запрос
export class AuthorsLoader {
  constructor(private prisma: PrismaService) {}

  // 1. Загрузчик авторов по их ID (для поля Book.author)
  public readonly authorLoader = new DataLoader<number, PrismaAuthor | null>(
    async (ids) => {
      const authors = await this.prisma.author.findMany({
        where: { id: { in: [...ids] } },
      });
      const authorMap = new Map(authors.map((author) => [author.id, author]));
      return ids.map((id) => authorMap.get(id) || null);
    },
  );

  // 2. НОВЫЙ: Загрузчик книг по ID автора (для поля Author.books)
  public readonly booksByAuthorLoader = new DataLoader<number, PrismaBook[]>(
    async (authorIds) => {
      // Делаем ОДИН запрос в базу данных для всей пачки ID авторов
      const books = await this.prisma.book.findMany({
        where: { authorId: { in: [...authorIds] } },
      });

      // Группируем полученные книги по их authorId
      const booksByAuthorMap = new Map<number, PrismaBook[]>();
      books.forEach((book) => {
        if (!booksByAuthorMap.has(book.authorId)) {
          booksByAuthorMap.set(book.authorId, []);
        }
        booksByAuthorMap.get(book.authorId)!.push(book);
      });

      // Возвращаем массивы книг строго в том порядке, в котором пришли authorIds
      return authorIds.map((id) => booksByAuthorMap.get(id) || []);
    },
  );
}
