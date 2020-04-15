import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SearchQueryType } from "../search.query.type";

/**
 * Custom decorator for method injection.
 * *NOTE: you need to use ExecutionContext and switch to http when using interceptors.
 * @type {(...dataOrPipes: Type<PipeTransform> | PipeTransform | any[]) => ParameterDecorator}
 */
export const SearchDecoratorsSearchable = createParamDecorator((data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return new SearchQueryType(request);

});
