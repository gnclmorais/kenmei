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
    passwordSection = mount(AccountPasswordSection, { localVue });
  });

  describe('when pressing Save button', () => {
    describe('and attributes are valid', () => {
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
      it('shows server-side validation errors', async () => {
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
