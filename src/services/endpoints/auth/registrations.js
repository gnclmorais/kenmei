import { plain, secure } from '@/modules/axios';

const baseURL = '/auth/registrations';

export const create = (user) => plain
  .post(baseURL, { user })
  .then((request) => request)
  .catch((request) => request.response);
export const update = (user) => plain
  .put(`${baseURL}/${user.id}`, { user: { email: user.email } })
  .then((request) => request)
  .catch((request) => request.response);
export const destroy = (id) => secure
  .delete(`${baseURL}/${id}`)
  .then((request) => request)
  .catch((request) => request.response);
