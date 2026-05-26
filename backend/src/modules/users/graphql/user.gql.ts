import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('User')
export class UserGql {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  username!: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field()
  role!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;
}
