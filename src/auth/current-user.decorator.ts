import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    // Достаем пользователя, которого туда бережно положил JwtStrategy
    const req = ctx.getContext().req;
    if (req?.user) return req.user;

    // Если это WebSocket
    return ctx.getContext().connectionParams?.user;
  },
);
