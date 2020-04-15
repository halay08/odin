import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    public catch(exception: any, host: ArgumentsHost): void {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const clazz = exception.constructor.name;

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const status = exception.status || statusCode || exception.statusCode;
        console.error(`GlobalExceptionsFilter: ${clazz}: ${JSON.stringify(exception)}`);

        if(clazz === 'BadRequestException') {
            response.status(400).json({
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: exception.message['message'] || exception.response['message'] || exception.message,
                validation: [],
            });
        } else if(clazz === 'ExceptionType') {
            response.status(exception.statusCode || 500).json({
                statusCode: exception.statusCode || 500,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: exception.message,
                validation: exception.validation,
                data: exception.data,
            });
        } else if(clazz === 'QueryFailedError') {
            if(exception.message.indexOf('duplicate key') >= -1) {
                response.status(HttpStatus.CONFLICT).json({ message: 'a similar record already exists' });
            }
        } else if([
            'UnauthorizedException',
            'NotFoundException',
            'ForbiddenException',
            'NotAcceptableException',
            'RequestTimeoutException',
            'ConflictException',
            'GoneException',
            'PayloadTooLargeException',
            'UnsupportedMediaTypeException',
            'HttpException',
            'GatewayTimeoutException',
            'ServiceUnavailableException',
            'UnprocessableEntityException',
            'BadGatewayException',
            'NotImplementedException',
            'InternalServerErrorException',
        ].includes(clazz)) {

            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: exception.message['message'] || exception.message['error'] || exception.message,
                validation: [],
            });
        } else {
            console.error(`GlobalExceptionsFilter: Unknown exception class ${clazz}: ${JSON.stringify(exception)}`);
            response.status(status).json(exception);
        }
    }
}
