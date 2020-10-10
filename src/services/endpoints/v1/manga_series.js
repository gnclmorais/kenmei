import { secure } from '@/modules/axios';

const baseURL = '/api/v1/manga_series';

/* eslint-disable import/prefer-default-export, object-curly-newline */
export const index = (searchTerm) => secure
  .get(baseURL, { params: { search_term: searchTerm } })
  .then((response) => response)
  .catch((request) => request.response);
/* eslint-enable import/prefer-default-export */
