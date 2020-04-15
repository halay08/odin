import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class ControllerInterceptor implements NestInterceptor {

    /**
     *
     * @param context
     * @param next
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        try {
            if(request.path) {
                return next
                    .handle()
                    .pipe(
                        map(async res => {
                                if(res) {
                                    return new ApiResponseType<any>(
                                        request.res.statusCode,
                                        res.message,
                                        res,
                                    )
                                } else {
                                    throw new ExceptionType(500, 'no response ');
                                }
                            },
                        ))
            } else {
                // for Rabbitmq RPC calls via rabbitmq
                return next
                    .handle()
                    .pipe(
                        map(async res => {
                                // rabbitmq subscribers will have no response
                                if(res) {
                                    return new ApiResponseType<any>(
                                        res ? res.statusCode : 200,
                                        res.message,
                                        res.data,
                                    )
                                }
                                return res;
                            },
                        ));
            }
        } catch (e) {
            console.error(e);
        }
    }
}

