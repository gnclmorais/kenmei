<template lang="pug">
  #home.h-full
    landing-page(v-if="landing")
    .min-h-full.flex.flex-col.bg-gray-50(v-else)
      vue-slide-toggle(ref="banner" :open="bannerVisible" :duration="500")
        base-banner(
          :text="updateBanner.message"
          :link="updateBanner.link"
          :mobileText="updateBanner.mobileText"
          @close="dismissUpdateBanner(updateBanner.id)"
        )
      header
        base-nav-light
      .flex-1.overflow-x-hidden.min-h-45
        transition(name="slide-left" mode="out-in")
          router-view
      base-footer.flex-shrink-0
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { VueSlideToggle } from 'vue-slide-toggle';

  import LandingPage from '@/views/LandingPage';

  export default {
    name: 'Home',
    metaInfo: {
      title: 'Kenmei | Cross-site manga tracker',
    },
    components: {
      VueSlideToggle,
      LandingPage,
    },
    data() {
      return {
        landing: false,
        updateBanner: {
          id: 4,
          link: 'https://ko-fi.com/kenmei',
          message: `
            Ko-fi donations are now open. Consider supporting the project by
            donating a dollar or more
          `,
          mobileText: 'Consider supporting the project on Ko-fi',
        },
      };
    },
    computed: {
      ...mapState('user', [
        'dissmissedBannerID',
      ]),
      bannerVisible() {
        return this.updateBanner.id !== this.dissmissedBannerID;
      },
    },
    watch: {
      // TODO: Remove when I am able to use transitions from landing page
      // Currently this is required to render landing page without router
      $route(to, _from) {
        this.landing = to.path === '/';
      },
    },
    created() {
      this.landing = window.location.pathname === '/';
    },
    methods: {
      ...mapMutations('user', [
        'dismissUpdateBanner',
      ]),
    },
  };
</script>
