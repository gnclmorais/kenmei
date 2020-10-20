import BaseTabs from '@/components/base_components/BaseTabs.vue';

describe('BaseTabs.vue', () => {
  let baseTabs;

  beforeEach(() => {
    baseTabs = shallowMount(BaseTabs, {
      propsData: { tabs: ['Tab 1', 'Tab 2'] },
    });
  });

  describe('when selecting a tab', () => {
    it('emits text of the tab select', async () => {
      await baseTabs.findAll('a').at(1).trigger('click');

      expect(baseTabs.emitted('tabSelected')[0]).toEqual(['Tab 2']);
    });
  });
});
