import axios from 'axios';
import * as resource from '@/services/endpoints/auth/confirmations';

describe('confirmations', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('show()', () => {
    let showSpy;

    beforeEach(() => {
      showSpy = jest.spyOn(axios, 'get');
    });

    it('makes a request to the resource and returns request', async () => {
      axios.get.mockResolvedValue({ status: 200 });

      const successful = await resource.show('token');

      expect(successful.status).toBe(200);
      expect(showSpy).toHaveBeenCalledWith(
        '/auth/confirmations', { params: { confirmation_token: 'token' } },
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
      axios.get.mockRejectedValue({ response: { status: 500 } });

      const successful = await resource.show('');

      expect(successful.status).toBe(500);
    });
  });
});
