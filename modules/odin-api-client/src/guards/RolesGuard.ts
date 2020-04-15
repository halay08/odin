import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector }                                 from '@nestjs/core';
import { Request }                                   from 'express';
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";

@Injectable()
export class RolesGuard implements CanActivate {

    public constructor(private readonly reflector: Reflector) {

    }

    public canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        return new Promise<boolean>((resolve, reject) => {
            for ( let i = 0; i < requiredRoles.length; i++ ) {
                if ( request['principal'].roles.find(role => role.name === requiredRoles[i]) ) {
                    return resolve(true);
                }
            }
            return reject(new ExceptionType(403, 'forbidden resource'));
        });
    }
}
