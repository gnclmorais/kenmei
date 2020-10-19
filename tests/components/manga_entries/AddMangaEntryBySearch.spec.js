import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';

import AddMangaEntryBySearch from '@/components/manga_entries/AddMangaEntryBySearch.vue';
import BaseFormAutocomplete from '@/components/base_components/BaseFormAutocomplete.vue';

import lists from '@/store/modules/lists';
import * as resource from '@/services/endpoints/v1/manga_series';

const localVue = createLocalVue();

localVue.use(Vuex);

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
        propsData: {
          searchQuery: '',
          validator: { mangaSourceID: { required: false, $dirty: false } },
        },
      },
    );
  });

  describe('when there are client-side errors', () => {
    it('shows validation errors', () => {
      bySearch = shallowMount(
        AddMangaEntryBySearch, {
          store,
          localVue,
          propsData: {
            searchQuery: '',
            validator: { mangaSourceID: { required: false, $dirty: true } },
          },
          computed: {
            availableSources: () => [jest.fn()],
          },
        },
      );

      expect(bySearch.find('span').exists()).toBeTruthy();
      expect(bySearch.find('span').text()).toContain('required');
    });
  });

  describe('when searchQuery changes', () => {
    describe("and it's blank", () => {
      it('items get reset', async () => {
        const mangaSeries = factories.series.build();
        bySearch = shallowMount(
          AddMangaEntryBySearch, {
            store,
            localVue,
            data() {
              return { items: [mangaSeries] };
            },
            propsData: {
              searchQuery: 'query',
              validator: { mangaSourceID: { required: false, $dirty: false } },
            },
          },
        );

        await bySearch.setProps({ searchQuery: '' });

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

        bySearch.setProps({ searchQuery: 'query' });
        await flushPromises();

        expect(indexMangaSeriesMock).toHaveBeenCalledWith('query');
        expect(bySearch.vm.items).toEqual(mangaSeries);
      });

      describe('and request failed', () => {
        it('shows an error message', async () => {
          const errorMessageMock = jest.spyOn(Message, 'error');

          indexMangaSeriesMock.mockResolvedValue({ status: 500 });

          bySearch.setProps({ searchQuery: 'query' });
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
            searchQuery: 'query',
            validator: { mangaSourceID: { required: false, $dirty: false } },
          },
        },
      );

      await bySearch.setProps({ selectedSeriesTitle: mangaSeries.title });

      expect(bySearch.emitted('mangaSourceSelected')[0])
        .toEqual([mangaSeries.mangaSources[0].id]);
    });
  });

  describe('when autocomplete component emits selected', () => {
    it('emits seriesSelected', async () => {
      await bySearch
        .findComponent(BaseFormAutocomplete).vm.$emit('selected', 'Title');

      expect(bySearch.emitted('seriesSelected')[0]).toEqual(['Title']);
    });
  });

  describe('when autocomplete component emits input', () => {
    it('emits input', async () => {
      await bySearch
        .findComponent(BaseFormAutocomplete).vm.$emit('input', 'Title');

      expect(bySearch.emitted('input')[0]).toEqual(['Title']);
    });
  });
});
