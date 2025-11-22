import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers } from '../../../lib/testing/index.ts';

import { detectCrLf } from './auto-crlf-transform.ts';
import autoCrlfTransform from './auto-crlf-transform.ts';

describe('generator - bootstrap - utils', () => {
  describe('::detectCrLf', () => {
    before(async () => {
      await helpers
        .prepareTemporaryDir()
        .withFiles({
          'crlf.txt': 'a\r\ncrlf file',
          'lf.txt': 'a\nlf file',
          'lf-single.txt': 'a single line file',
        })
        .commitFiles();
    });

    describe('passing a crlf file', () => {
      it('should return true', async () => {
        expect(await detectCrLf('crlf.txt')).toBe(true);
      });
    });
    describe('passing a lf file', () => {
      it('should return false', async () => {
        expect(await detectCrLf('lf.txt')).toBe(false);
      });
    });
    describe('passing a single line file', () => {
      it('should return undefined', async () => {
        expect(await detectCrLf('lf-single.txt')).toBe(undefined);
      });
    });
  });

  describe('::autoCrlfTransform', () => {
    describe('when not in a git repository', () => {
      before(async () => {
        await helpers.prepareTemporaryDir();
      });

      it('should not throw an error and return a working transform', async () => {
        const transform = await autoCrlfTransform({ baseDir: process.cwd() });
        expect(transform).toBeDefined();
        expect(typeof transform).toBe('function');

        // Test that the transform passes files through unchanged
        const mockFile = {
          path: 'test.txt',
          contents: Buffer.from('test content'),
          isFileStateModified: () => true,
        };

        const result = await new Promise((resolve) => {
          const stream = transform();
          stream.on('data', resolve);
          stream.write(mockFile);
          stream.end();
        });

        expect(result).toBe(mockFile);
      });
    });
  });
});
