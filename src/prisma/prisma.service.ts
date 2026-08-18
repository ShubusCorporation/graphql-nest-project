// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.cjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public queryCount = 0;
  private readonly isTestEnvironment = process.env.NODE_ENV === 'test';

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL must be set before starting the application.',
      );
    }

    // Передаем адаптер и динамически добавляем логирование для тестов
    super({
      adapter: new PrismaPg({ connectionString }),
      log:
        process.env.NODE_ENV === 'test'
          ? [{ emit: 'event', level: 'query' } as const]
          : [],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Подписываемся на события перехвата SQL-запросов только в тестах
    if (this.isTestEnvironment) {
      // @ts-expect-error PrismaClient does not know about extended logging events in the base types
      this.$on('query', () => {
        this.queryCount++;
      });
    }
  }

  public resetQueryCount() {
    if (this.isTestEnvironment) {
      this.queryCount = 0;
    }
  }
}
