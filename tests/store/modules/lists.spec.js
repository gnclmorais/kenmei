import axios from 'axios';
import flushPromises from 'flush-promises';
import { Message } from 'element-ui';
import lists from '@/store/modules/lists';

describe('lists', () => {
  describe('getters', () => {
    describe('getEntriesByTagIDs', () => {
      it('returns entries that has all tag ids specified', () => {
        const singleTag = factories.entry.build({ user_tag_ids: [1] });
        const bothTags = factories.entry.build({ user_tag_ids: [1, 2] });
        const state = {
          entries: [
            singleTag,
            bothTags,
            factories.entry.build({ user_tag_ids: [3] }),
          ],
        };

        let getEntriesByTagIDs = lists.getters.getEntriesByTagIDs(state);

        expect(getEntriesByTagIDs([1])).toEqual([singleTag, bothTags]);

        getEntriesByTagIDs = lists.getters.getEntriesByTagIDs(state);

        expect(getEntriesByTagIDs([1, 2])).toEqual([bothTags]);
      });
    });

    describe('getEntriesByStatus', () => {
      it('returns entries based on status enum', () => {
        const expectedReturn = factories.entry.build({
          attributes: { status: 4 },
        });
        const state = {
          entries: [
            expectedReturn,
            factories.entry.build({ attributes: { status: 1 } }),
          ],
        };

        const getEntriesByStatus = lists.getters.getEntriesByStatus(state);

        expect(getEntriesByStatus(4)).toEqual([expectedReturn]);
      });

      it('returns all entries if enum is -1', () => {
        const entry1 = factories.entry.build({ attributes: { status: 1 } });
        const entry2 = factories.entry.build({ attributes: { status: 2 } });
        const state  = { entries: [entry1, entry2] };

        const getEntriesByStatus = lists.getters.getEntriesByStatus(state);

        expect(getEntriesByStatus(-1)).toEqual([entry1, entry2]);
      });
    });

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

    describe('addEntry', () => {
      it('adds a new manga entry to state', () => {
        const newEntry = factories.entry.build({ id: 2 });
        const state = { entries: factories.entry.buildList(1) };

        lists.mutations.addEntry(state, newEntry);

        expect(state.entries).toContain(newEntry);
      });
    });

    describe('updateEntry', () => {
      it('updates existing manga entry with the new state', () => {
        let entryToUpdate = factories.entry.build(
          { id: 1, attributes: { title: 'Manga Title' } }
        );
        let entry = factories.entry.build(
          { id: 2, attributes: { title: 'Manga Title' } }
        );

        const state = { entries: [entryToUpdate, entry] };

        const updatedEntry = factories.entry.build(
          { id: 1, attributes: { title: 'Updated Title' } }
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
          { id: 1, attributes: { title: 'Manga Title' } }
        );

        const state = { entries: [currentEntry] };

        const newEntry = factories.entry.build(
          { id: 3, attributes: { title: 'Updated Title' } }
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
        const axiosSpy  = jest.spyOn(axios, 'get');
        const initLists = factories.userTag.buildList(1);

        axiosSpy.mockResolvedValue({ status: 200, data: initLists });

        lists.actions.getTags({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/user_tags/');
        expect(commit).toHaveBeenCalledWith('setTags', initLists);
      });

      it('shows error message if request has failed', async () => {
        const axiosSpy        = jest.spyOn(axios, 'get');
        const errorMessageSpy = jest.spyOn(Message, 'error');
        const mockResponse    = {
          response: { data: { error: 'Tags not found' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        lists.actions.getTags({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/user_tags/');
        expect(errorMessageSpy).toHaveBeenLastCalledWith(
          mockResponse.response.data.error
        );
        expect(commit).not.toHaveBeenCalledWith('setTags', mockResponse);
      });
    });

    describe('getEntries', () => {
      it('retrieves manga entries from the api', async () => {
        const axiosSpy = jest.spyOn(axios, 'get');
        const entries  = factories.entry.buildList(1);

        axiosSpy.mockResolvedValue({ status: 200, data: { data: entries } });

        lists.actions.getEntries({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/manga_entries/');
        expect(commit).toHaveBeenCalledWith('setEntries', entries);
      });

      it('shows error message if request has failed', async () => {
        const axiosSpy        = jest.spyOn(axios, 'get');
        const errorMessageSpy = jest.spyOn(Message, 'error');
        const mockResponse    = {
          response: { data: { error: 'Entries not found' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        lists.actions.getEntries({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/manga_entries/');
        expect(errorMessageSpy).toHaveBeenLastCalledWith(
          mockResponse.response.data.error
        );
        expect(commit).not.toHaveBeenCalledWith('setEntries', mockResponse);
      });
    });
  });
});
