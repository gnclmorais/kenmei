import { Message } from 'element-ui';
import * as userTags from '@/services/endpoints/UserTags';
import * as mangaEntries from '@/services/endpoints/v2/manga_entries';

// Can't access getter inside mutations, hence this has to be a plain function
export const getEntryIndex = (state, id) => state.entries.findIndex(
  (e) => e.id === id,
);

const state = {
  tags: [],
  entries: [],
  entriesPagy: {},
  statuses: [
    { enum: 1, name: 'Reading' },
    { enum: 2, name: 'On Hold' },
    { enum: 3, name: 'Plan to Read' },
    { enum: 4, name: 'Completed' },
    { enum: 5, name: 'Dropped' },
  ],
  tagsLoading: false,
};

const getters = {
  findEntryFromIDs: (state) => (ids) => state.entries.find(
    (entry) => ids.includes(entry.id),
  ),
};

const actions = {
  async getTags({ commit }) {
    const response = await userTags.index();
    const { status, data } = response;

    return status === 200 ? commit('setTags', data) : Message.error(data.error);
  },
  async getEntries({ commit }, { page, status, tagIDs, searchTerm, sort }) {
    const response = await mangaEntries.index(
      page, status, tagIDs, searchTerm, sort,
    );

    if (response.status === 200) {
      commit('setEntries', response.data.entries);
      commit('setEntriesPagy', response.data.pagy);
    } else {
      Message.error(response.data.error);
    }
  },
};

const mutations = {
  setTags(state, data) {
    state.tags = data;
  },
  setEntries(state, data) {
    state.entries = data;
  },
  setEntriesPagy(state, data) {
    state.entriesPagy = data;
  },
  addEntry(state, data) {
    state.entries.push(data);
  },
  updateEntry(state, data) {
    state.entries.splice(getEntryIndex(state, data.id), 1, data);
  },
  replaceEntry(state, { currentEntry, newEntry }) {
    state.entries.splice(getEntryIndex(state, currentEntry.id), 1, newEntry);
  },
  removeEntries(state, entryIDs) {
    state.entries = state.entries.filter(
      (mangaEntry, _index, _arr) => !entryIDs.includes(mangaEntry.id),
    );
  },
  setTagsLoading(state, data) {
    state.tagsLoading = data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
