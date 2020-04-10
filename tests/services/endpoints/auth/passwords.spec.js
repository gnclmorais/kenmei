import axios from 'axios';
import * as resource from '@/services/endpoints/auth/passwords';

describe('confirmations', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create()', () => {
    let createSpy;

    beforeEach(() => {
      createSpy = jest.spyOn(axios, 'post');
    });

    it('makes a request to the resource and returns request', async () => {
      createSpy.mockResolvedValue({ status: 200 });

      const successful = await resource.create('user1@example.com');

      expect(successful.status).toBe(200);
      expect(createSpy).toHaveBeenCalledWith(
        '/auth/passwords', { email: 'user1@example.com' }
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
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
      user = { id: 1 };
    });

    it('makes a request to the resource and returns request', async () => {
      updateSpy.mockResolvedValue({ status: 200 });

      const successful = await resource.update(user, 'token');

      expect(successful.status).toBe(200);
      expect(updateSpy).toHaveBeenCalledWith(
        '/auth/passwords', { user, reset_password_token: 'token' }
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
      updateSpy.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.update(user, '');

      expect(successful.status).toBe(500);
    });
  });

  describe('edit()', () => {
    let editSpy;

    beforeEach(() => {
      editSpy = jest.spyOn(axios, 'get');
    });

    it('makes a request to the resource and returns request', async () => {
      editSpy.mockResolvedValue({ status: 200 });

      const successful = await resource.edit('token');

      expect(successful.status).toBe(200);
      expect(editSpy).toHaveBeenCalledWith(
        '/auth/passwords/edit', { params: { reset_password_token: 'token' } }
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
      editSpy.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.edit('');

      expect(successful.status).toBe(500);
    });
  });
});
