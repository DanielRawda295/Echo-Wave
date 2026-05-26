import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { UserGql } from '../../users/graphql/user.gql';

@ObjectType('Track')
export class TrackGql {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  artist!: string;

  @Field({ nullable: true })
  genre?: string;

  @Field()
  fileUrl!: string;

  @Field({ nullable: true })
  coverUrl?: string;

  @Field(() => Int)
  playCount!: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => UserGql, { nullable: true })
  uploader?: UserGql;
}

@ObjectType('TrackLikeInfo')
export class TrackLikeInfoGql {
  @Field(() => Int)
  trackId!: number;

  @Field(() => Int)
  likeCount!: number;

  @Field()
  liked!: boolean;
}

@ObjectType('TrackComment')
export class TrackCommentGql {
  @Field(() => Int)
  id!: number;

  @Field()
  text!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => UserGql, { nullable: true })
  user?: UserGql;
}

