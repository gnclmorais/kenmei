import i18n from 'i18n';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';
import { Message } from 'element-ui';

import TheSignUp from '@/components/TheSignUp.vue';

import user from '@/store/modules/user';
import * as resource from '@/services/endpoints/auth/registrations';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('TheSignUp.vue', () => {
  let signUp;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: user.state,
          actions: {
            signUp: jest.fn(),
          },
          getters: user.getters,
        },
      },
    });

    signUp = mount(TheSignUp, {
      store,
      localVue,
      i18n,
    });
  });

  describe('@events', () => {
    it('@click - when pressing Sign In link, emits componentChanged with TheSignIn', () => {
      signUp.find('.el-link').trigger('click');

      expect(signUp.emitted('componentChanged')[0]).toEqual(['TheSignIn']);
    });
  });
  describe(':data', () => {
    describe(':user - is valid', () => {
      beforeEach(() => {
        signUp.setData({
          user: {
            email: 'text@example.com',
            password: 'password',
            password_confirmation: 'password',
          },
        });
      });

      it('delegates to the endpoint service and shows confirmation message', async () => {
        const createUserSpy = jest.spyOn(resource, 'create');

        createUserSpy.mockResolvedValue({ status: 200 });

        signUp.vm.signUp();

        await flushPromises();

        expect(createUserSpy).toHaveBeenCalledWith(signUp.vm.$data.user);
        expect(signUp.text()).toContain('Signed up successfully');
      });
    });

    describe(':user - is invalid', () => {
      it('shows validation errors if form is invalid', async () => {
        await signUp.find('form').trigger('submit.prevent');

        expect(signUp.text()).toContain('Emailrequired');
      });

      it('shows server-side errors if request failed', async () => {
        signUp.setData({
          user: {
            email: 'text@example.com',
            password: 'password',
            password_confirmation: 'password',
          },
        });

        const createUserSpy   = jest.spyOn(resource, 'create');
        const errorMessageSpy = jest.spyOn(Message, 'error');

        const mockResponse = {
          response: {
            data: 'Missing password<br>Missing password confirmation',
          },
        };

        createUserSpy.mockResolvedValue({ status: 404, mockResponse });

        signUp.vm.signUp();

        await flushPromises();

        // TODO: Check that we actually called it with server-side errors
        expect(errorMessageSpy).toBeCalled();
      });
    });
  });
});
