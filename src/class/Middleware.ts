import Context from '@hero-js/context';
import {
  GenericTypes,
  RequestHandlerParams
} from '../interfaces/router';

export default abstract class Middleware<G extends GenericTypes> {
  static moduleName?: string;

  context: Context | null;

  request: RequestHandlerParams<G>['request'];

  response: G['R'];

  constructor({
    context,
    request,
    response,
  }: {
    context: Context | null;
    request: RequestHandlerParams<G>['request'];
    response: G['R'];
  }) {
    this.context = context;
    this.response = response;
    this.request = request;
  }

  abstract handle(params: RequestHandlerParams<G>): any;

  static handler(c: typeof Middleware, name: string) {
    if (!c.moduleName) throw new Error(`Module name not defined in ${c.name}`);
    return `${c.moduleName}.${name}`;
  }

  responseBuilder(res: string | number | G['R']) {
    return res;
  }
}
