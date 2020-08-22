import BaseDropdown from '@/components/base_components/BaseDropdown.vue';

describe('BaseDropdown.vue', () => {
  let baseDropdown;

  beforeEach(() => {
    baseDropdown = shallowMount(BaseDropdown, {
      propsData: { items: [{ text: 'Option 1' }] },
      data() { return { open: true }; },
    });
  });

  describe('when pressing Esc', () => {
    it('closes dropdown', async () => {
      await baseDropdown.trigger('keydown.esc');

      expect(baseDropdown.vm.$open).toBeFalsy();
    });
  });

  describe('when pressing off dropdown', () => {
    it('closes dropdown', async () => {
      await baseDropdown.findComponent({ ref: 'clickOffButton' }).trigger('click');

      expect(baseDropdown.vm.$open).toBeFalsy();
    });
  });

  describe('when pressing on the dropdown option', () => {
    it('emits text of the option pressed', async () => {
      await baseDropdown.find('a').trigger('click');

      expect(baseDropdown.emitted('click')[0]).toEqual(['Option 1']);
    });
  });

  describe('when option contains an icon', () => {
    it('renders icon specified', async () => {
      await baseDropdown.setProps({
        items: [{ text: 'Option 1', icon: 'IconEdit' }],
      });

      expect(baseDropdown.find('iconedit-stub').exists()).toBeTruthy();
    });
  });
});
