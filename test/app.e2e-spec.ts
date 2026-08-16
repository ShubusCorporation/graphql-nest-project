import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// npm run test:e2e

describe('GraphQL Performance & E2E Tests', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: PrismaService;
  let wsClient: any;

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
    if (wsClient) wsClient.dispose();
    await app.close();
  });

  beforeEach(() => {
    prisma.resetQueryCount(); // Сбрасываем счетчик SQL-запросов перед каждым тестом
  });

  // 1. ТЕСТ НА ОТСУТСТВИЕ N+1 ЗАПРОСОВ (ЧЕРЕЗ DATALOADER)
  it('should fetch authors and books WITHOUT N+1 problem (exactly 2 queries)', async () => {
    const response = await request(httpServer)
      .post('/graphql')
      .send({
        query: `query { authors { name books { title } } }`,
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

    let receivedData: any = null;

    const unsubscribe = wsClient.subscribe(
      { query: 'subscription { bookAdded { title } }' },
      {
        next: (data: any) => { receivedData = data; },
        error: (err: any) => { console.error(err); },
        complete: () => {},
      },
    );

    // Даем сокету время на установку соединения
    await new Promise((res) => setTimeout(res, 200));

    // Вызываем HTTP мутацию, которая генерирует событие в PubSub
    await request(httpServer)
      .post('/graphql')
      .send({
        query: `mutation { addBook(title: "E2E Book", genre: "Testing", authorId: 1) { id title } }`,
      });

    // Ожидаем прохождения события по WebSocket
    await new Promise((res) => setTimeout(res, 200));

    expect(receivedData?.data?.bookAdded?.title).toBe('E2E Book');
    unsubscribe();
  });
});
