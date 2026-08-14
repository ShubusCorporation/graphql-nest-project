import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    // Настройка GraphQL (Code-First)
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: './schema.graphql', // Если  true, то схема .graphql будет генерироваться в памяти
      //playground: false, // ХАРДКОДОМ ОТКЛЮЧАЕМ СТАРЫЙ ИНТЕРФЕЙС
      subscriptions: {
        'graphql-ws': true, // Включаем real-time подписки
      },
      path: '/graphql',
      // Убедитесь, что контекст корректно обрабатывает соединения
      context: ({ req, connectionParams }) => ({ req, connectionParams }),
    }),
    // Подключаем все наши модули
    PrismaModule,
    AuthModule,
    AuthorsModule,
    BooksModule,
  ],
})
export class AppModule {}
