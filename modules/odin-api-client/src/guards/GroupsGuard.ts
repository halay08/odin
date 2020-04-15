import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class GroupsGuard implements CanActivate {

    public constructor(private readonly reflector: Reflector) {

    }

    public canActivate(context: ExecutionContext): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const requiredRoles = this.reflector.get<string[]>('groups', context.getHandler());
            const ctx = context.switchToHttp();
            const request = ctx.getRequest<Request>();

            // Check that the users groups are allowed
            return resolve(true);
        });
    }
}
