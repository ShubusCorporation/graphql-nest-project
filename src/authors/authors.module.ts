import { Module } from '@nestjs/common';
import { AuthorsResolver } from './authors.resolver';
import { AuthorsLoader } from './authors.loader';

@Module({
  providers: [AuthorsResolver, AuthorsLoader],
  exports: [AuthorsLoader], // Экспортируем лоадер, чтобы BooksResolver мог внедрить его к себе
})
export class AuthorsModule {}
