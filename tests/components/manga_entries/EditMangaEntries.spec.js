import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import EditMangaEntries from '@/components/manga_entries/EditMangaEntries.vue';
import lists from '@/store/modules/lists';
import * as api from '@/services/api';
import * as mangaSources from '@/services/endpoints/MangaSources';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('EditMangaEntries.vue', () => {
  let store;
  const entry1 = factories.entry.build({ id: 1 });
  const entry2 = factories.entry.build({ id: 2 });

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: {
            tags: [
              factories.userTag.build({ id: 1 }),
              factories.userTag.build({ id: 2 }),
            ],
            entries: [entry1, entry2],
          },
          mutations: lists.mutations,
        },
      },
    });
  });

  describe(':props', () => {
    describe(':selectedEntries', () => {
      let editMangaEntries;

      beforeEach(() => {
        editMangaEntries = shallowMount(EditMangaEntries, {
          store,
          localVue,
          propsData: { selectedEntries: [] },
        });
      });

      describe('when single entry selected', () => {
        it('prefills status', async () => {
          await editMangaEntries.setProps({ selectedEntries: [entry1] });

          expect(editMangaEntries.vm.$data.selectedStatus).toEqual(
            entry1.attributes.status,
          );
        });
      });

      describe('when entry deselected', () => {
        it('resets data', async () => {
          await editMangaEntries.setProps({ selectedEntries: [entry1] });
          await editMangaEntries.setProps({ selectedEntries: [] });

          expect(editMangaEntries.vm.selectedStatus).toEqual(1);
          expect(editMangaEntries.vm.availableSources).toEqual([]);
          expect(editMangaEntries.vm.mangaSourceID).toEqual(null);
        });
      });
    });

    describe(':visible', () => {
      let editMangaEntries;

      beforeEach(() => {
        editMangaEntries = shallowMount(EditMangaEntries, {
          store,
          localVue,
          propsData: { selectedEntries: [entry1] },
        });
      });

      describe('when single entry selected', () => {
        it('loads available sources', async () => {
          const availableSources = factories.source.buildList(1);
          const getMangaSourcesSpy = jest.spyOn(
            mangaSources, 'getMangaSources',
          );

          getMangaSourcesSpy.mockResolvedValue({ data: availableSources });

          editMangaEntries.setProps({ visible: true });

          await flushPromises();

          expect(editMangaEntries.vm.$data.mangaSourceID).toEqual(entry1.id);
          expect(editMangaEntries.vm.$data.availableSources).toEqual(
            availableSources,
          );
        });

        it("shows error when available sources didn't load", async () => {
          const errorMessageMock = jest.spyOn(Message, 'error');
          const getMangaSourcesSpy = jest.spyOn(
            mangaSources, 'getMangaSources',
          );

          getMangaSourcesSpy.mockResolvedValue(false);

          editMangaEntries.setProps({ visible: true });

          await flushPromises();

          expect(editMangaEntries.vm.$data).toEqual({
            selectedStatus: entry1.attributes.status,
            mangaSourceID: null,
            availableSources: [],
            selectedTagIDs: [],
            loadingSources: true,
            loading: false,
          });
          expect(errorMessageMock).toHaveBeenCalledWith(
            "Couldn't fetch available manga sites. Try refreshing the page",
          );
        });
      });
    });
  });

  describe('when updating single manga entry', () => {
    let editMangaEntries;
    let updateMangaEntryMock;

    beforeEach(() => {
      updateMangaEntryMock = jest.spyOn(api, 'updateMangaEntry');
      editMangaEntries = shallowMount(EditMangaEntries, {
        store,
        localVue,
        propsData: { selectedEntries: [entry1] },
      });
    });

    afterEach(() => {
      expect(updateMangaEntryMock).toHaveBeenCalledWith(
        1, { status: 2, manga_source_id: 1, user_tag_ids: [] },
      );
    });

    it('uses updateMangaEntry endpoint', async () => {
      editMangaEntries.setData({ selectedStatus: 2, mangaSourceID: 1 });
      const updatedEntry = factories.entry.build({
        id: 1, attributes: { status: 2 },
      });

      updateMangaEntryMock.mockResolvedValue(updatedEntry);

      editMangaEntries.vm.updateMangaEntries();

      await flushPromises();

      expect(store.state.lists.entries).not.toContain(entry1);
      expect(store.state.lists.entries).toContain(updatedEntry);
    });
  });

  describe('when updating multiple manga entries', () => {
    let editMangaEntries;
    let updateMangaEntriesMock;
    let updatedMangaEntries;

    beforeEach(() => {
      updateMangaEntriesMock = jest.spyOn(api, 'bulkUpdateMangaEntry');
      editMangaEntries = shallowMount(EditMangaEntries, {
        store,
        localVue,
        propsData: { selectedEntries: [entry1, entry2] },
      });

      updatedMangaEntries = [
        factories.entry.build({ id: 1, attributes: { status: 2 } }),
        factories.entry.build({ id: 2, attributes: { status: 2 } }),
      ];
    });

    afterEach(() => {
      expect(updateMangaEntriesMock).toHaveBeenCalledWith(
        [1, 2], { status: 2, user_tag_ids: [] },
      );
    });

    describe('if update was successful', () => {
      beforeEach(() => {
        editMangaEntries.setData({ selectedStatus: 2 });

        updateMangaEntriesMock.mockResolvedValue(updatedMangaEntries);
      });

      it('emits editComplete', async () => {
        editMangaEntries.vm.updateMangaEntries();

        await flushPromises();

        expect(editMangaEntries.emitted('editComplete')).toBeTruthy();
      });

      it('tells user how many entries have been updated', async () => {
        const infoMessageMock = jest.spyOn(Message, 'info');

        editMangaEntries.vm.updateMangaEntries();

        await flushPromises();

        expect(infoMessageMock).toHaveBeenCalledWith('2 entries updated');
      });

      it('changes manga entries status', async () => {
        editMangaEntries.vm.updateMangaEntries();

        await flushPromises();

        expect(store.state.lists.entries).toEqual(updatedMangaEntries);
      });
    });

    describe('if update was unsuccessful', () => {
      it("shows couldn't update message and keeps same entries", async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');

        editMangaEntries.setData({ selectedStatus: 10 });
        updateMangaEntriesMock.mockResolvedValue(false);

        editMangaEntries.vm.updateMangaEntries();

        await flushPromises();

        expect(store.state.lists.entries).toEqual([entry1, entry2]);
        expect(store.state.lists.entries).not.toEqual(updatedMangaEntries);
        expect(errorMessageMock).toHaveBeenCalledWith(
          "Couldn't update. Try refreshing the page",
        );
      });
    });
  });
});
