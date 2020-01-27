import mangaList from '../fixtures/mangalist';
import * as Importer from '@/services/importer';

describe('Importer', () => {
  describe('processList', () => {
    it('filters Trackr list into API ready object with MangaDex only entries', () => {
      const filtered = Importer.processList(mangaList);

      expect(Object.keys(filtered)).toEqual(
        ['Reading', 'On-Hold', 'Plan to Read']
      );
    });
  });
});
