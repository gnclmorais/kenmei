import { Factory } from 'fishery';

export default Factory.define(({ sequence }) => ({
  id: '1',
  type: 'manga_list',
  attributes: {
    id: sequence,
    name: 'Reading',
  },
  relationships: {
    manga_entries: {
      data: {
        id: '1',
        type: 'manga_entry',
      },
    },
  },
}));
