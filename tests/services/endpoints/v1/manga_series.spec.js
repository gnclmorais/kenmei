import axios from 'axios';
import * as resource from '@/services/endpoints/v1/manga_series';

describe('/v1/manga_series', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('index()', () => {
    let indexSpy;

    beforeEach(() => {
      indexSpy = jest.spyOn(axios, 'get');
    });

    describe('makes a request to the resource', () => {
      it('returns response', async () => {
        axios.get.mockResolvedValue({ status: 200 });

        const params = { search_term: '' };
        const successful = await resource.index(params.search_term);

        expect(successful.status).toBe(200);
        expect(indexSpy)
          .toHaveBeenCalledWith('/api/v1/manga_series', { params });
      });
    });

    describe('makes a failed request to the resource', () => {
      it('returns response with error status', async () => {
        axios.get.mockRejectedValue({ response: { status: 500 } });

        const successful = await resource.index(null);

        expect(successful.status).toBe(500);
      });
    });
  });
});
