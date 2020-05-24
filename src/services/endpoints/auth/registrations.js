import { plain } from '@/modules/axios';

const baseURL = '/auth/registrations';

/* eslint-disable import/prefer-default-export */
export const create = (user) => plain
  .post(baseURL, { user })
  .then((request) => request)
  .catch((request) => request.response);
/* eslint-enable import/prefer-default-export */
