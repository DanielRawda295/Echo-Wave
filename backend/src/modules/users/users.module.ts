// src/modules/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { DeactivatedAccount } from './entities/deactivated-account.entity';
import { UsersResolver } from './users.resolver';
import { MediaStorageModule } from '../tracks/media-storage.module';

/**
 * UsersModule registers the User entity with TypeORM
 * and provides UsersService and UsersController
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, DeactivatedAccount]), MediaStorageModule],
  providers: [UsersService, UsersResolver],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
