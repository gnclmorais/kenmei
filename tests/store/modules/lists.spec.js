import flushPromises from 'flush-promises';
import { Message } from 'element-ui';
import lists from '@/store/modules/lists';

import * as userTags from '@/services/endpoints/UserTags';
import * as mangaEntries from '@/services/endpoints/v2/manga_entries';

describe('lists', () => {
  describe('getters', () => {
    describe('findEntryFromIDs', () => {
      it('returns first found entry based on entry IDs being passed', () => {
        const entry = factories.entry.build();
        const state = {
          entries: [entry, factories.entry.build()],
        };

        const findEntryFromIDs = lists.getters.findEntryFromIDs(state);

        expect(findEntryFromIDs([entry.id])).toEqual(entry);
      });
    });
  });

  describe('mutations', () => {
    describe('setTags', () => {
      it('sets tags state', () => {
        const newTags = factories.userTag.buildList(1);
        const state = { tags: [] };

        lists.mutations.setTags(state, newTags);

        expect(state.tags).toEqual(newTags);
      });
    });

    describe('setEntries', () => {
      it('sets entries state', () => {
        const newEntries = factories.entry.buildList(1);
        const state = { entries: [] };

        lists.mutations.setEntries(state, newEntries);

        expect(state.entries).toEqual(newEntries);
      });
    });

    describe('setEntriesPagy', () => {
      it('sets entries pagy state', () => {
        const newEntriesPagy = { count: 1, page: 1 };
        const state = { entriesPagy: {} };

        lists.mutations.setEntriesPagy(state, newEntriesPagy);

        expect(state.entriesPagy).toEqual(newEntriesPagy);
      });
    });

    describe('addEntry', () => {
      it('adds a new manga entry to start of entries array', () => {
        const newEntry = factories.entry.build({ id: 2 });
        const state = { entries: factories.entry.buildList(1) };

        lists.mutations.addEntry(state, newEntry);

        expect(state.entries[0]).toEqual(newEntry);
      });
    });

    describe('updateEntry', () => {
      it('updates existing manga entry with the new state', () => {
        let entryToUpdate = factories.entry.build(
          { id: 1, attributes: { title: 'Manga Title' } },
        );
        let entry = factories.entry.build(
          { id: 2, attributes: { title: 'Manga Title' } },
        );

        const state = { entries: [entryToUpdate, entry] };

        const updatedEntry = factories.entry.build(
          { id: 1, attributes: { title: 'Updated Title' } },
        );

        lists.mutations.updateEntry(state, updatedEntry);

        entryToUpdate = state.entries.find((e) => e.id === 1);
        entry = state.entries.find((e) => e.id === 2);

        expect(entryToUpdate.attributes.title).toContain('Updated Title');
        expect(entry.attributes.title).toContain('Manga Title');
      });
    });

    describe('replaceEntry', () => {
      it('replaces existing manga entry with the one passed', () => {
        const currentEntry = factories.entry.build(
          { id: 1, attributes: { title: 'Manga Title' } },
        );

        const state = { entries: [currentEntry] };

        const newEntry = factories.entry.build(
          { id: 3, attributes: { title: 'Updated Title' } },
        );

        lists.mutations.replaceEntry(state, { currentEntry, newEntry });

        expect(state.entries.length).toBe(1);
        expect(state.entries[0]).toEqual(newEntry);
      });
    });

    describe('removeEntries', () => {
      it('removes a manga entry', () => {
        const entryToStay = factories.entry.build({ id: '1' });
        const state = {
          entries: [
            entryToStay,
            factories.entry.build({ id: '2' }),
            factories.entry.build({ id: '3' }),
          ],
        };

        lists.mutations.removeEntries(state, ['2', '3']);

        expect(state.entries).toEqual([entryToStay]);
      });
    });

    describe('setTagsLoading', () => {
      it('sets tagsLoading state', () => {
        const state = { tagsLoading: false };

        lists.mutations.setTagsLoading(state, true);

        expect(state.tagsLoading).toBeTruthy();
      });
    });
  });

  describe('actions', () => {
    let commit;

    beforeEach(() => {
      commit = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('getTags', () => {
      it('retrieves tags from the api', async () => {
        const userTagsSpy = jest.spyOn(userTags, 'index');
        const initLists = factories.userTag.buildList(1);

        userTagsSpy.mockResolvedValue({ status: 200, data: initLists });

        lists.actions.getTags({ commit });

        await flushPromises();

        expect(userTagsSpy).toHaveBeenCalled();
        expect(commit).toHaveBeenCalledWith('setTags', initLists);
      });

      it('shows error message if request has failed', async () => {
        const userTagsSpy     = jest.spyOn(userTags, 'index');
        const errorMessageSpy = jest.spyOn(Message, 'error');

        const data = { error: 'Tags not found' };

        userTagsSpy.mockResolvedValue({ status: 500, data });

        lists.actions.getTags({ commit });

        await flushPromises();

        expect(userTagsSpy).toHaveBeenCalled();
        expect(errorMessageSpy).toHaveBeenLastCalledWith(data.error);
        expect(commit).not.toHaveBeenCalledWith('setTags');
      });
    });

    describe('getEntries', () => {
      let params;

      beforeEach(() => {
        params = {
          page: 1,
          status: 'reading',
          tagIDs: [],
          searchTerm: '',
          sort: { Title: 'asc' },
        };
      });

      it('retrieves manga entries from the api', async () => {
        const mangaEntriesSpy = jest.spyOn(mangaEntries, 'index');
        const entries  = factories.entry.buildList(1);
        const pagy = {
          count: 1,
          from: 1,
          items: 1,
          last: 1,
          next: null,
          offset: 0,
          outset: 0,
          page: 1,
          pages: 1,
          prev: null,
          to: 1,
        };

        mangaEntriesSpy.mockResolvedValue({
          status: 200, data: { entries, pagy },
        });

        lists.actions.getEntries({ commit }, params);

        await flushPromises();

        expect(mangaEntriesSpy).toHaveBeenCalledWith(...Object.values(params));
        expect(commit).toHaveBeenCalledWith('setEntries', entries);
        expect(commit).toHaveBeenCalledWith('setEntriesPagy', pagy);
      });

      it('shows error message if request has failed', async () => {
        const mangaEntriesSpy = jest.spyOn(mangaEntries, 'index');
        const errorMessageSpy = jest.spyOn(Message, 'error');

        const data = { error: 'Entries not found' };

        mangaEntriesSpy.mockResolvedValue({ status: 500, data });

        lists.actions.getEntries({ commit }, params);

        await flushPromises();

        expect(mangaEntriesSpy).toHaveBeenCalledWith(...Object.values(params));
        expect(errorMessageSpy).toHaveBeenLastCalledWith(data.error);
        expect(commit).not.toHaveBeenCalledWith('setEntries');
        expect(commit).not.toHaveBeenCalledWith('setEntriesPagy');
      });
    });
  });
});
