import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('Password session revocation', () => {
  it('replaces a reset password and increments its session version atomically', async () => {
    const account = { id: 7, tokenVersion: 2 };
    const query = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const repo = {
      findOne: jest.fn().mockResolvedValue(account),
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    const service = new UsersService(repo as never, {} as never, {} as never);
    await service.update(7, { password: 'Updated-password1!' });
    expect(query.update).toHaveBeenCalledWith(User);
    expect(query.where).toHaveBeenCalledWith('id = :id', { id: 7 });
    const changes = query.set.mock.calls[0][0];
    expect(changes.tokenVersion()).toBe('"tokenVersion" + 1');
    expect(await bcrypt.compare('Updated-password1!', changes.password)).toBe(true);
    expect(query.execute).toHaveBeenCalledTimes(1);
  });
});
