import {
  RouteSettings,
  RequestHandler,
  AllowedMethod,
  GenericTypes,
} from '../interfaces/router';
import Context from '@hero-js/Context';

/**
 * Class for managing generic routes.
 *
 * @template G - Generic types for request, response, and "next" function.
 */
export default class Router<G extends GenericTypes> {
  protected context: Context | null;
  protected routes: RouteSettings<G> = new Map();
  private lastMountedRouteKey?: string;

  /**
   * Create an instance of the Router class with an optional context.
   *
   * @param context - The context to use, or a volatile context by default.
   */
  constructor(context?: Context | null) {
    this.context = context ?? Context.createVolatileContext();
  }

  /**
   * Create a new instance of Router.
   *
   * @returns {Router<G>} A new instance of Router.
   */
  public static create<G extends GenericTypes>(): Router<G> {
    return new Router<G>();
  }

  /**
   * The `use` method mounts middleware on the specified path and handles requests with the given request handlers.
   * - When the first handler is a function, the path is automatically set to "*" (all routes).
   * - If the first handler is not a valid path starting with "/", it is considered as a middleware class name.
   *
   * @param {...(RequestHandler<G>)} handlers - The request handlers or path for middleware.
   * @returns {Router<G>} - The current router instance.
   *
   * @example
   * ```javascript
   * router.use(({req, res, next}: RequestHandlerParams<G extends GenericTypes>) => {
   *   // Middleware logic
   *   next();
   * });
   *
   * router.use('/api', MiddlewareClass.name);
   * ```
   */
  public use(...handlers: (RequestHandler<G>)[]): Router<G> {
    let path = '*';

    if (
      handlers.length > 1 &&
      typeof handlers[0] === 'string' &&
      handlers[0][0] === '/'
    ) {
      path = handlers[0];
      handlers.shift();
    } else {
      console.warn(
        'You have multiple handlers, and the first handler does not specify a valid path; it will be utilized as a middleware class name.'
      );
    }

    const handler = handlers.pop();

    if (handler) {
      this.mountRoutes('use', path, handler);
    }
    return this;
  }

  /**
   * The `post` method routes all HTTP POST requests to the specified path and handles them with the given request handler.
   *
   * @param path - The route's path.
   * @param handler - The request handler for the route.
   * @returns The current instance of the router.
   *
   * @example
   * ```javascript
   * router.post(({req, res, next}: RequestHandlerParams<GenericTypes>) => {
   *   // Controller logic
   *   return { hello: 'world' };
   * });
   *
   * router.post('/api', 'ControllerName.create');
   * ```
   */
  public post(path: string, handler: RequestHandler<G>) {
    this.mountRoutes('post', path.trim(), handler);
    return this;
  }

  /**
   * The `get` method routes all HTTP GET requests to the specified path and handles them with the given request handler.
   *
   * @param path - The route's path.
   * @param handler - The request handler for the route.
   * @returns The current instance of the router.
   *
   * @example
   * ```javascript
   * router.get(({req, res, next}: RequestHandlerParams<GenericTypes>) => {
   *   // Controller logic
   *   return "hello 'world'";
   * });
   *
   * router.get('/api', 'ControllerName.one');
   * ```
   */
  public get(path: string, handler: RequestHandler<G>) {
    this.mountRoutes('get', path.trim(), handler);
    return this;
  }

  /**
   * The `put` method routes all HTTP PUT requests to the specified path and handles them with the given request handler.
   *
   * @param path - The route's path.
   * @param handler - The request handler for the route.
   * @returns The current instance of the router.
   *
   * @example
   * ```javascript
   * router.put(({req, res, next}: RequestHandlerParams<GenericTypes>) => {
   *   // Controller logic
   *   return { hello: 'Goto' };
   * });
   *
   * router.put('/api', 'ControllerName.update');
   * ```
   */
  public put(path: string, handler: RequestHandler<G>) {
    this.mountRoutes('put', path.trim(), handler);
    return this;
  }

  /**
   * The `patch` method routes all HTTP PATCH requests to the specified path and handles them with the given request handler.
   *
   * @param path - The route's path.
   * @param handler - The request handler for the route.
   * @returns The current instance of the router.
   *
   * @example
   * ```javascript
   * router.patch(({req, res, next}: RequestHandlerParams<GenericTypes>) => {
   *   // Controller logic
   *   return { hello: 'Kitty' };
   * });
   *
   * router.patch('/api', 'ControllerName.patch');
   * ```
   */
  public patch(path: string, handler: RequestHandler<G>) {
    this.mountRoutes('patch', path.trim(), handler);
    return this;
  }

  /**
   * The `delete` method routes all HTTP DELETE requests to the specified path and handles them with the given request handler.
   *
   * @param path - The route's path.
   * @param handler - The request handler for the route.
   * @returns The current instance of the router.
   *
   * @example
   * ```javascript
   * router.delete(({req, res, next}: RequestHandlerParams<GenericTypes>) => {
   *   // Controller logic
   *   return { statusCode: 201 };
   * });
   *
   * router.delete('/api', 'ControllerName.delete');
   * ```
   */
  public delete(path: string, handler: RequestHandler<G>) {
    this.mountRoutes('delete', path.trim(), handler);
    return this;
  }

  /**
   * Add middleware to the currently mounted route.
   *
   * @param {RequestHandler<G>[]} middlewares - The middleware handlers.
   * @returns {Router<G>} - The current router instance.
   */
  public middleware(middlewares: RequestHandler<G>[]) {
    if (this.lastMountedRouteKey) {
      const route = this.routes.get(this.lastMountedRouteKey);

      route?.middlewares.unshift(...middlewares);
    }
    return this;
  }

  /**
   * Apply a batch of middlewares to selected routes.
   *
   * @param {RequestHandler<G>[]} middlewares - The middleware handlers.
   * @returns {(routeKeys: string[]) => Router<G>} - A function to apply middlewares to selected routes.
   */
  public batchMiddlewares(
    middlewares: (RequestHandler<G>)[]
  ): (routeKeys: string[]) => Router<G> {
    return (routeKeys: string[]) => {
      for (const routeKey of routeKeys) {
        const route = this.routes.get(routeKey);

        route?.middlewares.unshift(...middlewares);
      }
      return this;
    };
  }

  private mountRoutes(
    method: AllowedMethod,
    path: string,
    ...handlers: (RequestHandler<G>)[]
  ): void {
    this.lastMountedRouteKey = `${method}::${path}`;
    const route = this.routes.get(this.lastMountedRouteKey);

    handlers = handlers.filter((handler) => handler);

    if (route) route.middlewares.push(...handlers);
    else {
      this.routes.set(this.lastMountedRouteKey, {
        method,
        middlewares: handlers,
      });
    }
  }

  /**
   * Get the last mounted route key.
   *
   * @returns {string | undefined} - The last mounted route key.
   */
  get register(): string | undefined {
    return this.lastMountedRouteKey;
  }
}
