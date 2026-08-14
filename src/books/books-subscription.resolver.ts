import { Resolver, Subscription } from '@nestjs/graphql';
import { Book as GqlBook } from './models/book.model';
import { pubSub } from './books.signals'; // general pubsub

@Resolver(() => GqlBook)
export class BooksSubscriptionResolver {
  // Конструктор ПУСТОЙ — этот резолвер гарантированно статичен (Singleton)
  
  @Subscription(() => GqlBook)
  bookAdded() {
    return pubSub.asyncIterableIterator(['bookAdded']);
  }
}
