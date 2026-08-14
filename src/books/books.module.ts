import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';
import { BooksSubscriptionResolver } from './books-subscription.resolver';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [AuthorsModule], // Импортируем модуль авторов, чтобы взять оттуда AuthorsLoader
  providers: [BooksResolver, BooksSubscriptionResolver],
})
export class BooksModule {}
