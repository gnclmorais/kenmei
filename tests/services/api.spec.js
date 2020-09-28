import axios from 'axios';
import * as apiService from '@/services/api';

describe('API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create()', () => {
    it('makes a request to the resource and returns data', async () => {
      const postMangaEntriesCollectionsSpy = jest.spyOn(axios, 'post');
      const mangaURL = 'example.url/123';
      const status = 1;
      const data = factories.entry.build();

      postMangaEntriesCollectionsSpy.mockResolvedValue({ status: 200, data });

      const response = await apiService.create(mangaURL, status);

      expect(response.data).toEqual(data);
      expect(postMangaEntriesCollectionsSpy).toHaveBeenCalledWith(
        '/api/v1/manga_entries/',
        { manga_entry: { series_url: mangaURL, status } },
      );
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.post.mockRejectedValue({ status: 500 });

      const response = await apiService.create('', 0);
      expect(response).toBeFalsy();
    });
  });

  describe('updateMangaEntry()', () => {
    let mangaEntry;
    let attributes;

    beforeEach(() => {
      mangaEntry = factories.entry.build();
      attributes = {
        last_chapter_read: mangaEntry.attributes.last_chapter_available,
        last_chapter_read_url: mangaEntry.links.last_chapter_available_url,
      };
    });

    afterEach(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/v1/manga_entries/${mangaEntry.id}`,
        { manga_entry: attributes },
      );
    });

    it('makes a request to the API and returns updated entry if found', async () => {
      axios.put.mockResolvedValue({ status: 200, data: { data: mangaEntry } });

      const data = await apiService.updateMangaEntry(mangaEntry.id, attributes);
      expect(data).toEqual(mangaEntry);
    });

    it('makes a request to the API and returns false if entry not found', async () => {
      axios.put.mockResolvedValue({ status: 404, data: { error: 'error' } });

      const data = await apiService.updateMangaEntry(mangaEntry.id, attributes);
      expect(data).toEqual(false);
    });

    it('makes a request to the API and returns false if API fails', async () => {
      axios.put.mockRejectedValue({ response: { data: 'Things happened' } });

      const data = await apiService.updateMangaEntry(mangaEntry.id, attributes);
      expect(data).toEqual(false);
    });
  });

  describe('bulkUpdateMangaEntry()', () => {
    let mangaEntries;
    let ids;
    let attributes;

    beforeEach(() => {
      mangaEntries = factories.entry.buildList(2);
      ids = mangaEntries.map((entry) => entry.id);
      attributes = {
        last_chapter_read: mangaEntries[0].attributes.last_chapter_available,
        last_chapter_read_url: mangaEntries[0].links.last_chapter_available_url,
      };
    });

    afterEach(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/manga_entries/bulk_update',
        { ids, manga_entry: attributes },
      );
    });

    it('makes a request to the API and returns updated entries if found', async () => {
      axios.put.mockResolvedValue({ status: 200, data: { data: mangaEntries } });

      const data = await apiService.bulkUpdateMangaEntry(ids, attributes);
      expect(data).toEqual(mangaEntries);
    });

    it('makes a request to the API and returns false if entry not found', async () => {
      axios.put.mockResolvedValue({ status: 404, data: { error: 'error' } });

      const data = await apiService.bulkUpdateMangaEntry(ids, attributes);
      expect(data).toEqual(false);
    });

    it('makes a request to the API and returns false if API fails', async () => {
      axios.put.mockRejectedValue({ response: { data: 'Things happened' } });

      const response = await apiService.bulkUpdateMangaEntry(ids, attributes);
      expect(response).toEqual(false);
    });
  });

  describe('bulkDeleteMangaEntries()', () => {
    let ids;

    beforeEach(() => {
      ids = [1, 2];
    });

    afterEach(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/api/v1/manga_entries/bulk_destroy',
        { data: { ids } },
      );
    });

    it('makes a request to the API and returns true on success', async () => {
      axios.delete.mockResolvedValue();

      const data = await apiService.bulkDeleteMangaEntries(ids);
      expect(data).toBeTruthy();
    });

    it('makes a request to the API and returns false if request failed', async () => {
      const mockResponse = {
        response: { data: { error: 'Can only delete own entry' } },
      };

      axios.delete.mockRejectedValue(mockResponse);

      const data = await apiService.bulkDeleteMangaEntries(ids);
      expect(data).toBeFalsy();
    });
  });
});
