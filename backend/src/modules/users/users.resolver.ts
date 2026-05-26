import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { UserGql } from './graphql/user.gql';

@Resolver(() => UserGql)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => UserGql)
  async me(@Context() ctx: any): Promise<UserGql> {
    const userId = Number(ctx?.req?.user?.sub);
    const user = await this.users.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username || user.email?.split('@')?.[0] || 'user',
      avatar: (user as any).avatar ?? null,
      role: user.role,
      createdAt: (user as any).createdAt ? new Date((user as any).createdAt) : undefined,
    };
  }
}
