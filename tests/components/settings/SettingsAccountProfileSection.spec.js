import Vuex from 'vuex';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import AccountProfileSection from '@/components/settings/SettingsAccountProfileSection.vue';
import * as endpoint from '@/services/endpoints/auth/registrations';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('AccountProfileSection.vue', () => {
  describe(':props', () => {
    describe('when unconfirmedEmail is present', () => {
      it('shows it under the input field', async () => {
        const store = new Vuex.Store({
          modules: {
            user: {
              namespaced: true,
              state: {
                currentUser: {
                  email: 'user@example.com',
                  unconfirmedEmail: 'new_email@example.com',
                },
              },
              mutations: { setCurrentUser: jest.fn() },
            },
          },
        });

        const profileSection = shallowMount(AccountProfileSection, {
          store,
          localVue,
        });

        expect(profileSection.text()).toContain(
          'Currently waiting confirmation for:',
        );
      });
    });
  });

  describe('when pressing Save button', () => {
    let store;
    let profileSection;
    let updateEmailSpy;

    const mutations   = { setCurrentUser: jest.fn() };
    const currentUser = { email: 'user@example.com', unconfirmedEmail: null };

    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          user: { namespaced: true, state: { currentUser }, mutations },
        },
      });

      profileSection = mount(AccountProfileSection, { store, localVue });
    });

    describe('and attributes are valid', () => {
      beforeEach(() => {
        updateEmailSpy = jest.spyOn(endpoint, 'update');
        updateEmailSpy.mockResolvedValue({ status: 200 });
      });

      it('shows Email Confirmation has been sent to your new email message', async () => {
        const successMessageSpy = jest.spyOn(Message, 'success');

        profileSection.find('button').trigger('click');

        await flushPromises();

        expect(successMessageSpy).toHaveBeenCalledWith(
          'Email Confirmation has been sent to your new email',
        );
      });

      it('replaces currentUser with updated currentUser', async () => {
        profileSection.setData({ email: 'new_email@example.com' });

        profileSection.find('button').trigger('click');

        await flushPromises();

        expect(mutations.setCurrentUser).toHaveBeenCalledWith(
          { currentUser },
          {
            email: currentUser.email,
            unconfirmedEmail: 'new_email@example.com',
          },
        );
      });
    });

    describe('and attributes are invalid', () => {
      it('shows server-side validation errors', async () => {
        const errorMessageSpy = jest.spyOn(Message, 'error');
        const updateEmailSpy  = jest.spyOn(endpoint, 'update');

        updateEmailSpy.mockResolvedValue({
          status: 500,
          data: 'Email is blank',
        });

        profileSection.find('button').trigger('click');

        await flushPromises();

        expect(errorMessageSpy).toHaveBeenCalled();
      });
    });
  });
});
