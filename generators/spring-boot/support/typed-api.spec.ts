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

import { describe, expect, it } from 'esmocha';

import {
  SPRING_BOOT_MODULES,
  SPRING_DATA_MODULES,
  SPRING_MODULES,
  SpringBoot,
  SpringProperties,
  createSpringBootInjector,
  type SpringBootModuleConfig,
  type SpringBootPropertyOverride,
  type SpringBootDependencyConfig,
} from './typed-api.ts';

describe('generator - spring-boot - typed-api', () => {
  describe('SpringBootModuleInjector', () => {
    let injector: ReturnType<typeof createSpringBootInjector>;

    beforeEach(() => {
      injector = createSpringBootInjector();
    });

    describe('injectModule', () => {
      it('should inject a module with default config', () => {
        injector.injectModule(SPRING_BOOT_MODULES.JWT);

        const modules = injector.getModules();
        expect(modules).toHaveLength(1);
        expect(modules[0]).toEqual({
          module: SPRING_BOOT_MODULES.JWT,
          enabled: true,
        });
      });

      it('should inject a module with custom config', () => {
        const config: Omit<SpringBootModuleConfig, 'module'> = {
          enabled: true,
          config: { customOption: 'value' },
          priority: 10,
        };

        injector.injectModule(SPRING_BOOT_MODULES.JWT, config);

        const modules = injector.getModules();
        expect(modules[0]).toEqual({
          module: SPRING_BOOT_MODULES.JWT,
          ...config,
        });
      });

      it('should support method chaining', () => {
        const result = injector.injectModule(SPRING_BOOT_MODULES.JWT).injectModule(SPRING_DATA_MODULES.MONGODB);

        expect(result).toBe(injector);
        expect(injector.getModules()).toHaveLength(2);
      });
    });

    describe('overrideProperty', () => {
      it('should override a property with default options', () => {
        injector.overrideProperty('server.port', 8081);

        const overrides = injector.getPropertyOverrides();
        expect(overrides).toHaveLength(1);
        expect(overrides[0]).toEqual({
          property: 'server.port',
          value: 8081,
        });
      });

      it('should override a property with custom options', () => {
        const override: SpringBootPropertyOverride<string> = {
          property: 'logging.level.com.example',
          value: 'DEBUG',
          type: 'string',
          override: true,
          profiles: { dev: 'TRACE', prod: 'INFO' },
        };

        injector.overrideProperty(override.property, override.value, override);

        const overrides = injector.getPropertyOverrides();
        expect(overrides[0]).toEqual(override);
      });
    });

    describe('addDependency', () => {
      it('should add a dependency', () => {
        const dep: SpringBootDependencyConfig = {
          groupId: 'com.example',
          artifactId: 'custom-lib',
          version: '1.0.0',
        };

        injector.addDependency(dep);

        const dependencies = injector.getDependencies();
        expect(dependencies).toHaveLength(1);
        expect(dependencies[0]).toEqual(dep);
      });

      it('should add dependency with exclusions', () => {
        const dep: SpringBootDependencyConfig = {
          groupId: 'com.example',
          artifactId: 'custom-lib',
          version: '1.0.0',
          exclusions: [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-logging' }],
        };

        injector.addDependency(dep);

        const dependencies = injector.getDependencies();
        expect(dependencies[0].exclusions).toHaveLength(1);
      });
    });
  });

  describe('SpringBoot helper functions', () => {
    describe('authentication modules', () => {
      it('should create JWT module injector', () => {
        const injector = SpringBoot.jwt();

        const modules = injector.getModules();
        expect(modules).toHaveLength(1);
        expect(modules[0].module).toBe(SPRING_BOOT_MODULES.JWT);
        expect(modules[0].enabled).toBe(true);
      });

      it('should create OAuth2 module injector', () => {
        const injector = SpringBoot.oauth2();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_BOOT_MODULES.OAUTH2);
      });

      it('should create Session module injector', () => {
        const injector = SpringBoot.session();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_BOOT_MODULES.SESSION);
      });
    });

    describe('communication modules', () => {
      it('should create Feign client module injector', () => {
        const injector = SpringBoot.feignClient();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_BOOT_MODULES.FEIGN_CLIENT);
      });

      it('should create WebSocket module injector', () => {
        const injector = SpringBoot.websocket();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_BOOT_MODULES.WEBSOCKET);
      });
    });

    describe('data modules', () => {
      it('should create relational database module injector', () => {
        const injector = SpringBoot.relational();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_DATA_MODULES.RELATIONAL);
      });

      it('should create MongoDB module injector', () => {
        const injector = SpringBoot.mongodb();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_DATA_MODULES.MONGODB);
      });
    });

    describe('other modules', () => {
      it('should create Spring Cache module injector', () => {
        const injector = SpringBoot.cache();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_MODULES.CACHE);
      });

      it('should create Spring Cloud Stream module injector', () => {
        const injector = SpringBoot.cloudStream();

        const modules = injector.getModules();
        expect(modules[0].module).toBe(SPRING_MODULES.CLOUD_STREAM);
      });
    });

    describe('custom injector', () => {
      it('should create empty injector', () => {
        const injector = SpringBoot.injector();

        expect(injector.getModules()).toHaveLength(0);
        expect(injector.getPropertyOverrides()).toHaveLength(0);
        expect(injector.getDependencies()).toHaveLength(0);
      });
    });
  });

  describe('SpringProperties helper functions', () => {
    describe('serverPort', () => {
      it('should create server port property override', () => {
        const override = SpringProperties.serverPort(9090);

        expect(override).toEqual({
          property: 'serverPort',
          value: 9090,
          type: 'number',
        });
      });
    });

    describe('databaseUrl', () => {
      it('should create database URL property override', () => {
        const override = SpringProperties.databaseUrl('jdbc:h2:mem:testdb');

        expect(override).toEqual({
          property: 'spring.datasource.url',
          value: 'jdbc:h2:mem:testdb',
          type: 'string',
        });
      });
    });

    describe('loggingLevel', () => {
      it('should create logging level property override', () => {
        const override = SpringProperties.loggingLevel('com.example', 'DEBUG');

        expect(override).toEqual({
          property: 'logging.level.com.example',
          value: 'DEBUG',
          type: 'string',
        });
      });
    });

    describe('cacheType', () => {
      it('should create cache type property override', () => {
        const override = SpringProperties.cacheType('redis');

        expect(override).toEqual({
          property: 'spring.cache.type',
          value: 'redis',
          type: 'string',
        });
      });
    });

    describe('custom', () => {
      it('should create custom property override', () => {
        const override = SpringProperties.custom('custom.property', { key: 'value' }, 'object');

        expect(override).toEqual({
          property: 'custom.property',
          value: { key: 'value' },
          type: 'object',
        });
      });
    });
  });

  describe('complex usage scenarios', () => {
    it('should support complex module injection with property overrides', () => {
      const injector = SpringBoot.injector()
        .injectModule(SPRING_BOOT_MODULES.JWT, { enabled: true, priority: 1 })
        .injectModule(SPRING_DATA_MODULES.MONGODB, { enabled: true, priority: 2 })
        .injectModule(SPRING_MODULES.CACHE, { enabled: true, config: { provider: 'redis' } })
        .overrideProperty('server.port', 8080)
        .overrideProperty('spring.cache.type', 'redis')
        .addDependency({
          groupId: 'com.example',
          artifactId: 'custom-starter',
          version: '1.0.0',
        });

      expect(injector.getModules()).toHaveLength(3);
      expect(injector.getPropertyOverrides()).toHaveLength(2);
      expect(injector.getDependencies()).toHaveLength(1);
    });

    it('should support chaining multiple authentication types', () => {
      const injector = SpringBoot.jwt().injectModule(SPRING_BOOT_MODULES.OAUTH2, { enabled: false });

      const modules = injector.getModules();
      expect(modules).toHaveLength(2);
      expect(modules[0].module).toBe(SPRING_BOOT_MODULES.JWT);
      expect(modules[1].module).toBe(SPRING_BOOT_MODULES.OAUTH2);
      expect(modules[1].enabled).toBe(false);
    });

    it('should support profile-specific property overrides', () => {
      const injector = SpringBoot.injector().overrideProperty('logging.level.root', 'INFO', {
        profiles: {
          dev: 'DEBUG',
          prod: 'WARN',
        },
      });

      const overrides = injector.getPropertyOverrides();
      expect(overrides[0].profiles).toEqual({
        dev: 'DEBUG',
        prod: 'WARN',
      });
    });
  });

  describe('module constants', () => {
    it('should export all Spring Boot module constants', () => {
      expect(SPRING_BOOT_MODULES.JWT).toBe('jhipster:spring-boot:jwt');
      expect(SPRING_BOOT_MODULES.OAUTH2).toBe('jhipster:spring-boot:oauth2');
      expect(SPRING_BOOT_MODULES.SESSION).toBe('jhipster:spring-boot:session');
      expect(SPRING_BOOT_MODULES.FEIGN_CLIENT).toBe('jhipster:spring-boot:feign-client');
      expect(SPRING_BOOT_MODULES.WEBSOCKET).toBe('jhipster:spring-boot:websocket');
      expect(SPRING_BOOT_MODULES.GATEWAY).toBe('jhipster:spring-cloud:gateway');
    });

    it('should export all Spring Data module constants', () => {
      expect(SPRING_DATA_MODULES.RELATIONAL).toBe('jhipster:spring-data:relational');
      expect(SPRING_DATA_MODULES.MONGODB).toBe('jhipster:spring-data:mongodb');
      expect(SPRING_DATA_MODULES.CASSANDRA).toBe('jhipster:spring-data:cassandra');
      expect(SPRING_DATA_MODULES.COUCHBASE).toBe('jhipster:spring-data:couchbase');
      expect(SPRING_DATA_MODULES.NEO4J).toBe('jhipster:spring-data:neo4j');
      expect(SPRING_DATA_MODULES.ELASTICSEARCH).toBe('jhipster:spring-data:elasticsearch');
    });

    it('should export all Spring module constants', () => {
      expect(SPRING_MODULES.CACHE).toBe('spring-cache');
      expect(SPRING_MODULES.CLOUD_STREAM).toBe('spring-cloud-stream');
    });
  });
});
