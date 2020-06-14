import { Message } from 'element-ui';
import { secure } from '@/modules/axios';

// Can't access getter inside mutations, hence this has to be a plain function
export const getEntryIndex = (state, id) => state.entries.findIndex(
  (e) => e.id === id
);

const state = {
  tags: [],
  entries: [],
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
  getEntriesByTagIDs: (state) => (tagIDs) => state.entries.filter(
    (entry) => tagIDs.every((id) => entry.user_tag_ids.includes(id))
  ),
  getEntriesByStatus: (state) => (status) => state.entries.filter(
    (entry) => status === -1 || entry.attributes.status === status
  ),
  findEntryFromIDs: (state) => (ids) => state.entries.find(
    (entry) => ids.includes(entry.id)
  ),
};

const actions = {
  getTags({ commit }) {
    return secure.get('/api/v1/user_tags/')
      .then((response) => {
        commit('setTags', response.data);
      })
      .catch((request) => { Message.error(request.response.data.error); });
  },
  getEntries({ commit }) {
    return secure.get('/api/v1/manga_entries/')
      .then((response) => {
        commit('setEntries', response.data.data);
      })
      .catch((request) => { Message.error(request.response.data.error); });
  },
};

const mutations = {
  setTags(state, data) {
    state.tags = data;
  },
  setEntries(state, data) {
    state.entries = data;
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
      (mangaEntry, _index, _arr) => !entryIDs.includes(mangaEntry.id)
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
