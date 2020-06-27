import { register } from 'fishery';
import entry from './mangaEntry';
import userTag from './UserTag';
import source from './mangaSource';

// eslint-disable-next-line import/prefer-default-export
export const factories = register({ entry, source, userTag });
