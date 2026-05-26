import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('PlaylistItem')
export class PlaylistItemGql {
  @Field()
  externalId!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  artist?: string;

  @Field({ nullable: true })
  artwork?: string;

  @Field({ nullable: true })
  previewUrl?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  addedAt?: Date;
}

@ObjectType('Playlist')
export class PlaylistGql {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => [PlaylistItemGql])
  items!: PlaylistItemGql[];
}

@ObjectType('Success')
export class SuccessGql {
  @Field()
  success!: boolean;
}

@InputType('PlaylistItemInput')
export class PlaylistItemInput {
  @Field()
  externalId!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  artist?: string;

  @Field({ nullable: true })
  artwork?: string;

  @Field({ nullable: true })
  previewUrl?: string;
}

