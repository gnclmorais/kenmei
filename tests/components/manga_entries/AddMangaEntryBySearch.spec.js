import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';

import AddMangaEntryBySearch from '@/components/manga_entries/AddMangaEntryBySearch.vue';
import BaseFormAutocomplete from '@/components/base_components/BaseFormAutocomplete.vue';

import lists from '@/store/modules/lists';
import * as resource from '@/services/endpoints/v1/manga_series';

const localVue = createLocalVue();

localVue.use(Vuex);
jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

describe('AddMangaEntryBySearch.vue', () => {
  let store;
  let bySearch;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: lists.state,
        },
      },
    });

    bySearch = shallowMount(
      AddMangaEntryBySearch, {
        store,
        localVue,
        propsData: { addingEntry: false },
      },
    );
  });

  describe('when searchQuery changes', () => {
    describe("and it's blank", () => {
      it('items get reset', async () => {
        const mangaSeries = factories.series.build();
        bySearch = shallowMount(
          AddMangaEntryBySearch, {
            store,
            localVue,
            data() { return { searchQuery: 'query', items: [mangaSeries] }; },
            propsData: {
              addingEntry: false,
            },
          },
        );

        await bySearch.setData({ searchQuery: '' });

        expect(bySearch.vm.items).toEqual([]);
      });
    });

    describe("and it's not blank", () => {
      let indexMangaSeriesMock;

      beforeEach(() => {
        indexMangaSeriesMock = jest.spyOn(resource, 'index');
      });

      it('makes an async request to retrieve series titles', async () => {
        const mangaSeries = factories.series.buildList(1);

        indexMangaSeriesMock
          .mockResolvedValue({ status: 200, data: { data: mangaSeries } });

        bySearch.setData({ searchQuery: 'query' });
        await flushPromises();

        expect(indexMangaSeriesMock).toHaveBeenCalledWith('query');
        expect(bySearch.vm.items).toEqual(mangaSeries);
      });

      describe('and there are validation errors', () => {
        it('does not make an async request', async () => {
          await bySearch.setData({ searchQuery: 'https://www.example.com' });

          expect(indexMangaSeriesMock)
            .not
            .toHaveBeenCalledWith('https://www.example.com');
        });
      });

      describe('and request failed', () => {
        it('shows an error message', async () => {
          const errorMessageMock = jest.spyOn(Message, 'error');

          indexMangaSeriesMock.mockResolvedValue({ status: 500 });

          bySearch.setData({ searchQuery: 'query' });
          await flushPromises();

          expect(errorMessageMock).toHaveBeenCalledWith(
            "Couldn't fetch series. Try refreshing the page before trying again",
          );
        });
      });
    });
  });

  describe('when availableSources gets set', () => {
    it('emits mangaSourceSelected for the first available source', async () => {
      const mangaSeries = factories.series.build();
      bySearch = shallowMount(
        AddMangaEntryBySearch, {
          store,
          localVue,
          data() {
            return { items: [mangaSeries] };
          },
          propsData: {
            addingEntry: false,
          },
        },
      );

      await bySearch.setData({ selectedSeriesID: mangaSeries.id });

      expect(bySearch.emitted('mangaSourceSelected')[0])
        .toEqual([mangaSeries.mangaSources[0].id]);
    });
  });

  describe('when autocomplete component emits selected', () => {
    it('sets selectedSeriesID and resets mangaSourceID', async () => {
      await bySearch
        .findComponent(BaseFormAutocomplete).vm.$emit('selected', 1);

      expect(bySearch.vm.selectedSeriesID).toEqual(1);
      expect(bySearch.vm.mangaSourceID).toEqual(null);
    });
  });

  describe('when autocomplete component emits input', () => {
    it('sets searchQuery', async () => {
      await bySearch
        .findComponent(BaseFormAutocomplete).vm.$emit('input', 'Title');

      expect(bySearch.vm.searchQuery).toEqual('Title');
    });
  });
});
