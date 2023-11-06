import Context from '@hero-js/context';
import {
  GenericTypes,
  RequestHandler,
  RequestHandlerParams,
} from '../interfaces/router';

/**
 * The Middleware class serves as a model for defining methods that will be used by other middlewares or controllers.
 * It includes basic methods like 'handler', which returns the module name of the class,
 * and 'responseBuilder', which determines the format of the responses.
 * The 'handle' method must be implemented, even if it is not necessary in a controller.
 */
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

  /**
   * Builds a response from a string, number, or object.
   * @param {string | number | T} res - The response to build.
   * @returns {string | number | T} - The built response.
   */
  responseBuilder<T extends Record<string, any> = Record<string, any>>(
    res: string | number | T
  ): string | number | T {
    return res;
  }
}
