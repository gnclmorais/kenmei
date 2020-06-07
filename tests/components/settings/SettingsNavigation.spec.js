import SettingsNavigation from '@/components/settings/SettingsNavigation.vue';

describe('SettingsNavigation.vue', () => {
  it('when clicking links, emits pageSwitched', async () => {
    const navigation = shallowMount(SettingsNavigation, {
      propsData: { currentPage: 'Account' },
    });

    await navigation.findAll('a').at(1).trigger('click');

    expect(navigation.emitted('pageChanged')[0]).toEqual(['Manga List']);
  });
});
