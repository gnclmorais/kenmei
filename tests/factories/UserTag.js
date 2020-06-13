import { Factory } from 'fishery';

export default Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Isekai',
  description: 'MC ends up in another world',
  entryCount: 1,
}));
