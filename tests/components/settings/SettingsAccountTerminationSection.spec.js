import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import AccountTerminationSection from '@/components/settings/SettingsAccountTerminationSection.vue';
import * as endpoint from '@/services/endpoints/auth/registrations';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('AccountTerminationSection.vue', () => {
  let store;
  let router;
  let terminationSection;

  const mutations   = { setCurrentUser: jest.fn() };
  const currentUser = { email: 'user@example.com', unconfirmedEmail: null };

  beforeEach(() => {
    router = new VueRouter({ routes: [{ path: '/' }] });
    store = new Vuex.Store({
      modules: {
        user: { namespaced: true, state: { currentUser }, mutations },
      },
    });

    terminationSection = mount(AccountTerminationSection, {
      store,
      router,
      localVue,
    });
  });

  describe('when pressing Delete Account button', () => {
    it('shows confirmation modal', async () => {
      await terminationSection.find('button').trigger('click');

      expect(terminationSection.text()).toContain('Are you sure?');
    });

    describe('when pressing Confirm', () => {
      let terminateAccountSpy;

      describe('and attributes are valid', () => {
        beforeEach(() => {
          router.push('/settings');

          terminateAccountSpy = jest.spyOn(endpoint, 'destroy');
          terminateAccountSpy.mockResolvedValue({ status: 200 });
        });

        it('shows Your account has been deleted successfully message', async () => {
          const successMessageSpy = jest.spyOn(Message, 'success');

          terminationSection.findAll('button').at(1).trigger('click');

          await flushPromises();

          expect(successMessageSpy).toHaveBeenCalledWith(
            'Your account has been deleted successfully',
          );
        });

        it('resets currentUser and redirects to the landing page', async () => {
          terminationSection.findAll('button').at(1).trigger('click');

          await flushPromises();

          expect(mutations.setCurrentUser).toHaveBeenCalledWith(
            { currentUser }, null,
          );
          expect(router.currentRoute.path).toBe('/');
        });
      });

      describe('and attributes are invalid', () => {
        it('shows server-side validation errors', async () => {
          const errorMessageSpy   = jest.spyOn(Message, 'error');
          const terminateAccountSpy = jest.spyOn(endpoint, 'destroy');
          terminateAccountSpy.mockResolvedValue({
            status: 500,
            data: 'Something went wrong',
          });

          terminationSection.findAll('button').at(1).trigger('click');

          await flushPromises();

          expect(errorMessageSpy).toHaveBeenCalled();
        });
      });
    });

    describe('when pressing Cancel', () => {
    });
  });
});
