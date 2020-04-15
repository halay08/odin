import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SearchPageableType } from "../search.pageable.type";

/**
 * Custom decorator.
 * Annotate injected variable(s) with `@Pageable()`.
 * *NOTE: you need to use ExecutionContext and switch to http when using interceptors.*
 * @type {(...dataOrPipes: Type<PipeTransform> | PipeTransform | any[]) => ParameterDecorator}
 */
export const SearchDecoratorsPageable = createParamDecorator((data: SearchPageableType, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest();
    return new SearchPageableType(request);

});
