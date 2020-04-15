import { SetMetadata } from '@nestjs/common';

export const HasPermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
