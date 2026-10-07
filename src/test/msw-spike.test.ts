import { http, HttpResponse } from 'msw';
import { server } from './server';

test('MSW intercepts the real fetch in jest-expo', async () => {
  server.use(http.get('https://dummyjson.com/auth/me', () => HttpResponse.json({ id: 1 })));
  const response = await fetch('https://dummyjson.com/auth/me');
  expect(await response.json()).toEqual({ id: 1 });
});
