import axios from 'axios';
import * as resource from '@/services/endpoints/auth/registrations';

describe('registrations', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create()', () => {
    let createSpy;

    beforeEach(() => {
      createSpy = jest.spyOn(axios, 'post');
    });

    it('makes a request to the resource and returns response', async () => {
      createSpy.mockResolvedValue({ status: 200 });

      const user = {
        email: 'text@example.com',
        password: 'password',
        password_confirmation: 'password',
      };
      const successful = await resource.create(user);

      expect(successful.status).toBe(200);
      expect(createSpy).toHaveBeenCalledWith('/auth/registrations', { user });
    });

    it('makes a request to the resource and returns failed response', async () => {
      createSpy.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.create('');

      expect(successful.status).toBe(500);
    });
  });
});
