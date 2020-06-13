import { secure } from '@/modules/axios';

const baseURL = '/api/v1/user_tags';

export const index = () => secure
  .get(baseURL)
  .then((response) => response)
  .catch((request) => request.response);
export const create = (userTag) => secure
  .post(baseURL, { user_tag: userTag })
  .then((response) => response)
  .catch((request) => request.response);
export const update = (userTag) => secure
  .put(`${baseURL}/${userTag.id}`, { user_tag: userTag })
  .then((response) => response)
  .catch((request) => request.response);
export const destroy = (id) => secure
  .delete(`${baseURL}/${id}`)
  .then((response) => response)
  .catch((request) => request.response);
