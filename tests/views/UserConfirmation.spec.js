import Vuex from 'vuex';
import VueRouter from 'vue-router';
import flushPromises from 'flush-promises';

import UserConfirmation from '@/views/UserConfirmation.vue';
import * as resource from '@/services/endpoints/auth/confirmations';

import user from '@/store/modules/user';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);

describe('UserConfirmation.vue', () => {
  const mutations = { setCurrentUser: jest.fn() };

  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: user.state,
          getters: user.getters,
          mutations,
        },
      },
    });
  });

  describe('when visiting the page', () => {
    let confirmationsSpy;

    beforeEach(() => {
      confirmationsSpy = jest.spyOn(resource, 'show');
    });

    it('shows token is validating message', () => {
      const userConfirmation = shallowMount(UserConfirmation, {
        store,
        localVue,
        propsData: {
          confirmationToken: 'token',
        },
      });

      expect(userConfirmation.text()).toContain('Checking token validity');
    });

    describe('when token is valid', () => {
      it('sets current user and redirects to manga list', async () => {
        const user = { user_id: 1, email: 'test1@example.com' };
        const router = new VueRouter({
          routes: [{ path: '/manga-list', name: 'manga-list' }],
        });

        confirmationsSpy.mockResolvedValue({ status: 200, data: user });

        shallowMount(UserConfirmation, {
          store,
          router,
          localVue,
          propsData: {
            confirmationToken: 'token',
          },
        });

        await flushPromises();

        expect(router.currentRoute.name).toBe('manga-list');
        expect(mutations.setCurrentUser).toHaveBeenCalledWith(
          { currentUser: null, dissmissedBannerID: null }, user,
        );
      });
    });

    describe('when token is invalid', () => {
      it('shows token not valid validation error', async () => {
        confirmationsSpy.mockResolvedValue(
          { data: { error: 'Token not found' } },
        );

        const userConfirmation = shallowMount(UserConfirmation, {
          store,
          localVue,
          propsData: {
            confirmationToken: 'token',
          },
        });

        await flushPromises();

        expect(userConfirmation.text()).toContain('Token not found');
      });

      it('shows generic validation error', async () => {
        const error = 'Something went wrong, try again later or contact hi@kenmei.co';

        confirmationsSpy.mockResolvedValue({ data: { error: 'Unexpected' } });

        const userConfirmation = shallowMount(UserConfirmation, {
          store,
          localVue,
          propsData: {
            confirmationToken: 'token',
          },
        });

        await flushPromises();

        expect(userConfirmation.text()).toContain(error);
      });
    });
  });
});
