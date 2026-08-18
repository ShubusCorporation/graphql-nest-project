import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  // Переопределяем метод, чтобы Passport искал данные внутри контекста GraphQL
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlCtx = ctx.getContext();

    // Для обычных запросов (HTTP) данные лежат в gqlCtx.req
    // Для подписок (WebSocket) данные лежат в gqlCtx.connectionParams
    if (gqlCtx.req) {
      return gqlCtx.req;
    }

    // Создаем фейковый объект запроса для совместимости с Passport во время WebSocket соединения
    return {
      headers: {
        authorization:
          gqlCtx.connectionParams?.Authorization ||
          gqlCtx.connectionParams?.authorization,
      },
    };
  }

  // Кастомизируем ошибку, если пользователь не авторизован
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Вы должны войти в систему для выполнения этого действия',
        )
      );
    }
    return user;
  }
}
