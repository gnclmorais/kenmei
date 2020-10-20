import { Factory } from 'fishery';
import mangaSourceFactory from './mangaSource';

export default Factory.define(({ sequence }) => ({
  id: sequence,
  title: 'Title',
  titleEN: 'Title in English',
  titleENJP: 'Title in Japanese',
  kitsuID: sequence,
  malID: sequence,
  mangaSources: [mangaSourceFactory.build()],
}));
