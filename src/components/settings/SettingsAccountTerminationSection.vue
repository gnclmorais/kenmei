<template lang="pug">
  .bg-white.shadow.px-4.py-5.rounded-lg.sm_p-6
    .md_grid.md_grid-cols-3.md_gap-6
      .md_col-span-2
        .px-4.sm_px-0
          h3.text-lg.font-medium.leading-6.text-gray-900 Account Termination
          p.mt-1.text-sm.leading-5.text-gray-500
            | Deleting your account is irreversable, so make sure you have
            | exported all data, before proceeding
      .mt-5.md_mt-0.md_col-span-1.self-center
        base-button(type='danger' @click="confirmationVisible = true")
          | Delete Account
      base-modal(
        :visible="confirmationVisible"
        :loading="loading"
        size="lg"
        @dialogClosed="confirmationVisible = false"
      )
        template(slot='body')
          .warning-icon
            svg.h-6.w-6.text-red-600.stroke-current(
              fill='none'
              viewbox='0 0 24 24'
            )
              path(
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                :d='dangerSVG'
              )
          .mt-3.text-center.sm_mt-0.sm_ml-4.sm_text-left
            h3.text-lg.leading-6.font-medium.text-gray-900
              | Are you sure?
            .mt-2
              p.text-sm.leading-5.text-gray-500
                | Deleting your account is irreversable. You will lose all your
                | manga entries and tags. Do you want to proceed?
        template(slot='actions')
          span.flex.w-full.rounded-md.shadow-sm.sm_ml-3.sm_w-auto
            base-button(type="danger" @click="deleteAccount")
              | Confirm
          span.mt-3.flex.w-full.rounded-md.shadow-sm.sm_mt-0.sm_w-auto
            base-button(type="secondary" @click="confirmationVisible = false")
              | Cancel
</template>

<script>
  import { Message } from 'element-ui';
  import { mapMutations, mapState } from 'vuex';

  import { destroy } from '@/services/endpoints/auth/registrations';

  export default {
    data() {
      return {
        loading: false,
        confirmationVisible: false,
        dangerSVG: `
          M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
          4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z
        `,
      };
    },
    computed: {
      ...mapState('user', ['currentUser']),
    },
    methods: {
      ...mapMutations('user', ['setCurrentUser']),
      async deleteAccount() {
        this.loading = true;

        const response = await destroy(this.currentUser.user_id);

        if (response.status === 200) {
          this.confirmationVisible = false;
          this.setCurrentUser(null);

          delete localStorage.access;

          this.$router.push('/');
          Message.success('Your account has been deleted successfully');
        } else {
          Message.error({
            dangerouslyUseHTMLString: true,
            message: response.data,
          });
        }

        this.loading = false;
      },
    },
  };
</script>

<style lang="scss" media="screen" scoped>
  .warning-icon {
    @apply mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12;
    @apply rounded-full bg-red-100;

    @screen sm {
      @apply mx-0 h-10 w-10;
    }
  }
</style>
