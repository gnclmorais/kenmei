import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';

import ResetPassword from '@/views/ResetPassword.vue';
import * as resource from '@/services/endpoints/auth/passwords';

import user from '@/store/modules/user';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

describe('ResetPassword.vue', () => {
  let resetPassword;
  let store;
  const mutations = { setCurrentUser: jest.fn() };

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: user.state,
          actions: user.actions,
          getters: user.getters,
          mutations,
        },
      },
    });

    resetPassword = shallowMount(ResetPassword, {
      store,
      localVue,
      propsData: {
        resetPasswordToken: 'token',
      },
    });
  });

  describe('when visiting the page', () => {
    let tokenValidationSpy;

    beforeEach(() => {
      tokenValidationSpy = jest.spyOn(resource, 'edit');
    });

    it('shows token is validating message if validating token', async () => {
      expect(resetPassword.text()).toContain('Checking token validity');
    });

    it('shows reset password form if token is valid', async () => {
      tokenValidationSpy.mockResolvedValue({ status: 200 });

      resetPassword = shallowMount(ResetPassword, {
        store,
        localVue,
        propsData: {
          resetPasswordToken: 'token',
        },
      });

      await flushPromises();

      expect(resetPassword.text()).toContain('Reset Password');
    });

    describe('when token is invalid', () => {
      it('shows token not valid validation error', async () => {
        const error = 'Token not found, please reset your password again';

        tokenValidationSpy.mockResolvedValue(
          { data: { error: 'Token not found' } },
        );

        resetPassword = shallowMount(ResetPassword, {
          store,
          localVue,
          propsData: {
            resetPasswordToken: 'token',
          },
        });

        await flushPromises();

        expect(resetPassword.text()).toContain(error);
      });

      it('shows token has expired validation error', async () => {
        const error = 'Token has expired, please reset your password again';

        tokenValidationSpy.mockResolvedValue(
          { data: { error: 'Token has expired' } },
        );

        resetPassword = shallowMount(ResetPassword, {
          store,
          localVue,
          propsData: {
            resetPasswordToken: 'token',
          },
        });

        await flushPromises();

        expect(resetPassword.text()).toContain(error);
      });

      it('shows generic validation error', async () => {
        const error = 'Something went wrong, try again later or contact hi@kenmei.co';

        tokenValidationSpy.mockResolvedValue(
          { data: { error: 'Unexpected' } },
        );

        resetPassword = shallowMount(ResetPassword, {
          store,
          localVue,
          propsData: {
            resetPasswordToken: 'token',
          },
        });

        await flushPromises();

        expect(resetPassword.text()).toContain(error);
      });
    });
  });

  describe('when reseting the password', () => {
    let router;
    let resetPasswordSpy;

    beforeEach(() => {
      resetPasswordSpy = jest.spyOn(resource, 'reset');
      router = new VueRouter({
        routes: [{ path: '/manga-list', name: 'manga-list' }],
      });

      resetPassword = mount(ResetPassword, {
        store,
        router,
        localVue,
        propsData: {
          resetPasswordToken: 'token',
        },
      });
    });

    it('tests that passwords match each other', async () => {
      await resetPassword.setData({
        tokenValid: true,
        user: {
          password: 'password',
          password_confirmation: 'passwords',
        },
      });

      await resetPassword.find({ ref: 'resetPasswordSubmit' }).trigger('click');

      expect(resetPassword.text()).toContain('Passwords do not match');
    });

    describe('with valid params', () => {
      it('updates the password, sets current user and redirects to manga list', async () => {
        await resetPassword.setData({
          tokenValid: true,
          user: {
            password: 'password',
            password_confirmation: 'password',
          },
        });

        const user = { user_id: 1, email: 'test1@example.com' };

        resetPasswordSpy.mockResolvedValue({ status: 200, data: user });

        resetPassword.find({ ref: 'resetPasswordSubmit' }).trigger('click');

        await flushPromises();

        expect(router.currentRoute.name).toBe('manga-list');
        expect(mutations.setCurrentUser).toHaveBeenCalledWith(
          { currentUser: null, dissmissedBannerID: null }, user,
        );
      });
    });

    describe('with invalid params', () => {
      it('shows validation errors', async () => {
        await resetPassword.setData({
          tokenValid: true,
          user: {
            password: 'password',
            password_confirmation: 'password',
          },
        });

        const errorMessageSpy = jest.spyOn(Message, 'error');

        resetPasswordSpy.mockResolvedValue(
          { status: 500, data: { error: 'Wrong user' } },
        );

        resetPassword.find({ ref: 'resetPasswordSubmit' }).trigger('click');

        await flushPromises();

        expect(errorMessageSpy).toBeCalledWith(
          expect.objectContaining({ message: 'Wrong user' }),
        );
      });
    });
  });
});
