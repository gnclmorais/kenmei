import { Factory } from 'fishery';

export default Factory.define(({ sequence }) => ({
  id: sequence,
  manga_source_id: 1,
  manga_series_id: 1,
  user_tag_ids: [],
  attributes: {
    title: 'Manga Title',
    status: 1,
    last_chapter_read: '1',
    last_chapter_available: '2',
    last_released_at: '2019-01-01T00:00:00.000Z',
    tracked_entries: [
      {
        id: 1,
        manga_source_id: 1,
        manga_series_id: 1,
      },
    ],
  },
  links: {
    series_url: 'example.url/manga/1',
    last_chapter_read_url: 'example.url/chapter/1',
    last_chapter_available_url: 'example.url/chapter/2',
  },
}));
