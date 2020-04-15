import { SetMetadata } from '@nestjs/common';

export const HasRoles = (...roles: string[]) => SetMetadata('roles', roles);
