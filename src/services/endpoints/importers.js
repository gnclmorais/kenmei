import { secure } from '@/modules/axios';

const baseURL = '/api/v1/importers';

export const postTrackrMoe = (filteredLists) => secure
  .post('/api/v1/importers/trackr_moe', { lists: filteredLists })
  .then((response) => response)
  .catch((request) => request.response);

export const postMDList = (url) => secure
  .post(`${baseURL}/mangadex`, { url })
  .then((response) => response)
  .catch((request) => request.response);
