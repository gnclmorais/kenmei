import Settings from '@/views/Settings.vue';
import SettingsNav from '@/components/settings/SettingsNavigation';

describe('Settings.vue', () => {
  describe('@events', () => {
    it('@pageChanged - switches current page', () => {
      const settings = shallowMount(Settings, {
        data() { return { currentPage: 'Account' }; },
      });

      settings.findComponent(SettingsNav).vm.$emit('pageChanged', 'Manga List');

      expect(settings.vm.currentPage).toEqual('Manga List');
    });
  });

  describe('when current page is Account', () => {
    it('shows profile, password and termination sections', () => {
      const settings = shallowMount(Settings, {
        data() { return { currentPage: 'Account' }; },
      });

      expect(settings.find('profile-section-stub').exists()).toBeTruthy();
      expect(settings.find('password-section-stub').exists()).toBeTruthy();
      expect(settings.find('termination-section-stub').exists()).toBeTruthy();
    });
  });

  describe('when current page is Manga List', () => {
    it('shows preferences and tags sections', () => {
      const settings = shallowMount(Settings, {
        data() { return { currentPage: 'Manga List' }; },
      });

      expect(settings.find('preferences-stub').exists()).toBeTruthy();
      expect(settings.find('tags-stub').exists()).toBeTruthy();
    });
  });
});
