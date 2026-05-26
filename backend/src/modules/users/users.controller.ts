// src/modules/users/users.controller.ts

import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';

/**
 * UsersController handles user-related endpoints
 * - /users/me -> get and update authenticated user's profile
 * - /users/:id -> get specific user by ID
 * - /users -> get all users
 */
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.findById(req.user.sub).then((user) => {
      if (!user) return null;
      const { password, ...safe } = user as any;
      return safe;
    });
  }

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto).then((user) => {
      const { password, ...safe } = user as any;
      return safe;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const updated = await this.usersService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword
    );
    const { password, ...safe } = updated as any;
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/deactivate')
  deactivate(@Req() req, @Body() dto: DeactivateAccountDto) {
    return this.usersService.deactivateAccount(req.user.sub, dto.password, dto.confirmPassword);
  }
}
