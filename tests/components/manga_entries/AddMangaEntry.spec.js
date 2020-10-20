import i18n from 'i18n';
import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import AddMangaEntry from '@/components/manga_entries/AddMangaEntry.vue';
import AddMangaEntryBySearch from '@/components/manga_entries/AddMangaEntryBySearch.vue';
import lists from '@/store/modules/lists';
import * as api from '@/services/api';

const localVue = createLocalVue();

localVue.use(Vuex);

jest.useFakeTimers();

describe('AddMangaEntry.vue', () => {
  let store;
  let addMangaEntry;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: lists.state,
          mutations: lists.mutations,
          getters: lists.getters,
        },
      },
    });

    addMangaEntry = shallowMount(AddMangaEntry, {
      store,
      localVue,
      i18n,
      propsData: { visible: true },
    });
  });

  describe('when tabs are switched', () => {
    it('resets data to original state', async () => {
      await addMangaEntry
        .setData({ searchQuery: 'query', selectedSeriesTitle: 'Title' });

      expect(addMangaEntry.vm.searchQuery).toEqual('query');
      expect(addMangaEntry.vm.selectedSeriesTitle).toEqual('Title');

      await addMangaEntry.setData({ selectedTab: 'Add with URL' });

      expect(addMangaEntry.vm.searchQuery).toEqual('');
      expect(addMangaEntry.vm.selectedSeriesTitle).toEqual('');
    });
  });

  describe('when modal is closed', () => {
    it.skip('resets data to original state', async () => {
      await addMangaEntry.setData({
        searchQuery: 'query', selectedSeriesTitle: 'Title',
      });

      expect(addMangaEntry.vm.searchQuery).toEqual('query');
      expect(addMangaEntry.vm.selectedSeriesTitle).toEqual('Title');

      await addMangaEntry.setProps({ visible: false });
      jest.runAllTimers();

      expect(addMangaEntry.vm.searchQuery).toEqual('');
      expect(addMangaEntry.vm.selectedSeriesTitle).toEqual('');
    });
  });

  describe('when search tab is selected', () => {
    beforeEach(() => {
      addMangaEntry.setData({ selectedTab: 'Search' });
    });

    describe('and series title is selected', () => {
      beforeEach(() => {
        addMangaEntry
          .findComponent(AddMangaEntryBySearch)
          .vm
          .$emit('seriesSelected', 'Title');
      });

      it('sets selectedSeriesTitle and resets mangaSourceID', async () => {
        expect(addMangaEntry.vm.selectedSeriesTitle).toEqual('Title');
        expect(addMangaEntry.vm.mangaSourceID).toEqual(null);
      });
    });

    describe('and manga source is selected', () => {
      beforeEach(() => {
        addMangaEntry
          .findComponent(AddMangaEntryBySearch)
          .vm
          .$emit('mangaSourceSelected', 123);
      });

      it('sets mangaSourceID', async () => {
        expect(addMangaEntry.vm.mangaSourceID).toEqual(123);
      });
    });

    describe('and new manga entry is being added', () => {
      let createEntrySpy;

      beforeEach(() => {
        addMangaEntry.setData({
          searchQuery: 'query',
          selectedSeriesTitle: 'title',
          mangaSourceID: 123,
        });

        createEntrySpy = jest.spyOn(api, 'create');
      });


      it('calls create endpoint with mangaSourceID', async () => {
        addMangaEntry.vm.addMangaEntry();

        await flushPromises();

        expect(createEntrySpy).toHaveBeenCalledWith('', 1, 123);
      });
    });

    describe('and there are client-side errors', () => {
      it.todo('shows validation errors');
    });
  });

  describe('when add by url tab is selected', () => {
    beforeEach(() => {
      addMangaEntry.setData({ selectedTab: 'Add with URL' });
    });

    describe('and new manga entry is being added', () => {
      let createEntrySpy;

      beforeEach(() => {
        addMangaEntry.setData({ mangaURL: 'http://www.example.url/manga/1' });

        createEntrySpy = jest.spyOn(api, 'create');
      });

      afterEach(() => {
        expect(createEntrySpy)
          .toHaveBeenCalledWith('http://www.example.url/manga/1', 1);
      });

      describe('when no manga sources are tracked', () => {
        it('adds new Manga entry', async () => {
          const mangaEntry = factories.entry.build();

          createEntrySpy.mockResolvedValue({
            status: 200, data: { data: mangaEntry },
          });

          addMangaEntry.vm.addMangaEntry();

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
            attributes: {
              tracked_entries: [
                {
                  id: oldEntry.id,
                  manga_source_id: oldEntry.manga_source_id,
                  manga_series_id: oldEntry.manga_series_id,
                },
                {
                  id: 2,
                  manga_source_id: 2,
                  manga_series_id: oldEntry.manga_series_id,
                },
              ],
            },
          });

          createEntrySpy.mockResolvedValue({
            status: 200, data: { data: newMangaEntry },
          });

          addMangaEntry.vm.addMangaEntry();

          await flushPromises();

          expect(store.state.lists.entries).not.toContain(oldEntry);
          expect(store.state.lists.entries).toContain(newMangaEntry);
          expect(addMangaEntry.emitted('dialogClosed')).toBeTruthy();
        });
      });

      describe('when receiving 404 status', () => {
        it('shows info message with payload data', async () => {
          const infoMessageMock = jest.spyOn(Message, 'info');

          createEntrySpy.mockResolvedValue(
            { status: 404, data: 'Manga was not found' },
          );

          addMangaEntry.vm.addMangaEntry();

          await flushPromises();
          expect(infoMessageMock).toHaveBeenCalledWith('Manga was not found');
        });
      });

      describe('when receiving 406 status', () => {
        it('shows info message with payload data', async () => {
          const infoMessageMock = jest.spyOn(Message, 'info');

          createEntrySpy.mockResolvedValue(
            { status: 406, data: 'Manga already added' },
          );

          addMangaEntry.vm.addMangaEntry();

          await flushPromises();
          expect(infoMessageMock).toHaveBeenCalledWith('Manga already added');
        });
      });

      it('shows error message on unsuccessful API lookup', async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');

        createEntrySpy.mockResolvedValue({ status: 500 });

        addMangaEntry.vm.addMangaEntry();

        await flushPromises();

        expect(errorMessageMock).toHaveBeenCalledWith('Something went wrong');
        expect(addMangaEntry.emitted('dialogClosed')).toBeTruthy();
      });
    });

    describe('and there are client-side errors', () => {
      it.todo('shows validation errors');
    });
  });

  describe(':props', () => {
    describe(':currentStatus', () => {
      it('sets initial selectedStatus', async () => {
        expect(addMangaEntry.vm.selectedStatus).toBe(1);

        await addMangaEntry.setProps({ currentStatus: 2 });

        expect(addMangaEntry.vm.selectedStatus).toBe(2);
      });

      it('sets selectedStatus as Reading if currentStatus is All', async () => {
        expect(addMangaEntry.vm.selectedStatus).toBe(1);

        await addMangaEntry.setProps({ currentStatus: -1 });

        expect(addMangaEntry.vm.selectedStatus).toBe(1);
      });
    });
  });
});
