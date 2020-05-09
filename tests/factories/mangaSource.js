import { Factory } from 'fishery';

export default Factory.define(({ sequence }) => ({
  id: sequence,
  manga_series_id: 1,
  name: 'MangaDex',
}));
