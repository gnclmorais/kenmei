import axios from 'axios';
import * as resource from '@/services/endpoints/v2/manga_entries';

describe('/v2/manga_entries', () => {
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

        const params = {
          page: 1,
          status: 'reading',
          tagIDs: [],
          searchTerm: '',
          sort: { Title: 'asc' },
        };

        const successful = await resource.index(...Object.values(params));

        expect(successful.status).toBe(200);
        expect(indexSpy).toHaveBeenCalledWith(
          '/api/v2/manga_entries',
          expect.objectContaining({
            params: {
              page: params.page,
              status: params.status,
              user_tag_ids: params.tagIDs,
              search_term: params.searchTerm,
              sort: params.sort,
            },
          }),
        );
      });
    });

    describe('makes a failed request to the resource', () => {
      it('returns response with error status', async () => {
        axios.get.mockRejectedValue({ response: { status: 500 } });

        const successful = await resource.index({});

        expect(successful.status).toBe(500);
      });
    });
  });
});
