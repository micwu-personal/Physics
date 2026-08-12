import { expect, test } from '@playwright/test';
import { fetchInternalLink } from './helpers/assertions.js';

test('fetchInternalLink retries ECONNRESET exactly once', async () => {
  let calls = 0;
  const response = { status: () => 200 };
  const page = {
    request: {
      fetch: async () => {
        calls++;
        if (calls === 1) throw new Error('socket hang up: ECONNRESET');
        return response;
      }
    }
  };

  await expect(fetchInternalLink(page, 'http://127.0.0.1/test')).resolves.toBe(response);
  expect(calls).toBe(2);
});

test('fetchInternalLink does not retry non-ECONNRESET failures', async () => {
  let calls = 0;
  const page = {
    request: {
      fetch: async () => {
        calls++;
        throw new Error('EPIPE: connection closed');
      }
    }
  };

  await expect(fetchInternalLink(page, 'http://127.0.0.1/test')).rejects.toThrow('EPIPE: connection closed');
  expect(calls).toBe(1);
});
