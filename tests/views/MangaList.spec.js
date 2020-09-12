import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import MangaList from '@/views/MangaList.vue';
import TheMangaList from '@/components/TheMangaList.vue';
import BulkActions from '@/components/BulkActions.vue';
import AddMangaEntry from '@/components/manga_entries/AddMangaEntry.vue';
import EditMangaEntries from '@/components/manga_entries/EditMangaEntries.vue';
import lists from '@/store/modules/lists';
import * as api from '@/services/api';
import * as resource from '@/services/endpoints/manga_entries_collections';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);
localVue.directive('tippy', true);

describe('MangaList.vue', () => {
  let store;
  let tag1;
  let tag2;
  let entry1;
  let entry2;
  let entry3;

  beforeEach(() => {
    tag1 = factories.userTag.build({ id: 1 });
    tag2 = factories.userTag.build({ id: 2 });

    entry1 = factories.entry.build({
      id: 1, attributes: { title: 'Boku no Hero', status: 1 },
    });
    entry2 = factories.entry.build({
      id: 2,
      user_tag_ids: [tag2.id],
      attributes: { title: 'Attack on Titan', status: 1 },
    });
    entry3 = factories.entry.build({
      id: 3, attributes: { title: 'Berserk', status: 2 },
    });

    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: {
            tags: [tag1, tag2],
            entries: [entry1, entry2, entry3],
            statuses: lists.state.statuses,
          },
          actions: lists.actions,
          getters: lists.getters,
          mutations: lists.mutations,
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when adding new manga entry', () => {
    let mangaList;
    let modal;

    beforeEach(() => {
      mangaList = shallowMount(MangaList, {
        store,
        localVue,
        data() {
          return {
            selectedEntries: [entry1],
          };
        },
        methods: {
          clearTableSelection() {
            return true;
          },
        },
      });

      modal = mangaList.findComponent({ ref: 'addMangaEntryModal' });
    });

    it('shows add manga entry modal', async () => {
      await mangaList.findComponent({ ref: 'addMangaEntryModalButton' }).trigger('click');

      expect(modal.element).toBeVisible();
    });

    describe('@events', () => {
      it('@dialogClosed - closes add manga dialog', () => {
        mangaList.findComponent(AddMangaEntry).vm.$emit('dialogClosed');

        expect(mangaList.vm.$data.dialogVisible).toBe(false);
      });
    });
  });
  describe('when editing manga entries', () => {
    let mangaList;
    let modal;

    beforeEach(() => {
      mangaList = shallowMount(MangaList, {
        store,
        localVue,
        data() {
          return {
            selectedEntries: [entry1],
          };
        },
        methods: {
          clearTableSelection() {
            return true;
          },
        },
      });

      modal = mangaList.findComponent({ ref: 'editMangaEntryModal' });
    });

    it('shows edit manga entries modal', async () => {
      await mangaList.findComponent(BulkActions).vm.$emit('edit');

      expect(modal.element).toBeVisible();
    });

    describe('@events', () => {
      it('@editComplete - resets selected manga entries and closes modal', async () => {
        await mangaList.setData({ editDialogVisible: true });

        mangaList.findComponent(EditMangaEntries).vm.$emit('editComplete');

        expect(mangaList.vm.$data.editDialogVisible).toBeFalsy();
        expect(mangaList.vm.$data.selectedEntries).toEqual([]);
      });

      it('@editEntry - shows edit manga entry dialog with specific entry', () => {
        mangaList.findComponent(TheMangaList).vm.$emit('editEntry', entry1);

        expect(mangaList.vm.$data.editDialogVisible).toBeTruthy();
        expect(mangaList.vm.$data.selectedEntries).toEqual([entry1]);
      });
    });
  });
  describe('when updating manga entries', () => {
    let entry1;
    let entry2;
    let store;
    let mangaList;
    let updateEntriesCollectionSpy;
    let updatedMangaEntries;

    beforeEach(() => {
      updateEntriesCollectionSpy = jest.spyOn(resource, 'update');

      entry1 = factories.entry.build({
        id: 1,
        attributes: { last_chapter_read: '1', last_chapter_available: '2' },
        links: {
          last_chapter_read_url: 'example.url/chapter/1',
          last_chapter_available_url: 'example.url/chapter/2',
        },
      });
      entry2 = factories.entry.build({
        id: 2,
        attributes: {
          last_chapter_read: '3',
          last_volume_available: '2',
          last_chapter_available: '4',
        },
        links: {
          last_chapter_read_url: 'example.url/chapter/3',
          last_chapter_available_url: 'example.url/chapter/4',
        },
      });

      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              tags: [],
              entries: [entry1, entry2],
              statuses: lists.state.statuses,
            },
            actions: lists.actions,
            getters: lists.getters,
            mutations: lists.mutations,
          },
        },
      });

      mangaList = shallowMount(MangaList, {
        store,
        localVue,
        data() { return { selectedEntries: [entry1, entry2] }; },
        methods: {
          clearTableSelection() {
            return true;
          },
        },
      });

      updatedMangaEntries = [
        factories.entry.build({
          id: 1,
          attributes: { last_chapter_read: '2' },
          links: { last_chapter_read_url: 'example.url/chapter/2' },
        }),
        factories.entry.build({
          id: 2,
          attributes: { last_volume_read: '2', last_chapter_read: '4' },
          links: { last_chapter_read_url: 'example.url/chapter/4' },
        }),
      ];
    });

    afterEach(() => {
      expect(updateEntriesCollectionSpy).toHaveBeenCalledWith(
        [
          {
            id: entry1.id,
            last_chapter_read: entry1.attributes.last_chapter_available,
            last_volume_read: entry1.attributes.last_volume_available,
            last_chapter_read_url: entry1.links.last_chapter_available_url,
          },
          {
            id: entry2.id,
            last_chapter_read: entry2.attributes.last_chapter_available,
            last_volume_read: entry2.attributes.last_volume_available,
            last_chapter_read_url: entry2.links.last_chapter_available_url,
          },
        ],
      );
    });

    describe('if update was successful', () => {
      beforeEach(() => {
        updateEntriesCollectionSpy.mockResolvedValue({
          status: 200,
          data: { data: updatedMangaEntries },
        });
      });

      it('tells user how many entries have been updated', async () => {
        const infoMessageMock = jest.spyOn(Message, 'info');

        mangaList.vm.updateEntries();

        await flushPromises();

        expect(infoMessageMock).toHaveBeenCalledWith('Updated 2 entries');
      });

      it('replaces manga entries with newly updates attributes', async () => {
        mangaList.vm.updateEntries();

        await flushPromises();

        expect(store.state.lists.entries).toEqual(updatedMangaEntries);
      });
    });

    describe('if update was unsuccessful', () => {
      it("shows couldn't update message and keeps same entries", async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');

        updateEntriesCollectionSpy.mockResolvedValue({ status: 500 });

        mangaList.vm.updateEntries();

        await flushPromises();

        expect(store.state.lists.entries).toEqual([entry1, entry2]);
        expect(errorMessageMock).toHaveBeenCalledWith(
          "Couldn't update. Try refreshing the page",
        );
      });
    });
  });
  describe('when deleting manga entries', () => {
    let mangaList;

    beforeEach(() => {
      mangaList = shallowMount(MangaList, {
        store,
        localVue,
        data() {
          return {
            selectedEntries: [entry1],
          };
        },
        methods: {
          clearTableSelection() {
            return true;
          },
        },
      });
    });

    describe('when entry has multiple sources tracked', () => {
      it('shows deleteMangaEntries modal', () => {
        const entry3 = factories.entry.build({
          id: 3,
          attributes: { tracked_entries: [{ id: 3 }, { id: 12 }] },
        });

        mangaList.setData({
          selectedEntries: [entry1, entry3],
        });

        mangaList.vm.deleteEntries();

        expect(mangaList.vm.$data.deleteDialogVisible).toBeTruthy();
      });
    });

    describe('when entry does not have multiple sources tracked', () => {
      let bulkDeleteMangaEntriesMock;

      beforeEach(() => {
        bulkDeleteMangaEntriesMock = jest.spyOn(api, 'bulkDeleteMangaEntries');
      });

      afterEach(() => {
        expect(bulkDeleteMangaEntriesMock).toHaveBeenCalledWith([entry1.id]);
      });

      describe('and deletion was successful', () => {
        beforeEach(() => { bulkDeleteMangaEntriesMock.mockResolvedValue(true); });

        it('tells user how many entries have been deleted', async () => {
          const infoMessageMock = jest.spyOn(Message, 'info');

          mangaList.vm.deleteEntries();

          await flushPromises();

          expect(infoMessageMock).toHaveBeenCalledWith('1 entries deleted');
        });

        it('removes deleted entries', async () => {
          expect(mangaList.vm.entries).toContain(entry1);

          mangaList.vm.deleteEntries();

          await flushPromises();

          expect(mangaList.vm.entries).not.toContain(entry1);
        });
      });

      describe('and deletion was unsuccessful', () => {
        it('shows deletion fail message and keeps entry persisted', async () => {
          const errorMessageMock = jest.spyOn(Message, 'error');

          bulkDeleteMangaEntriesMock.mockResolvedValue(false);

          mangaList.vm.deleteEntries();

          await flushPromises();

          expect(mangaList.vm.entries).toContain(entry1);
          expect(errorMessageMock).toHaveBeenCalledWith(
            'Deletion failed. Try reloading the page before trying again',
          );
        });
      });
    });
  });
  describe('@events', () => {
    let mangaList;

    beforeEach(() => {
      mangaList = shallowMount(MangaList, { store, localVue });
    });

    it('@seriesSelected - toggles bulk actions and sets selected series', async () => {
      expect(mangaList.find('bulk-actions-stub').element).not.toBeVisible();

      await mangaList.findComponent(TheMangaList).vm.$emit(
        'seriesSelected',
        [entry1]
      );

      expect(mangaList.find('bulk-actions-stub').element).toBeVisible();
      expect(mangaList.vm.$data.selectedEntries).toContain(entry1);
    });
  });
  describe(':data', () => {
    it(':searchTerm - if present, filters manga entries', () => {
      const mangaList = shallowMount(MangaList, { store, localVue });

      jest.useFakeTimers();

      expect(mangaList.vm.filteredEntries).toEqual([entry1, entry2]);

      mangaList.setData({ searchTerm: 'Boku no' });
      jest.runAllTimers();

      expect(mangaList.vm.filteredEntries).toEqual([entry1]);

      mangaList.setData({ searchTerm: 'Attack' });
      jest.runAllTimers();

      expect(mangaList.vm.filteredEntries).toEqual([entry2]);
    });

    describe(':selectedTagIDs', () => {
      it('filters entries based on tags', async () => {
        const mangaList = shallowMount(MangaList, { store, localVue });

        await mangaList.setData({ selectedTagIDs: [tag2.id] });

        expect(mangaList.vm.filteredEntries).toEqual([entry2]);
      });
    });

    describe(':selectedStatus', () => {
      it('filters entries based on status enum', async () => {
        const mangaList = shallowMount(MangaList, { store, localVue });

        await mangaList.setData({ selectedStatus: 2 });

        expect(mangaList.vm.filteredEntries).toEqual([entry3]);
      });
    });
  });
  describe(':lifecycle', () => {
    let actions;

    beforeEach(() => {
      actions = { getTags: jest.fn(), getEntries: jest.fn() };
      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              tags: factories.userTag.buildList(1),
              entries: [entry1, entry2],
              statuses: lists.state.statuses,
            },
            actions,
            getters: lists.getters,
            mutations: lists.mutations,
          },
        },
      });
    });

    it(':created() - loads tags and entries, while toggling loading', async () => {
      shallowMount(MangaList, { store, localVue });

      await flushPromises();

      expect(actions.getTags).toHaveBeenCalled();
      expect(actions.getEntries).toHaveBeenCalled();
    });
  });
});
