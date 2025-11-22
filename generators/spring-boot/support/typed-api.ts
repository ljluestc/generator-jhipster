/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Spring Boot module identifiers with type safety */
export const SPRING_BOOT_MODULES = {
  // Authentication modules
  JWT: 'jhipster:spring-boot:jwt',
  OAUTH2: 'jhipster:spring-boot:oauth2',
  SESSION: 'jhipster:spring-boot:session',

  // Testing modules
  CUCUMBER: 'jhipster:spring-boot:cucumber',

  // Communication modules
  FEIGN_CLIENT: 'jhipster:spring-boot:feign-client',
  WEBSOCKET: 'jhipster:spring-boot:websocket',

  // Gateway
  GATEWAY: 'jhipster:spring-cloud:gateway',
} as const;

export type SpringBootModuleId = (typeof SPRING_BOOT_MODULES)[keyof typeof SPRING_BOOT_MODULES];

/** Spring Data module identifiers */
export const SPRING_DATA_MODULES = {
  RELATIONAL: 'jhipster:spring-data:relational',
  CASSANDRA: 'jhipster:spring-data:cassandra',
  COUCHBASE: 'jhipster:spring-data:couchbase',
  MONGODB: 'jhipster:spring-data:mongodb',
  NEO4J: 'jhipster:spring-data:neo4j',
  ELASTICSEARCH: 'jhipster:spring-data:elasticsearch',
} as const;

export type SpringDataModuleId = (typeof SPRING_DATA_MODULES)[keyof typeof SPRING_DATA_MODULES];

/** Other Spring modules */
export const SPRING_MODULES = {
  CACHE: 'spring-cache',
  CLOUD_STREAM: 'spring-cloud-stream',
} as const;

export type SpringModuleId = (typeof SPRING_MODULES)[keyof typeof SPRING_MODULES];

/**
 * All available Spring Boot module identifiers
 */
export type SpringBootModule = SpringBootModuleId | SpringDataModuleId | SpringModuleId;

/**
 * Configuration for Spring Boot module injection
 */
export interface SpringBootModuleConfig {
  /** Module identifier */
  module: SpringBootModule;
  /** Whether the module is enabled */
  enabled: boolean;
  /** Module-specific configuration */
  config?: Record<string, any>;
  /** Priority for module loading (lower numbers load first) */
  priority?: number;
}

/**
 * Type-safe property override configuration
 */
export interface SpringBootPropertyOverride<T = any> {
  /** Property name (dot-notation path) */
  property: string;
  /** Property value */
  value: T;
  /** Property type for validation */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Whether to override existing values */
  override?: boolean;
  /** Environment-specific overrides */
  profiles?: Record<string, T>;
}

/**
 * Typed Spring Boot dependency configuration
 */
export interface SpringBootDependencyConfig {
  /** Group ID */
  groupId: string;
  /** Artifact ID */
  artifactId: string;
  /** Version (optional, uses BOM version if not specified) */
  version?: string;
  /** Scope */
  scope?: 'compile' | 'runtime' | 'test' | 'provided';
  /** Whether this dependency is optional */
  optional?: boolean;
  /** Exclusions */
  exclusions?: Array<{
    groupId: string;
    artifactId: string;
  }>;
}

/**
 * Spring Boot module injection API
 */
export class SpringBootModuleInjector {
  private modules: SpringBootModuleConfig[] = [];
  private propertyOverrides: SpringBootPropertyOverride[] = [];
  private dependencies: SpringBootDependencyConfig[] = [];

  /**
   * Inject a Spring Boot module with type safety
   */
  injectModule<T extends SpringBootModule>(module: T, config: Omit<SpringBootModuleConfig, 'module'> = { enabled: true }): this {
    this.modules.push({
      module,
      ...config,
    });
    return this;
  }

  /**
   * Override a Spring Boot property with type safety
   */
  overrideProperty<T>(property: string, value: T, options: Omit<SpringBootPropertyOverride<T>, 'property' | 'value'> = {}): this {
    this.propertyOverrides.push({
      property,
      value,
      ...options,
    });
    return this;
  }

  /**
   * Add a Spring Boot dependency with type safety
   */
  addDependency(config: SpringBootDependencyConfig): this {
    this.dependencies.push(config);
    return this;
  }

  /**
   * Apply all configurations to a generator
   */
  async applyTo(generator: any): Promise<void> {
    // Sort modules by priority
    const sortedModules = [...this.modules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

    // Inject enabled modules
    for (const moduleConfig of sortedModules) {
      if (moduleConfig.enabled) {
        await generator.composeWithJHipster(moduleConfig.module, {
          generatorOptions: moduleConfig.config,
        });
      }
    }

    // Apply property overrides
    for (const propOverride of this.propertyOverrides) {
      this.applyPropertyOverride(generator, propOverride);
    }

    // Add dependencies
    for (const dep of this.dependencies) {
      this.addDependencyToGenerator(generator, dep);
    }
  }

  private applyPropertyOverride(generator: any, propOverride: SpringBootPropertyOverride): void {
    const { property, value, profiles } = propOverride;

    // Apply default value
    (generator.jhipsterConfig as any)[property] = value;

    // Apply profile-specific values
    if (profiles) {
      for (const [profile, profileValue] of Object.entries(profiles)) {
        (generator.jhipsterConfig as any)[`${property}@${profile}`] = profileValue;
      }
    }
  }

  private addDependencyToGenerator(generator: any, dep: SpringBootDependencyConfig): void {
    // This would integrate with the existing dependency management system
    // For now, we'll add to the generator's dependency tracking
    if (!(generator.jhipsterConfig as any).springBootDependencies) {
      (generator.jhipsterConfig as any).springBootDependencies = {};
    }

    const key = `${dep.groupId}:${dep.artifactId}`;
    (generator.jhipsterConfig as any).springBootDependencies[key] = dep.version ?? 'BOM';
  }

  /**
   * Get all configured modules
   */
  getModules(): readonly SpringBootModuleConfig[] {
    return [...this.modules];
  }

  /**
   * Get all property overrides
   */
  getPropertyOverrides(): readonly SpringBootPropertyOverride[] {
    return [...this.propertyOverrides];
  }

  /**
   * Get all dependencies
   */
  getDependencies(): readonly SpringBootDependencyConfig[] {
    return [...this.dependencies];
  }
}

/**
 * Helper function to create a typed Spring Boot module injector
 */
export function createSpringBootInjector(): SpringBootModuleInjector {
  return new SpringBootModuleInjector();
}

/**
 * Type-safe Spring Boot module injection utilities
 */
export const SpringBoot = {
  /**
   * Inject JWT authentication module
   */
  jwt(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_BOOT_MODULES.JWT, config);
  },

  /**
   * Inject OAuth2 authentication module
   */
  oauth2(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_BOOT_MODULES.OAUTH2, config);
  },

  /**
   * Inject Session authentication module
   */
  session(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_BOOT_MODULES.SESSION, config);
  },

  /**
   * Inject Feign client module
   */
  feignClient(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_BOOT_MODULES.FEIGN_CLIENT, config);
  },

  /**
   * Inject WebSocket module
   */
  websocket(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_BOOT_MODULES.WEBSOCKET, config);
  },

  /**
   * Inject relational database support
   */
  relational(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_DATA_MODULES.RELATIONAL, config);
  },

  /**
   * Inject MongoDB support
   */
  mongodb(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_DATA_MODULES.MONGODB, config);
  },

  /**
   * Inject Spring Cache module
   */
  cache(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_MODULES.CACHE, config);
  },

  /**
   * Inject Spring Cloud Stream module
   */
  cloudStream(config?: Omit<SpringBootModuleConfig, 'module'>): SpringBootModuleInjector {
    return createSpringBootInjector().injectModule(SPRING_MODULES.CLOUD_STREAM, config);
  },

  /**
   * Create a custom injector with multiple modules
   */
  injector(): SpringBootModuleInjector {
    return createSpringBootInjector();
  },
} as const;

/**
 * Type-safe property override utilities
 */
export const SpringProperties = {
  /**
   * Override server port
   */
  serverPort(port: number): SpringBootPropertyOverride<number> {
    return { property: 'serverPort', value: port, type: 'number' };
  },

  /**
   * Override database URL
   */
  databaseUrl(url: string): SpringBootPropertyOverride<string> {
    return { property: 'spring.datasource.url', value: url, type: 'string' };
  },

  /**
   * Override logging level
   */
  loggingLevel(logger: string, level: string): SpringBootPropertyOverride<string> {
    return { property: `logging.level.${logger}`, value: level, type: 'string' };
  },

  /**
   * Override cache configuration
   */
  cacheType(type: string): SpringBootPropertyOverride<string> {
    return { property: 'spring.cache.type', value: type, type: 'string' };
  },

  /**
   * Custom property override
   */
  custom<T>(property: string, value: T, type?: SpringBootPropertyOverride['type']): SpringBootPropertyOverride<T> {
    return { property, value, type };
  },
} as const;
