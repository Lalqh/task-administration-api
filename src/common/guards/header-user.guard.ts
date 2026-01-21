import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class HeaderUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const raw = req.headers['x-user-id'];

    if (!raw) {
      throw new UnauthorizedException('Falta el header x-user-id');
    }

    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new UnauthorizedException('Header x-user-id inválido');
    }

    req.userId = id;
    return true;
  }
}