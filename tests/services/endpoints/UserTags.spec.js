import axios from 'axios';
import * as resource from '@/services/endpoints/UserTags';

describe('UserTags', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('index()', () => {
    it('makes a request to the resource and returns data', async () => {
      const getMangaSourcesSpy = jest.spyOn(axios, 'get');
      const data = factories.userTag.buildList(2);

      getMangaSourcesSpy.mockResolvedValue({ status: 200, data });

      const response = await resource.index();

      expect(response.data).toEqual(data);
      expect(getMangaSourcesSpy).toHaveBeenCalledWith('/api/v1/user_tags');
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.get.mockRejectedValue({ status: 500 });

      const response = await resource.index();
      expect(response).toBeFalsy();
    });
  });

  describe('create()', () => {
    it('makes a request to the resource and returns data', async () => {
      const getMangaSourcesSpy = jest.spyOn(axios, 'post');
      const data = factories.userTag.build();

      getMangaSourcesSpy.mockResolvedValue({ status: 200, data });

      const response = await resource.create({
        name: data.name, description: data.description,
      });

      expect(response.data).toEqual(data);
      expect(getMangaSourcesSpy).toHaveBeenCalledWith(
        '/api/v1/user_tags',
        { user_tag: { name: data.name, description: data.description } },
      );
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.post.mockRejectedValue({ status: 500 });

      const response = await resource.create();
      expect(response).toBeFalsy();
    });
  });

  describe('update()', () => {
    it('makes a request to the resource and returns data', async () => {
      const getMangaSourcesSpy = jest.spyOn(axios, 'put');
      const data = factories.userTag.build();

      getMangaSourcesSpy.mockResolvedValue({ status: 200, data });

      const response = await resource.update({
        id: data.id, name: 'New Tag', description: '',
      });

      expect(response.data).toEqual(data);
      expect(getMangaSourcesSpy).toHaveBeenCalledWith(
        `/api/v1/user_tags/${data.id}`,
        { user_tag: { id: data.id, name: 'New Tag', description: '' } },
      );
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.put.mockRejectedValue({ status: 500 });

      const response = await resource.update({ id: 1 });
      expect(response).toBeFalsy();
    });
  });

  describe('destroy()', () => {
    it('makes a request to the resource and returns data', async () => {
      const getMangaSourcesSpy = jest.spyOn(axios, 'delete');

      getMangaSourcesSpy.mockResolvedValue({ status: 200 });

      const response = await resource.destroy(1);

      expect(response.status).toBe(200);
      expect(getMangaSourcesSpy).toHaveBeenCalledWith('/api/v1/user_tags/1');
    });

    it('makes a request to the resource and returns false if failed', async () => {
      axios.delete.mockRejectedValue({ status: 500 });

      const response = await resource.destroy();
      expect(response).toBeFalsy();
    });
  });
});
