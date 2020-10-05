import i18n from 'i18n';
import { Message } from 'element-ui';
import axios from 'axios';
import flushPromises from 'flush-promises';

import TheResetPassword from '@/components/TheResetPassword.vue';

describe('TheResetPassword.vue', () => {
  let resetPassword;

  beforeEach(() => {
    resetPassword = mount(TheResetPassword, { i18n });
  });

  describe('@events', () => {
    it('@click - when pressing Sign In link, emits componentChanged', () => {
      resetPassword.find('.el-link').trigger('click');

      expect(resetPassword.vm.$data.resetInitiated).not.toBeTruthy();
      expect(resetPassword.emitted('componentChanged')[0])
        .toEqual(['TheSignIn']);
    });
  });

  describe('when resetting password', () => {
    it('POSTs to passwords endpoint and shows confirmation message', async () => {
      const axiosSpy = jest.spyOn(axios, 'post');

      axiosSpy.mockResolvedValue({ status: 200 });
      resetPassword.setData({ user: { email: 'test@example.com' } });

      resetPassword.vm.resetPassword();

      await flushPromises();

      expect(axiosSpy).toHaveBeenCalledWith(
        '/auth/passwords',
        { email: 'test@example.com' },
      );
    });

    describe('and has client-side errors', () => {
      it('shows client-side errors', async () => {
        await resetPassword
          .findComponent({ ref: 'resetPasswordSubmit' })
          .trigger('click');

        expect(resetPassword.text()).toContain('Emailrequired');
      });
    });

    describe('and has server-side errors', () => {
      it('shows server-side errors', async () => {
        const axiosSpy        = jest.spyOn(axios, 'post');
        const errorMessageSpy = jest.spyOn(Message, 'error');
        const mockResponse    = { response: { data: 'Things happened' } };

        resetPassword.setData({ user: { email: 'test@example.com' } });

        axiosSpy.mockRejectedValue(mockResponse);

        resetPassword.vm.resetPassword();

        await flushPromises();

        expect(errorMessageSpy).toBeCalled();
      });
    });
  });
});
