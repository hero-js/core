# @hero-js/core

`@hero-js/core` is a versatile library that provides tools for managing generic routes and handling HTTP requests in JavaScript and TypeScript applications. It is designed to simplify the process of creating and managing routes and request handling within your application.

**Please note**: `@hero-js/core` is a generic layer and should be used with specific web frameworks such as `express` or `fastify` to create web applications. You need to build an adapter for the framework you want to use, like express, fastify. Or you can use an already built adapter like [`@hero-js/express-adapter`](https://www.npmjs.com/package/@hero-js/express-adapter), `@hero-js/fastify-adapter`. The core library focuses on defining and managing routes, middleware, and request handling in a generic way.

## Features

- Define and manage generic routes for various HTTP methods (GET, POST, PUT, PATCH, DELETE).
- Add middleware to routes for handling requests.
- Create and configure routes with ease.

## Installation

You can install `@hero-js/core` via npm or yarn:

```bash
npm install @hero-js/core
```

or

```bash
yarn add @hero-js/core
```

## Usage

### Basic Usage

Here's a simple example of how to use `@hero-js/core` with a specific framework (e.g., Express):

```javascript
import { ExpressAdapter, Express } from '@hero-js/express-adapter';
import { Router } from '@hero-js/core';

const adapter = new ExpressAdapter();

// Create an instance of the router
const router = Router.create<Express>();

// Define routes and middleware
router.use((req, res, next) => {
  // Middleware logic
  next();
});

router.get('/', ({ response }) => {
  response.send('Health Ok!');
})

router.batchMiddleware(['LoggerMiddleware'])([
    router.get('/api', 'ArticleController.one'),
    // and other route

  ...router.batchMiddleware([
    'AuthMiddleware'
  ])([
    router.post('/api', 'ControllerName.create').middleware(['SerializerMiddleware']).register;
    // and other route
  ])
]);

// Use the ExpressAdapter to integrate with Express
const app = adapter.adapt(router);

// Start listening for requests
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

For more detailed usage examples and configurations, please refer to the documentation or examples in the repository.

## Documentation

For detailed documentation, API references, and usage examples, please visit the [official documentation](https://hero-js.github.io/core/).

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow the guidelines in [CONTRIBUTING](https://github.com/hero-js/hero/blob/main/CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/hero-js/core/blob/main/LICENSE) file for details.

## Changelog

For a history of changes to this module, see the [CHANGELOG](https://github.com/hero-js/core/blob/main/CHANGELOG.md) file.

## Acknowledgments

- Any acknowledgments or credits you want to give.
