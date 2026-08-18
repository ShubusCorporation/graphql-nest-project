import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { AuthInputDto } from './dto/auth-input.dto';

/*
mutation RegisterMyUser {
  register(input: { email: "shubus.corporation@gmail.com", password: "123" }) {
    token
    user {
      id
      email
    }
  }
}

subscription {
  bookAdded {
    id
    title
    genre
  }
}
*/
@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayloadDto)
  async register(
    @Args('input') authInput: AuthInputDto, // Принимаем email и password как единый объект input
  ): Promise<AuthPayloadDto> {
    return this.authService.register(authInput);
  }

  @Mutation(() => AuthPayloadDto)
  async login(@Args('input') authInput: AuthInputDto): Promise<AuthPayloadDto> {
    return this.authService.login(authInput);
  }
}
