import { Message } from 'element-ui';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';

import MangaList from '@/components/TheMangaList.vue';
import lists from '@/store/modules/lists';
import * as api from '@/services/api';

const localVue = createLocalVue();

localVue.directive('loading', true);
localVue.directive('tippy', true);
localVue.use(Vuex);

describe('TheMangaList.vue', () => {
  let mangaList;
  let store;

  const defaultEntries = factories.entry.buildList(1);

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        lists: {
          namespaced: true,
          state: {
            tags: [
              factories.userTag.build(),
              factories.userTag.build({ id: 2, name: 'Completed' }),
            ],
            entries: defaultEntries,
            statuses: lists.state.statuses,
          },
          mutations: lists.mutations,
          getters: lists.getters,
        },
      },
    });
    mangaList = mount(MangaList, {
      store,
      localVue,
      propsData: {
        tableData: defaultEntries,
      },
    });
  });

  describe('when showing entries', () => {
    it('displays status name for each entry', async () => {
      const entry1 = factories.entry.build({ id: '1' });
      const entry2 = factories.entry.build({ id: '2', attributes: { status: 4 } });

      await mangaList.setProps({ tableData: [entry1, entry2] });

      const rows = mangaList.findAll('.el-table__row');

      expect(rows.at(0).text()).toContain('Reading');
      expect(rows.at(1).text()).toContain('Completed');
    });

    it('displays volume and/or chapter', async () => {
      const entry1 = factories.entry.build({
        id: '1', attributes: { last_volume_read: '1' },
      });
      const entry2 = factories.entry.build();

      await mangaList.setProps({ tableData: [entry1, entry2] });

      const rows = mangaList.findAll('.el-table__row');

      expect(rows.at(0).text()).toContain(
        `Vol. ${entry1.attributes.last_volume_read} Ch. ${
          entry1.attributes.last_chapter_read
        }`,
      );
      expect(rows.at(1).text()).toContain(
        `Ch. ${entry2.attributes.last_chapter_read}`,
      );
    });
  });

  describe('when updating a manga entry', () => {
    let updateMangaEntryMock;

    beforeEach(() => {
      updateMangaEntryMock = jest.spyOn(api, 'updateMangaEntry');
      mangaList.setData({ sortedData: defaultEntries });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('sets last chapter read button to loading', async () => {
      updateMangaEntryMock.mockResolvedValue(false);

      expect(mangaList.vm.$data.entryUpdated).toBeNull();

      mangaList.findComponent({ ref: 'updateEntryButton' }).trigger('click');

      expect(mangaList.vm.$data.entryUpdated).toBe(defaultEntries[0]);

      await flushPromises();

      expect(mangaList.vm.$data.entryUpdated).toBeNull();
    });

    it('mutates the state and shows success message', async () => {
      const infoMessageMock = jest.spyOn(Message, 'info');
      const mangaEntry = factories.entry.build({
        id: 1,
        attributes: {
          title: 'Manga Title',
          last_volume_read: '2',
          last_chapter_read: '2',
          last_chapter_available: '2',
        },
      });

      updateMangaEntryMock.mockResolvedValue(mangaEntry);

      mangaList.findComponent({ ref: 'updateEntryButton' }).trigger('click');

      await flushPromises();

      expect(infoMessageMock).toHaveBeenCalledWith(
        'Updated last read to Ch. 2',
      );
    });

    it('shows error message if update failed', async () => {
      const errorMessageMock = jest.spyOn(Message, 'error');

      // TODO: Change to correct mockRejectedValue, when I am able to fix the
      // issue with using it
      updateMangaEntryMock.mockResolvedValue(false);

      mangaList.findComponent({ ref: 'updateEntryButton' }).trigger('click');

      await flushPromises();

      expect(errorMessageMock).toHaveBeenCalledWith(
        "Couldn't update. Try refreshing the page",
      );
    });
  });

  describe('@events', () => {
    const entry1 = factories.entry.build({ id: '1' });
    const entry2 = factories.entry.build({ id: '2' });

    beforeEach(() => {
      mangaList.setData({ sortedData: [entry1, entry2] });
    });

    it('@handleSelectionChange - when selecting rows, emits seriesSelected', async () => {
      mangaList.findAll('.el-checkbox').trigger('click');

      expect(mangaList.emitted('seriesSelected')[1][0]).toEqual([entry1, entry2]);
    });

    it('@editEntry - when editing an entry, emits editEntry', async () => {
      mangaList.findComponent({ ref: 'editEntryButton' }).trigger('click');

      expect(mangaList.emitted('editEntry')).toBeTruthy();
      expect(mangaList.emitted('editEntry')[0]).toEqual([entry2]);
    });
  });

  describe('when no last chapter is available', () => {
    it('Released at column shows Unknown', async () => {
      const entry = factories.entry.build({
        attributes: { title: 'Manga Title', last_released_at: null },
      });

      await mangaList.setProps({ tableData: [entry] });

      expect(mangaList.text()).toContain('Unknown');
    });

    it('Latest Chapter column shows no chapters', async () => {
      await mangaList.setProps({
        tableData: [
          factories.entry.build(
            { links: { last_chapter_available_url: null } },
          ),
        ],
      });

      expect(mangaList.text()).toContain('No chapters');
    });
  });

  describe(':props', () => {
    it(':tableData - sanitizes manga title to convert special characters', async () => {
      const entry = factories.entry.build({
        attributes: { title: '&Uuml;bel Blatt' },
      });

      await mangaList.setProps({ tableData: [entry] });

      expect(mangaList.find('.el-link--inner').text()).toContain('Übel Blatt');
    });

    it(':tableData - shows sites tracked if more than one', async () => {
      const newMangaEntry = factories.entry.build();

      newMangaEntry.attributes.tracked_entries.push({
        id: 2,
        manga_source_id: 2,
        manga_series_id: 1,
      });

      await mangaList.setProps({ tableData: [newMangaEntry] });

      expect(mangaList.text()).toContain('2 sites tracked');
    });
  });
});
