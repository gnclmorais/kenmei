import axios from 'axios';
import * as resource from '@/services/endpoints/manga_entries_collections';

describe('MangaEntriesCollections', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('update()', () => {
    it('makes a request to the resource and returns data', async () => {
      const postMangaEntriesCollectionsSpy = jest.spyOn(axios, 'post');
      const data = factories.entry.buildList(2);
      const attributes = [
        { id: data[0].id, last_chapter_read: '2' },
        { id: data[1].id, last_chapter_read: '3' },
      ];

      postMangaEntriesCollectionsSpy.mockResolvedValue({ status: 200, data });

      const response = await resource.update(attributes);

      expect(response.data).toEqual(data);
      expect(postMangaEntriesCollectionsSpy).toHaveBeenCalledWith(
        '/api/v1/manga_entries_collections',
        { manga_entries_collection: attributes },
      );
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.post.mockRejectedValue({ status: 500 });

      const response = await resource.update([]);
      expect(response).toBeFalsy();
    });
  });
});
