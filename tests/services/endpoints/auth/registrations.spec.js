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

  describe('update()', () => {
    let user;
    let updateSpy;

    beforeEach(() => {
      updateSpy = jest.spyOn(axios, 'put');
      user = { id: 1, email: 'new_email@example.com' };
    });

    it('makes a request to the resource and returns response', async () => {
      updateSpy.mockResolvedValue({ status: 200 });

      const successful = await resource.update(user);

      expect(successful.status).toBe(200);
      expect(updateSpy).toHaveBeenCalledWith(
        `/auth/registrations/${user.id}`,
        { user: { email: 'new_email@example.com' } },
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
      updateSpy.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.update({});

      expect(successful.status).toBe(500);
    });
  });

  describe('destroy()', () => {
    let id;
    let destroySpy;

    beforeEach(() => {
      destroySpy = jest.spyOn(axios, 'delete');
      id = 1;
    });

    it('makes a request to the resource and returns response', async () => {
      destroySpy.mockResolvedValue({ status: 200 });

      const successful = await resource.destroy(id);

      expect(successful.status).toBe(200);
      expect(destroySpy).toHaveBeenCalledWith(`/auth/registrations/${id}`);
    });

    it('makes a request to the resource and returns response if failed', async () => {
      destroySpy.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.destroy(null);

      expect(successful.status).toBe(500);
    });
  });
});
