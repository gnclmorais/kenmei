import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import AddMangaEntry from '@/components/manga_entries/AddMangaEntry.vue';
import lists from '@/store/modules/lists';
import * as api from '@/services/api';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('AddMangaEntry.vue', () => {
  let store;
  let addMangaEntry;

  const mangaList = factories.list.build();

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: {
            lists: [mangaList],
            entries: [],
          },
          mutations: lists.mutations,
          getters: lists.getters,
        },
      },
    });

    addMangaEntry = shallowMount(AddMangaEntry, { store, localVue });
  });

  describe(':lifecycle', () => {
    it(':mounted() - sets manga list to Reading', () => {
      addMangaEntry = shallowMount(AddMangaEntry, {
        store,
        localVue,
        data() { return { listID: '' }; },
      });

      expect(addMangaEntry.vm.listID).toEqual(mangaList.id);
    });
  });

  describe('when adding new MangaDex entry', () => {
    let addMangaEntrySpy;

    beforeEach(() => {
      addMangaEntry.setData({ mangaURL: 'example.url/manga/1' });

      addMangaEntrySpy = jest.spyOn(api, 'addMangaEntry');
    });

    afterEach(() => {
      expect(addMangaEntrySpy).toHaveBeenCalledWith(
        'example.url/manga/1', mangaList.id
      );
    });

    describe('when no manga sources are tracked', () => {
      it('adds new Manga entry to the list', async () => {
        const mangaEntry = factories.entry.build();

        addMangaEntrySpy.mockResolvedValue({ data: mangaEntry });

        addMangaEntry.vm.mangaDexSearch();

        await flushPromises();

        expect(store.state.lists.entries).toContain(mangaEntry);
        expect(addMangaEntry.emitted('dialogClosed')).toBeTruthy();
      });
    });

    describe('when other manga source is tracked', () => {
      it('replaces currently tracked manga entry with the new one', async () => {
        const oldEntry = factories.entry.build();
        store.state.lists.entries = [oldEntry];

        const newMangaEntry = factories.entry.build({
          id: 2,
          manga_source_id: 2,
          manga_series_id: oldEntry.manga_series_id,
          manga_list_id: oldEntry.manga_list_id,
          attributes: {
            tracked_entries: [
              {
                id: oldEntry.id,
                manga_source_id: oldEntry.manga_series_id,
                manga_series_id: oldEntry.manga_list_id,
              },
              {
                id: 2,
                manga_source_id: 2,
                manga_series_id: oldEntry.manga_list_id,
              },
            ],
          },
        });

        addMangaEntrySpy.mockResolvedValue({ data: newMangaEntry });

        addMangaEntry.vm.mangaDexSearch();

        await flushPromises();

        expect(store.state.lists.entries).not.toContain(oldEntry);
        expect(store.state.lists.entries).toContain(newMangaEntry);
        expect(addMangaEntry.emitted('dialogClosed')).toBeTruthy();
      });
    });

    describe('when receiving 404 status', () => {
      it('shows info message with payload data', async () => {
        const infoMessageMock = jest.spyOn(Message, 'info');

        addMangaEntrySpy.mockRejectedValue(
          { response: { status: 404, data: 'Manga was not found' } }
        );

        addMangaEntry.vm.mangaDexSearch();

        await flushPromises();
        expect(infoMessageMock).toHaveBeenCalledWith('Manga was not found');
      });
    });

    describe('when receiving 406 status', () => {
      it('shows info message with payload data', async () => {
        const infoMessageMock = jest.spyOn(Message, 'info');

        addMangaEntrySpy.mockRejectedValue(
          { response: { status: 406, data: 'Manga already added' } }
        );

        addMangaEntry.vm.mangaDexSearch();

        await flushPromises();
        expect(infoMessageMock).toHaveBeenCalledWith('Manga already added');
      });
    });

    it('shows error message on unsuccessful API lookup', async () => {
      const errorMessageMock = jest.spyOn(Message, 'error');

      addMangaEntrySpy.mockRejectedValue({ response: { status: 500 } });

      addMangaEntry.vm.mangaDexSearch();

      await flushPromises();

      expect(errorMessageMock).toHaveBeenCalledWith('Something went wrong');
      expect(addMangaEntry.emitted('dialogClosed')).toBeTruthy();
    });
  });
});
