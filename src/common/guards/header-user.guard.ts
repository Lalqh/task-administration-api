import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class HeaderUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const raw = req.headers['x-user-id'];

    if (raw) {
      const id = Number(raw);
      if (!Number.isInteger(id) || id <= 0) {
        throw new UnauthorizedException('Header x-user-id inválido');
      }
      req.userId = id;
      return true;
    }

    if (isPublic) return true;

    throw new UnauthorizedException('Falta el header x-user-id');
  }
}
