import path from 'path';
import Router from '../class/Router'; // Adjust the import path as needed
import { GenericTypes, RequestHandler } from '../interfaces/router';

type G = GenericTypes<() => string>;

describe('Router', () => {
  it('should create an instance of Router', () => {
    const router = Router.create<G>();
    expect(router).toBeInstanceOf(Router);
  });

  it('should add a "use" route with middleware', () => {
    const router = Router.create<G>();
    router.use(({ request, response, next }) => {
      // Middleware logic
      next();
    });
    const route = router['routes'].get('use::*');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "post" route', () => {
    const router = Router.create<G>();
    router.post('/api', 'ControllerName.create');
    const route = router['routes'].get('post::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "get" route', () => {
    const router = Router.create<G>();
    router.get('/api', 'ControllerName.one');
    const route = router['routes'].get('get::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "put" route', () => {
    const router = Router.create<G>();
    router.put('/api', 'ControllerName.update');
    const route = router['routes'].get('put::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "patch" route', () => {
    const router = Router.create<G>();
    router.patch('/api', 'ControllerName.patch');
    const route = router['routes'].get('patch::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add a "delete" route', () => {
    const router = Router.create<G>();
    router.delete('/api', 'ControllerName.delete');
    const route = router['routes'].get('delete::/api');
    expect(route).toBeDefined();
    expect(route?.middlewares).toHaveLength(1);
  });

  it('should add middleware to the last mounted route', () => {
    const router = Router.create<G>();
    router.use(({ request, response, next }) => {
      // Middleware logic
      next();
    });
    router.use(({ request, response, next }) => {
      // Another middleware logic
      next();
    });
    router.middleware([
      ({ request, response, next }) => {
        // Additional middleware
        next();
      },
    ]);

    const route = router['routes'].get('use::*');
    expect(route?.middlewares).toHaveLength(3);
  });

  it('should apply batch middlewares to selected routes', () => {
    const router = Router.create<G>();

    const routeKeys = ['use::*', 'post::/api', 'get::/api'];
    const middlewares: RequestHandler<G>[] = [
      ({ request, response, next }) => {
        // Batch middleware logic
        next();
      },
    ];

    router.batchMiddlewares(middlewares)([
      router.use(({ request, response, next }) => {
        // Middleware logic
        next();
      }, 'MiddlewareName').register,
      router
        .post('/api', 'ControllerName.create')
        .middleware([({ next }) => next()]).register,
      router
        .get('/api', 'ControllerName.one')
        .middleware([({ next }) => next()]).register,
    ]);

    console.log(router['routes'].get('use::*')?.middlewares);

    for (const routeKey of routeKeys) {
      const route = router['routes'].get(routeKey);
      expect(route?.middlewares).toHaveLength(3); // 1 with method + 1 middleware + 1 batch middleware
    }
  });

  describe('preload', () => {
    it('should preload middleware classes', () => {
      // Create an instance of your Router class
      const router = new Router({ fullPreload: true });

      // Define some sample middleware names
      const middlewareNames = ['Middleware1', 'Middleware2'];

      router['routes'].set('get::/route1', {
        middlewares: [middlewareNames[0]],
      } as any);
      router['routes'].set('post::/route2', {
        middlewares: [middlewareNames[1]],
      } as any);

      // Mock the Treegen.scanDir function to return file paths
      const mockScanDir = jest.fn(
        ({ dirPath = process.cwd() }: { dirPath: string }) => {
          return middlewareNames
            .map((name) => `root>${name}.js`)
            .join('\n') as any;
        }
      );

      class MyMiddleware {}

      // Mock the loadClass function to simulate loading classes
      const mockLoadClass = jest.fn(
        (fullPath, middlewareClassName) => MyMiddleware
      );

      // Mock the preloadMiddleware function to simulate preloading middlewares
      const mockPreloadMiddleware = jest.fn((middleware, projectFiles) => {
        const fullPath = path.join(process.cwd(), `/${middleware}.js`);

        if (router['fullPreload'])
          router['loadClass'](
            fullPath,
            router['middlewareClassName'](middleware)
          );

        router['preloadedHandler'].set(middleware, {
          fullPath,
          middlewareClassName: router['middlewareClassName'](middleware),
          MiddlewareClass: router['fullPreload'] ? MyMiddleware : undefined,
        });
      });

      // Replace the original methods with mocks
      router['preloadMiddleware'] = mockPreloadMiddleware;
      router['preloadScanDir'] = mockScanDir;
      router['loadClass'] = mockLoadClass;

      // Call the preload method
      router['preload']();

      // Assert that the scanDir and loadClass functions were called with the correct arguments
      expect(mockScanDir).toHaveBeenCalled();
      expect(mockLoadClass).toHaveBeenCalledWith(
        path.join(process.cwd(), `/${middlewareNames[0]}.js`),
        'Middleware1'
      );
      expect(mockLoadClass).toHaveBeenCalledWith(
        path.join(process.cwd(), `/${middlewareNames[1]}.js`),
        'Middleware2'
      );
      expect(mockPreloadMiddleware).toHaveBeenCalledWith('Middleware1', [
        'root/Middleware1.js',
        'root/Middleware2.js',
      ]);
      expect(mockPreloadMiddleware).toHaveBeenCalledWith('Middleware2', [
        'root/Middleware1.js',
        'root/Middleware2.js',
      ]);

      // Check if the preloadedHandler map has the expected entries
      expect(router['preloadedHandler']).toEqual(
        new Map<string, any>([
          [
            'Middleware1',
            {
              fullPath: 'E:\\project\\herojs\\packages\\core\\Middleware1.js',
              middlewareClassName: 'Middleware1',
              MiddlewareClass: MyMiddleware,
            },
          ],
          [
            'Middleware2',
            {
              fullPath: 'E:\\project\\herojs\\packages\\core\\Middleware2.js',
              middlewareClassName: 'Middleware2',
              MiddlewareClass: MyMiddleware,
            },
          ],
        ])
      );
    });
  });
});
