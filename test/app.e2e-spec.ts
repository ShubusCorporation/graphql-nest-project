import { gql } from './generated/gql'; // After `npx graphql-codegen` remove import from @graphql-typed-document-node/core
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createClient, Client as WSClient } from 'graphql-ws';
import WebSocket from 'ws';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Server } from 'http';
import { subscribeToGraphQL } from './utils/ws-helper';

// npx graphql-codegen
// npm run test:e2e

const BOOK_ADDED_SUBSCRIPTION = gql(`
  subscription OnBookAdded {
    bookAdded {
      title
    }
  }
`);

describe('GraphQL Performance & E2E Tests', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let wsClient: WSClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    httpServer = app.getHttpServer();
    // Поднимаем сервер на тестовом порту для веб-сокетов
    await app.listen(3001);
  });

  afterAll(async () => {
    if (wsClient) {
      await wsClient.dispose();
    }
    await prisma.$disconnect();
    await httpServer.close();
    await app.close();
  });

  beforeEach(() => {
    prisma.resetQueryCount(); // Сбрасываем счетчик SQL-запросов перед каждым тестом
  });

  // 1. ТЕСТ НА ОТСУТСТВИЕ N+1 ЗАПРОСОВ (ЧЕРЕЗ DATALOADER)
  it('should fetch authors and books WITHOUT N+1 problem (exactly 2 queries)', async () => {
    const response = await request(httpServer).post('/graphql').send({
      query: 'query { authors { name books { title } } }',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.authors).toBeDefined();

    // Благодаря DataLoader должно выполниться строго 2 SQL-запроса:
    // 1. SELECT * FROM "Author"
    // 2. SELECT * FROM "Book" WHERE "authorId" IN (...)
    expect(prisma.queryCount).toBe(2);
  });

  // 2. ТЕСТ НА СРАБАТЫВАНИЕ REAL-TIME ПОДПИСОК (WEBSOCKET)
  it('should receive real-time event via Subscription', async () => {
    wsClient = createClient({
      url: 'ws://localhost:3001/graphql',
      webSocketImpl: WebSocket,
    });

    // 2. Используем наш хелпер
    const sub = subscribeToGraphQL({
      client: wsClient,
      query: BOOK_ADDED_SUBSCRIPTION,
    });

    await new Promise((res) => setTimeout(res, 200));

    await request(httpServer).post('/graphql').send({
      query:
        'mutation { addBook(title: "E2E Book", genre: "Testing", authorId: 1) { id title } }',
    });

    await new Promise((res) => setTimeout(res, 200));

    // 3. IDE теперь знает, что тут есть bookAdded и title! Строгая типизация.
    expect(sub.data?.bookAdded?.title).toBe('E2E Book');
    sub.unsubscribe();
  });
});
