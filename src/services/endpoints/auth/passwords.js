import { plain } from '@/modules/axios';

const baseURL = '/auth/passwords';

export const create = (email) => plain
  .post(baseURL, { email })
  .then((request) => request)
  .catch((request) => request.response);

export const update = (user, resetPasswordToken) => plain
  .put(baseURL, { user, reset_password_token: resetPasswordToken })
  .then((request) => request)
  .catch((request) => request.response);

export const edit = (resetPasswordToken) => plain
  .get(`${baseURL}/edit`, { params: { reset_password_token: resetPasswordToken } })
  .then((request) => request)
  .catch((request) => request.response);
