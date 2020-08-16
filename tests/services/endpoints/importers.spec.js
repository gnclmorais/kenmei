import axios from 'axios';
import * as resource from '@/services/endpoints/importers';

describe('importers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('postTrackrMoe()', () => {
    it('makes a request to the resource and returns response', async () => {
      const postTrackrMoeSpy = jest.spyOn(axios, 'post');

      axios.post.mockResolvedValue({ status: 200, data: 'Success' });

      const response = await resource.postTrackrMoe({});

      expect(response.data).toEqual('Success');
      expect(postTrackrMoeSpy).toHaveBeenLastCalledWith(
        '/api/v1/importers/trackr_moe',
        { lists: {} },
      );
    });

    it('makes a request to the resource and returns response if failed', async () => {
      axios.post.mockRejectedValue({ status: 500 });

      const successful = await resource.postTrackrMoe({ lists: {} });
      expect(successful).toBeFalsy();
    });
  });

  describe('postMDList()', () => {
    it('makes a request to the resource and returns response', async () => {
      const postMDListSpy = jest.spyOn(axios, 'post');

      postMDListSpy.mockResolvedValue({ status: 200, data: 'Good work' });

      const response = await resource.postMDList('mdlist.example/list/1');

      expect(response.data).toEqual('Good work');
      expect(postMDListSpy).toHaveBeenLastCalledWith(
        '/api/v1/importers/mangadex',
        { url: 'mdlist.example/list/1' },
      );
    });

    it('makes a request to the resource and returns error response if failed', async () => {
      axios.post.mockRejectedValue({ status: 500 });

      const successful = await resource.postMDList('');
      expect(successful).toBeFalsy();
    });
  });
});
