import i18n from 'i18n';
import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import AccountPasswordSection from '@/components/settings/SettingsAccountPasswordSection.vue';
import * as endpoint from '@/services/endpoints/auth/passwords';

const localVue = createLocalVue();

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('AccountPasswordSection.vue', () => {
  let passwordSection;

  beforeEach(() => {
    passwordSection = mount(AccountPasswordSection, { localVue, i18n });
  });

  describe('when pressing Save button', () => {
    describe('and attributes are valid', () => {
      beforeEach(() => {
        passwordSection.setData({
          user: {
            password: 'password1',
            passwordConfirmation: 'password1',
            currentPassword: 'password',
          },
        });
      });

      it('shows Password updated messange', async () => {
        const successMessageSpy = jest.spyOn(Message, 'success');
        const updatePasswordSpy = jest.spyOn(endpoint, 'update');

        updatePasswordSpy.mockResolvedValue({ status: 200 });

        passwordSection.find('button').trigger('click');

        await flushPromises();

        expect(successMessageSpy).toHaveBeenCalledWith('Password updated');
      });
    });

    describe('and attributes are invalid', () => {
      it('shows client-side validation errors', async () => {
        await passwordSection.find('button').trigger('click');

        expect(passwordSection.text()).toContain('Current passwordrequired');
      });

      it('shows server-side validation errors', async () => {
        passwordSection.setData({
          user: {
            password: 'password1',
            passwordConfirmation: 'password1',
            currentPassword: 'password',
          },
        });

        const errorMessageSpy   = jest.spyOn(Message, 'error');
        const updatePasswordSpy = jest.spyOn(endpoint, 'update');
        updatePasswordSpy.mockResolvedValue({
          status: 500,
          data: 'Passwords do not match',
        });

        passwordSection.find('button').trigger('click');

        await flushPromises();

        expect(errorMessageSpy).toHaveBeenCalled();
      });
    });
  });
});
