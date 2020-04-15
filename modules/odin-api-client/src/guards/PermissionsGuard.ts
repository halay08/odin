import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector }                                 from '@nestjs/core';
import { Request, Response }                         from 'express';
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";

@Injectable()
export class PermissionsGuard implements CanActivate {

    public constructor(private readonly reflector: Reflector) {

    }

    public canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        return new Promise<boolean>((resolve, reject) => {

            for ( let i = 0; i < requiredPermissions.length; i++ ) {
                for ( let j = 0; j < request['principal'].roles.length; j++ ) {
                    if ( request['principal'].roles[j].permissions.find(permission => permission.name === requiredPermissions[i]) ) {
                        return resolve(true);
                    }
                }
            }

            return reject(new ExceptionType(403, 'forbidden resource'));
        });
    }
}
