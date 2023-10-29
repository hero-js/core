import {
  RouteSettings,
  RequestHandler,
  GenericTypes,
  RouteStore,
  RouteKey,
  AllowedMethod,
  HTTP_METHOD,
} from '../interfaces/router';
import Context from '@hero-js/Context';
import { Treegen } from '@hero-js/treegen';
import path from 'path';

/**
 * Class for managing generic routes.
 *
 * @template G - Generic types for request, response, and "next" function.
 */
export default class Router<G extends GenericTypes> {
  protected context: Context | null;
  protected static routeStore: RouteStore<GenericTypes> = new Map();
  protected preloadedHandler: Map<
    string,
    { fullPath: string; middlewareClassName: string; MiddlewareClass?: any }
  > = new Map();
  protected lastMountedRouteKey?: RouteKey;
  protected name: string;
  protected fullPreload: boolean;

  /**
   * Create an instance of the Router class with an optional context.
   *
   * @param context - The context to use, or a volatile context by default.
   */
  constructor({
    name,
    context,
    fullPreload = false,
  }: { name?: string; context?: Context | null; fullPreload?: boolean } = {}) {
    this.context = context ?? Context.createVolatileContext();
    this.name = name ?? Math.random().toString(36).substring(3);
    this.fullPreload = fullPreload;

    if (!this.routes) Router.routeStore.set(this.name, new Map());
  }

  /**
   * Create a new instance of Router.
   *
   * @returns {Router<G>} A new instance of Router.
   */
  public static create<G extends GenericTypes>(name?: string): Router<G> {
    return new Router<G>({ name });
  }

  // public static use<G extends GenericTypes>(
  //   ...handlers: RequestHandler<G>[]
  // ): Router<G> {
  //   return Router.create<G>().use(...handlers);
  // }

  // public static post<G extends GenericTypes>(
  //   path: string,
  //   handler: RequestHandler<G>
  // ) {
  //   return Router.create<G>().post(path, handler);
  // }

  // public static get<G extends GenericTypes>(
  //   path: string,
  //   handler: RequestHandler<G>
  // ) {
  //   return Router.create<G>().get(path, handler);
  // }

  // public static put<G extends GenericTypes>(
  //   path: string,
  //   handler: RequestHandler<G>
  // ) {
  //   return Router.create<G>().put(path, handler);
  // }

  // public static patch<G extends GenericTypes>(
  //   path: string,
  //   handler: RequestHandler<G>
  // ) {
  //   return Router.create<G>().patch(path, handler);
  // }

  // public static delete<G extends GenericTypes>(
  //   path: string,
  //   handler: RequestHandler<G>
  // ) {
  //   return Router.create<G>().delete(path, handler);
  // }

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
  public use(...handlers: RequestHandler<G>[]): Router<G> {
    let path = '*';

    if (
      handlers.length > 1 &&
      typeof handlers[0] === 'string' &&
      handlers[0][0] === '/'
    ) {
      path = handlers[0];
      handlers.shift();
    }
    // else {
    //   console.warn(
    //     'You have multiple handlers, and the first handler does not specify a valid path; it will be utilized as a middleware class name.'
    //   );
    // }

    this.mountRoutes(HTTP_METHOD.USE, path, ...handlers);

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
  public post(path: string, ...handlers: RequestHandler<G>[]) {
    this.mountRoutes(HTTP_METHOD.POST, path.trim(), ...handlers);
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
  public get(path: string, ...handlers: RequestHandler<G>[]) {
    this.mountRoutes(HTTP_METHOD.GET, path.trim(), ...handlers);
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
  public put(path: string, ...handlers: RequestHandler<G>[]) {
    this.mountRoutes(HTTP_METHOD.PUT, path.trim(), ...handlers);
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
  public patch(path: string, ...handlers: RequestHandler<G>[]) {
    this.mountRoutes('patch', path.trim(), ...handlers);
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
  public delete(path: string, ...handlers: RequestHandler<G>[]) {
    this.mountRoutes('delete', path.trim(), ...handlers);
    return this;
  }

  /**
   * Add middleware to the currently mounted route.
   *
   * @param {RequestHandler<G>[]} middlewares - The middleware handlers.
   * @returns {{ register: RouteKey; }} - Object with the last mounted route key.
   */

  public middleware(middlewares: RequestHandler<G>[]): { register: RouteKey } {
    if (this.lastMountedRouteKey) {
      const route = this.routes.get(this.lastMountedRouteKey);

      route?.middlewares.unshift(...middlewares);
    }
    return { register: this.register };
  }

  /**
   * Apply a batch of middlewares to selected routes.
   *
   * @param {RequestHandler<G>[]} middlewares - The middleware handlers.
   * @returns {(routeKeys: string[]) => void} - A function to apply middlewares to selected routes.
   */
  public batchMiddlewares(
    middlewares: RequestHandler<G>[]
  ): (routeKeys: string[]) => void {
    return (routeKeys: string[]) => {
      for (const routeKey of routeKeys) {
        const route = this.routes.get(routeKey);

        route?.middlewares.unshift(...middlewares);
      }
    };
  }

  protected mountRoutes(
    method: AllowedMethod,
    path: string,
    ...handlers: RequestHandler<G>[]
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

  protected resolver(middleware: string) {
    const settings = this.preloadedHandler.get(middleware);

    if (!settings)
      throw new Error(
        `Falied to load "${middleware}", make sure that Router.preload is called before.`
      );

    const [, handler = 'handle'] = middleware.split('.');
    let { MiddlewareClass } = settings;
    const middlewareClassName = this.middlewareClassName(middleware);

    if (!MiddlewareClass) {
      MiddlewareClass = this.loadClass(settings.fullPath, middlewareClassName);
      settings.MiddlewareClass = MiddlewareClass;
    }

    if (!MiddlewareClass.prototype[handler]) {
      throw new Error(
        `Handler method '${handler}' not defined in '${middlewareClassName}'!`
      );
    }

    return { MiddlewareClass, handler };
  }

  private middlewareClassName(middleware: string) {
    let middlewareClassName =
      middleware.substring(0, middleware.indexOf('.')) || middleware;
    middlewareClassName =
      middlewareClassName[0].toUpperCase() + middlewareClassName.substring(1);
    return middlewareClassName;
  }

  /**
   * Loads a middleware class from a full path and a middleware class name.
   * 
   * @param fullPath - The full path of the middleware class file.
   * @param middlewareClassName - The name of the middleware class.
   * @throws {Error} Throws an exception if the middleware class cannot be loaded.
   * @returns The loaded middleware class.
   */
  protected loadClass(fullPath: string, middlewareClassName: string) {
    const loadedMiddleware = require(fullPath);

    const MiddlewareClass =
      loadedMiddleware.default || loadedMiddleware[middlewareClassName];

    if (!MiddlewareClass)
      throw new Error(`Failed to load Module ${middlewareClassName} !`);

    return MiddlewareClass;
  }

  protected preloadScanDir = Treegen.scanDir;

  /**
   * Preload middleware classes.
   *
   * @param fullPreload - Whether to preload all middleware classes.
   */
  protected preload() {
    const project = this.preloadScanDir({
      dirPath: process.cwd(),
    });

    const projectFiles = project
      .split('\n')
      .map((line) => line.replaceAll('>', '/'));

    for (const { middlewares } of this.routes.values()) {
      for (const middleware of middlewares) {
        if (typeof middleware === 'string') {
          this.preloadMiddleware(middleware, projectFiles);
        }
      }
    }
  }

  /**
   * Preload a single middleware.
   *
   * @param middleware - The name of the middleware.
   * @param projectFiles - List of project files.
   */
  protected preloadMiddleware(middleware: string, projectFiles: string[]) {
    if (this.preloadedHandler.has(middleware)) {
      return;
    }

    const middlewareFileName =
      middleware.substring(0, middleware.lastIndexOf('.')) || middleware;

    const relativePath = projectFiles.find((file) =>
      new RegExp(`.*${middlewareFileName}(\.ts|\.js)$`).test(file)
    );

    if (!relativePath) {
      throw new Error(
        `Failed to load '${middleware}'! Module ${middleware} does not exist in the project hierarchy.`
      );
    }

    const fullPath = path.join(
      process.cwd(),
      relativePath.substring(relativePath.indexOf('/'))
    );

    const middlewareClassName = this.middlewareClassName(middleware);
    const settings = {
      fullPath,
      middlewareClassName,
      MiddlewareClass: undefined,
    };

    if (this.fullPreload) {
      const MiddlewareClass = this.loadClass(fullPath, middlewareClassName);
      settings.MiddlewareClass = MiddlewareClass;
    }

    this.preloadedHandler.set(middleware, settings);
  }

  /**
   * Get the last mounted route key.
   *
   * @returns {RouteKey} - The last mounted route key.
   */
  get register(): RouteKey {
    return this.lastMountedRouteKey as RouteKey;
  }

  protected get routes() {
    return Router.routeStore.get(this.name) as RouteSettings<G> & {
      resolver: Router<G>['resolver'];
    };
  }
}
