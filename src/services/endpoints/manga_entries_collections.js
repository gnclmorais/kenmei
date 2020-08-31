import { secure } from '@/modules/axios';

const baseURL = '/api/v1/manga_entries_collections';

/* eslint-disable import/prefer-default-export */
export const update = (attributes) => secure
  .post(baseURL, { manga_entries_collection: attributes })
  .then((response) => response)
  .catch((request) => request.response);
/* eslint-enable import/prefer-default-export */
