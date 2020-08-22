import { RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';

import BaseNavLight from '@/components/base_components/BaseNavLight.vue';

import user from '@/store/modules/user';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('BaseNavLight.vue', () => {
  describe('when user is not signed in', () => {
    let store;
    let nav;

    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          user: {
            namespaced: true,
            state: user.state,
            actions: user.actions,
            getters: {
              signedIn: () => false,
            },
          },
        },
      });

      nav = shallowMount(BaseNavLight, {
        store,
        localVue,
        stubs: {
          RouterLink: RouterLinkStub,
        },
      });
    });

    it('renders sign on buttons', () => {
      expect(nav.text()).toContain('Sign In');
      expect(nav.text()).toContain('Register');
    });

    it('does not render navigation', () => {
      expect(nav.find('.btn-menu').exists()).toBeFalsy();
      expect(nav.find('.mobile-link').exists()).toBeFalsy();
      expect(nav.find('.desktop-link').exists()).toBeFalsy();
    });

    describe('when clicking Sign In ', () => {
      it('opens SignOn modal', async () => {
        nav = mount(BaseNavLight, {
          store,
          localVue,
          stubs: {
            RouterLink: RouterLinkStub,
          },
        });

        expect(nav.vm.$data.activeSignOnComponent).toContain('TheSignIn');
        expect(nav.vm.$data.signOnVisible).toBeFalsy();

        await nav.findComponent({ ref: 'signUpButton' }).trigger('click');

        expect(nav.vm.$data.activeSignOnComponent).toContain('TheSignUp');
        expect(nav.vm.$data.signOnVisible).toBeTruthy();
      });
    });
  });

  describe('when user is signed in', () => {
    let store;
    let nav;

    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          user: {
            namespaced: true,
            state: {
              currentUser: { email: 'user1@example.com' },
            },
            actions: user.actions,
            getters: {
              signedIn: () => true,
            },
          },
        },
      });

      nav = shallowMount(BaseNavLight, {
        store,
        localVue,
        stubs: {
          RouterLink: RouterLinkStub,
        },
      });
    });

    it('does not render signOn modal', () => {
      expect(nav.find('base-modal-stub').exists()).toBeFalsy();
    });

    describe('lifecycle', () => {
      describe('mounted()', () => {
        it('sets on-click event to hide menus', async () => {
          nav = shallowMount(BaseNavLight, {
            store,
            localVue,
            attachToDocument: true,
            stubs: {
              RouterLink: RouterLinkStub,
            },
            data() {
              return {
                profileVisible: true,
                menuVisible: true,
              };
            },
          });

          const profileDropdown = nav.find('.profile-dropdown');
          const menuDropdown    = nav.find('.menu-dropdown');

          expect(profileDropdown.element).toBeVisible();
          expect(menuDropdown.element).toBeVisible();

          await nav.find('.desktop-links').trigger('click');

          expect(profileDropdown.element).not.toBeVisible();
          expect(menuDropdown.element).not.toBeVisible();
        });
      });
    });
  });
});
