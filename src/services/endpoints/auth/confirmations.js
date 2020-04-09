import { plain } from '@/modules/axios';

/* eslint-disable import/prefer-default-export */
export const show = (confirmationToken) => plain
  .get('/auth/confirmations', { params: { confirmation_token: confirmationToken } })
  .then((request) => request)
  .catch((request) => request.response);
/* eslint-enable import/prefer-default-export */
