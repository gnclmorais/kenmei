import { secure } from '@/modules/axios';
import qs from 'qs';

const baseURL = '/api/v2/manga_entries';

/* eslint-disable import/prefer-default-export, object-curly-newline */
export const index = (page, status, tagIDs, searchTerm, sort) => secure
  .get(baseURL, {
    params: {
      page, status, user_tag_ids: tagIDs, search_term: searchTerm, sort,
    },
    paramsSerializer: (params) => qs.stringify(params, {
      arrayFormat: 'brackets',
    }),
  })
  .then((response) => response)
  .catch((request) => request.response);
/* eslint-enable import/prefer-default-export */
