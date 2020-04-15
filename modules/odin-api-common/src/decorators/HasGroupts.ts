import { SetMetadata } from '@nestjs/common';

export const HasGroups = (...groups: string[]) => SetMetadata('groups', groups);
