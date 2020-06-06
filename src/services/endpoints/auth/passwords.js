import { plain, secure } from '@/modules/axios';

const baseURL = '/auth/passwords';

export const create = (email) => plain
  .post(baseURL, { email })
  .then((request) => request)
  .catch((request) => request.response);

export const update = (user) => secure
  .put(baseURL, {
    user: {
      password: user.password,
      password_confirmation: user.passwordConfirmation,
      current_password: user.currentPassword,
    },
  })
  .then((request) => request)
  .catch((request) => request.response);

export const reset = (user, resetPasswordToken) => plain
  .put(`${baseURL}/reset`, { user, reset_password_token: resetPasswordToken })
  .then((request) => request)
  .catch((request) => request.response);

export const edit = (resetPasswordToken) => plain
  .get(`${baseURL}/edit`, { params: { reset_password_token: resetPasswordToken } })
  .then((request) => request)
  .catch((request) => request.response);
