import { Client as WSClient, ExecutionResult } from 'graphql-ws';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

interface SubscribeOptions<
  Result,
  Variables extends Record<string, unknown> | undefined,
> {
  client: WSClient;
  query: TypedDocumentNode<Result, Variables>;
  variables?: Variables;
}

/**
 * Хелпер для подписки на WebSocket события в e2e тестах.
 * Полностью типизирован без использования 'any'.
 */
export function subscribeToGraphQL<
  Result,
  Variables extends Record<string, unknown> | undefined = undefined,
>({ client, query, variables }: SubscribeOptions<Result, Variables>) {
  const state = {
    // graphql-ws возвращает данные в формате ExecutionResult<Result>
    receivedData: null as ExecutionResult<Result> | null,
    error: null as unknown,
  };

  const unsubscribe = client.subscribe(
    {
      query: print(query), // Переводим AST-объект запроса в валидную GraphQL-строку
      variables,
    },
    {
      next: (payload) => {
        // payload автоматически типизируется как ExecutionResult<Result>
        state.receivedData = payload as ExecutionResult<Result>;
      },
      error: (err) => {
        state.error = err;
      },
      complete: () => {},
    },
  );

  return {
    get data() {
      return state.receivedData?.data;
    },
    get errors() {
      return state.receivedData?.errors;
    },
    get error() {
      return state.error;
    },
    unsubscribe,
  };
}
