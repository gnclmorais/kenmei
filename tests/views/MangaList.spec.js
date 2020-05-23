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

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);
localVue.directive('tippy', true);

describe('MangaList.vue', () => {
  let store;
  let list1;
  let list2;
  let entry1;
  let entry2;
  let entry3;

  beforeEach(() => {
    list1 = factories.list.build({ id: '1' });
    list2 = factories.list.build({ id: '2' });

    entry1 = factories.entry.build({
      id: 1, attributes: { title: 'Boku no Hero', status: 1 },
    });
    entry2 = factories.entry.build({
      id: 2,
      manga_list_id: list2.id,
      attributes: { title: 'Attack on Titan', status: 1 },
    });
    entry3 = factories.entry.build({
      id: 3, manga_list_id: null, attributes: { title: 'Berserk', status: 2 },
    });

    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: {
            lists: [list1],
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

      modal = mangaList.find({ ref: 'addMangaEntryModal' });
    });

    it('shows add manga entry modal', async () => {
      await mangaList.find({ ref: 'addMangaEntryModalButton' }).trigger('click');

      expect(modal.element).toBeVisible();
    });

    describe('@events', () => {
      it('@dialogClosed - closes add manga dialog', () => {
        mangaList.find(AddMangaEntry).vm.$emit('dialogClosed');

        expect(mangaList.vm.$data.dialogVisible).toBe(false);
      });
    });
  });
  describe('when updating manga entries', () => {
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

      modal = mangaList.find({ ref: 'editMangaEntryModal' });
    });

    it('shows edit manga entries modal', async () => {
      await mangaList.find(BulkActions).vm.$emit('edit');

      expect(modal.element).toBeVisible();
    });

    describe('@events', () => {
      it('@cancelEdit - closes edit manga entries dialog', async () => {
        await mangaList.setData({ editDialogVisible: true });

        mangaList.find(EditMangaEntries).vm.$emit('cancelEdit');

        expect(mangaList.vm.$data.editDialogVisible).toBeFalsy();
      });

      it('@editComplete - resets selected manga entries and closes modal', async () => {
        await mangaList.setData({ editDialogVisible: true });

        mangaList.find(EditMangaEntries).vm.$emit('editComplete');

        expect(mangaList.vm.$data.editDialogVisible).toBeFalsy();
        expect(mangaList.vm.$data.selectedEntries).toEqual([]);
      });

      it('@editEntry - shows edit manga entry dialog with specific entry', () => {
        mangaList.find(TheMangaList).vm.$emit('editEntry', entry1);

        expect(mangaList.vm.$data.editDialogVisible).toBeTruthy();
        expect(mangaList.vm.$data.selectedEntries).toEqual([entry1]);
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
            'Deletion failed. Try reloading the page before trying again'
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

      await mangaList.find(TheMangaList).vm.$emit('seriesSelected', [entry1]);

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

    describe(':selectedListIDs', () => {
      it('filters entries based on tags', async () => {
        const mangaList = shallowMount(MangaList, { store, localVue });

        await mangaList.setData({ selectedListIDs: [list2.id] });

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
      actions = { getLists: jest.fn(), getEntries: jest.fn() };
      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              lists: factories.list.buildList(1),
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

    it(':created() - loads lists and entries, while toggling loading', async () => {
      shallowMount(MangaList, { store, localVue });

      await flushPromises();

      expect(actions.getLists).toHaveBeenCalled();
      expect(actions.getEntries).toHaveBeenCalled();
    });
  });
});
