# Spring Boot Typed API

This document describes the type-safe API for injecting Spring Boot modules and overriding properties in JHipster applications.

## Overview

The typed API provides compile-time type safety when working with Spring Boot modules and properties, reducing runtime errors and improving developer experience. It allows you to:

- Inject Spring Boot modules with type safety
- Override Spring Boot properties with validation
- Add dependencies with type checking
- Chain multiple configurations together

## Basic Usage

### Injecting Spring Boot Modules

```typescript
import { SpringBoot } from './support/typed-api.js';

// Inject JWT authentication
await this.injectSpringBootModule(SpringBoot.jwt().getModules()[0]);

// Inject MongoDB support
await this.injectSpringBootModule(SpringBoot.mongodb().getModules()[0]);

// Inject Spring Cache
await this.injectSpringBootModule(SpringBoot.cache().getModules()[0]);
```

### Overriding Properties

```typescript
import { SpringProperties } from './support/typed-api.js';

// Override server port
this.overrideSpringBootProperty(SpringProperties.serverPort(9090));

// Override database URL
this.overrideSpringBootProperty(SpringProperties.databaseUrl('jdbc:postgresql://localhost:5432/mydb'));

// Override logging level
this.overrideSpringBootProperty(SpringProperties.loggingLevel('com.example', 'DEBUG'));

// Override cache type
this.overrideSpringBootProperty(SpringProperties.cacheType('redis'));
```

### Adding Dependencies

```typescript
// Add a custom Spring Boot starter
this.addSpringBootDependency({
  groupId: 'com.example',
  artifactId: 'custom-spring-boot-starter',
  version: '1.0.0',
  scope: 'compile',
});

// Add dependency with exclusions
this.addSpringBootDependency({
  groupId: 'com.example',
  artifactId: 'problematic-lib',
  version: '2.0.0',
  exclusions: [
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-logging',
    },
  ],
});
```

## Advanced Usage

### Using the Injector Pattern

```typescript
import { SpringBoot, SpringProperties } from './support/typed-api.js';

// Create a custom injector with multiple modules and properties
const injector = SpringBoot.injector()
  .injectModule('jhipster:spring-boot:jwt', { enabled: true, priority: 1 })
  .injectModule('jhipster:spring-data:mongodb', { enabled: true, priority: 2 })
  .injectModule('spring-cache', {
    enabled: true,
    config: { cacheProvider: 'redis' }
  })
  .overrideProperty('server.port', 8080)
  .overrideProperty('spring.cache.type', 'redis')
  .addDependency({
    groupId: 'com.example',
    artifactId: 'custom-starter',
    version: '1.0.0',
  });

// Apply all configurations
await injector.applyTo(this);
```

### Profile-Specific Property Overrides

```typescript
// Override property with different values per profile
this.overrideSpringBootProperty({
  property: 'logging.level.root',
  value: 'INFO',
  profiles: {
    dev: 'DEBUG',
    prod: 'WARN',
    test: 'ERROR',
  },
});
```

### Custom Property Overrides

```typescript
import { SpringProperties } from './support/typed-api.js';

// Custom property with type safety
this.overrideSpringBootProperty(
  SpringProperties.custom('app.security.enabled', true, 'boolean')
);

// Complex object property
this.overrideSpringBootProperty(
  SpringProperties.custom('app.config', {
    timeout: 30000,
    retries: 3,
    features: ['feature1', 'feature2'],
  }, 'object')
);
```

## Module Reference

### Authentication Modules

- `SpringBoot.jwt()` - JWT authentication
- `SpringBoot.oauth2()` - OAuth2/OIDC authentication
- `SpringBoot.session()` - HTTP Session authentication

### Communication Modules

- `SpringBoot.feignClient()` - OpenFeign client for microservices
- `SpringBoot.websocket()` - WebSocket support

### Data Modules

- `SpringBoot.relational()` - Relational database support
- `SpringBoot.mongodb()` - MongoDB support
- `SpringBoot.cassandra()` - Apache Cassandra support
- `SpringBoot.couchbase()` - Couchbase support
- `SpringBoot.neo4j()` - Neo4j support

### Other Modules

- `SpringBoot.cache()` - Spring Cache abstraction
- `SpringBoot.cloudStream()` - Spring Cloud Stream

## Property Reference

### Common Properties

- `SpringProperties.serverPort(port: number)` - Server port
- `SpringProperties.databaseUrl(url: string)` - Database connection URL
- `SpringProperties.loggingLevel(logger: string, level: string)` - Logging level
- `SpringProperties.cacheType(type: string)` - Cache provider type

### Custom Properties

```typescript
SpringProperties.custom(property: string, value: T, type?: PropertyType)
```

## Type Safety Benefits

1. **Compile-time validation**: Module IDs and property names are validated at compile time
2. **Type-safe property values**: Property values are type-checked based on their intended type
3. **IntelliSense support**: IDEs provide auto-completion for modules and properties
4. **Reduced runtime errors**: Configuration errors are caught during development
5. **Better refactoring**: Renaming modules or properties will be caught by TypeScript

## Migration from Legacy API

### Before (Legacy)
```typescript
// Manual module composition (error-prone)
await this.composeWithJHipster('jhipster:spring-boot:jwt');
await this.composeWithJHipster('jhipster:spring-data:mongodb');

// Manual property setting (no validation)
this.jhipsterConfig['server.port'] = 8080;
this.jhipsterConfig['spring.datasource.url'] = 'jdbc:h2:mem:test';
```

### After (Typed API)
```typescript
// Type-safe module injection
await this.injectSpringBootModule(SpringBoot.jwt().getModules()[0]);
await this.injectSpringBootModule(SpringBoot.mongodb().getModules()[0]);

// Type-safe property overrides
this.overrideSpringBootProperty(SpringProperties.serverPort(8080));
this.overrideSpringBootProperty(SpringProperties.databaseUrl('jdbc:h2:mem:test'));
```

## Testing

The typed API includes comprehensive tests covering:

- Module injection with various configurations
- Property overrides with profile support
- Dependency management with exclusions
- Complex chaining scenarios
- Type safety validation

Run tests with:
```bash
npm test -- generators/spring-boot/support/typed-api.spec.ts
```

## Future Enhancements

- Integration with Spring Boot's `@ConfigurationProperties` for even stronger typing
- Runtime validation of property values
- Integration with Spring Boot Actuator for dynamic property updates
- Support for custom module registries
