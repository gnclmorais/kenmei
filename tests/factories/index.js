import { register } from 'fishery';
import entry from './mangaEntry';
import list from './mangaList';
import source from './mangaSource';

// eslint-disable-next-line import/prefer-default-export
export const factories = register({ entry, list, source });
