<template lang="pug">
  .max-w-7xl.mx-auto.px-2.sm_px-6.lg_px-8.my-10
    .md_grid.md_grid-cols-4.md_gap-6
      settings-nav.col-span-1(
        :currentPage="currentPage"
        @pageChanged='currentPage = $event'
      )
      .settings.col-span-3
        component(
          v-for='(section, index) in sections[currentPage]'
          :key="index"
          :is="section"
          :class="{ 'mt-6': index !== 0 }"
        )
</template>

<script>
  import SettingsNav from '@/components/settings/SettingsNavigation';
  import Preferences from '@/components/settings/SettingsMangaListPreferences';
  import Tags from '@/components/settings/SettingsMangaListTags';
  import ProfileSection from '@/components/settings/SettingsAccountProfileSection';
  import PasswordSection from '@/components/settings/SettingsAccountPasswordSection';
  import TerminationSection from '@/components/settings/SettingsAccountTerminationSection';

  export default {
    name: 'UserSettings',
    components: {
      SettingsNav,
      PasswordSection,
      ProfileSection,
      TerminationSection,
      Tags,
      Preferences,
    },
    data() {
      return {
        currentPage: 'Account',
        sections: {
          Account: ['profile-section', 'password-section', 'termination-section'],
          'Manga List': ['preferences', 'tags'],
        },
      };
    },
  };
</script>
