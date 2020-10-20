import i18n from 'i18n';
import BaseFormInput from '@/components/base_components/BaseFormInput.vue';

describe('BaseDropdown.vue', () => {
  let baseFormInput;

  beforeEach(() => {
    baseFormInput = mount(BaseFormInput, { i18n, propsData: { value: '' } });
  });

  describe('when calling focus method', () => {
    it('focuses input', () => {
      baseFormInput.vm.focus();

      expect(baseFormInput.find('input').element).toHaveFocus();
    });
  });

  describe('when input is detected', () => {
    it('emits input value', async () => {
      await baseFormInput.find('input').setValue('new value');

      expect(baseFormInput.emitted('input')[0]).toEqual(['new value']);
    });
  });

  describe('when label is provided', () => {
    it('shows label', async () => {
      await baseFormInput.setProps({ label: 'Email' });

      expect(baseFormInput.find('label').text()).toContain('Email');
    });
  });

  describe('when placeholder is provided', () => {
    it('sets input placeholder', async () => {
      await baseFormInput.setProps({ placeholder: 'user@example.com' });

      expect(baseFormInput.find('input').element)
        .toHaveAttribute('placeholder', 'user@example.com');
    });
  });

  describe('when helperText is provided', () => {
    it('shows helper text', async () => {
      await baseFormInput.setProps({ helperText: 'Provide email' });

      expect(baseFormInput.text()).toContain('Provide email');
    });
  });

  describe('when validator is provided', () => {
    describe('and there is an active error', () => {
      it('shows validation error inside label', async () => {
        baseFormInput = mount(
          BaseFormInput, {
            i18n,
            propsData: { value: '', label: 'Email' },
            computed: {
              hasErrors: () => true,
              errors: () => ['required'],
              activeError: () => 'errors.required',
            },
          },
        );

        expect(baseFormInput.find('label').text()).toContain('Emailrequired');
      });
    });

    describe('and there are no errors', () => {
      it('shows regular label', async () => {
        baseFormInput = mount(
          BaseFormInput, {
            i18n,
            propsData: { value: '', label: 'Email' },
            computed: {
              hasErrors: () => false,
              errors: () => [],
              activeError: () => null,
            },
          },
        );

        expect(baseFormInput.find('label').text()).toContain('Email');
      });
    });
  });
});
