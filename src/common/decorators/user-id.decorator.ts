import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const raw = req.header('x-user-id');
  if (!raw) return undefined;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new BadRequestException('Invalid x-user-id header');
  return id;
});