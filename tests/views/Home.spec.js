import Vuex from 'vuex';
import Home from '@/views/Home.vue';

import user from '@/store/modules/user';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('Home.vue', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: {
            currentUser: null,
            dissmissedBannerID: null,
          },
          mutations: user.mutations,
          getters: user.getters,
        },
      },
    });
  });

  describe('when dissmissedBannerID is null', () => {
    it('shows banner', () => {
      const home = shallowMount(Home, {
        store,
        localVue,
        stubs: ['router-link', 'router-view'],
      });

      expect(home.find('base-banner-stub').isVisible()).toBeTruthy();
    });
  });

  describe('when dissmissedBannerID matches updateBanner ID', () => {
    it('hides banner', () => {
      store.state.user.dissmissedBannerID = 1;

      const home = mount(Home, {
        store,
        localVue,
        stubs: ['router-link', 'router-view'],
      });

      home.setData({ updateBanner: { id: 1 } });

      expect(home.find({ ref: 'banner' }).attributes('style')).toContain(
        'height: 0px;'
      );
    });
  });
});
