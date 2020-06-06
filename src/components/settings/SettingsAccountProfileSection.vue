<template lang="pug">
  .bg-white.shadow.px-4.py-5.rounded-lg.sm_p-6(v-loading="loading")
    .md_grid.md_grid-cols-3.md_gap-6
      .md_col-span-1
        h3.text-lg.font-medium.leading-6.text-gray-900 Profile
        p.mt-1.text-sm.leading-5.text-gray-500
          | When changing your email, you will need to confirm your new
          | email first.
      .mt-5.md_mt-0.md_col-span-2
        .grid.lg_grid-cols-3.lg_gap-6
            .col-span-3.sm_col-span-2
              div
                label.block.text-sm.font-medium.leading-5.text-gray-700(
                  for='email'
                )
                  | Email
                .mt-1.relative.rounded-md.shadow-sm
                  .input-icon
                    svg.h-5.w-5.text-gray-400(
                      fill='currentColor'
                      viewbox='0 0 20 20'
                    )
                      path(
                        fill-rule='evenodd'
                        :d='emailIcon'
                        clip-rule='evenodd'
                      )
                  input#email.form-input(
                    v-model='email'
                    type='email'
                    autocomplete='new-password'
                    placeholder='Email'
                  )
                p.mt-2.text-sm.text-gray-500(
                  v-if="currentUser.unconfirmedEmail"
                )
                  | Currently waiting confirmation for:
                  | {{ currentUser.unconfirmedEmail }}
      .mt-8.border-t.border-gray-200.pt-5.col-span-3
        .flex.justify-end
          span.inline-flex.rounded-md.shadow-sm
            base-button(@click='saveForm') Save
</template>

<script>
  import { mapState, mapMutations } from 'vuex';
  import { Message } from 'element-ui';

  import { update } from '@/services/endpoints/auth/registrations';

  export default {
    data() {
      return {
        email: '',
        emailIcon: `
          M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997
          1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z
        `,
        loading: false,
      };
    },
    computed: {
      ...mapState('user', [
        'currentUser',
      ]),
    },
    mounted() {
      this.email = this.currentUser.email;
    },
    methods: {
      ...mapMutations('user', ['setCurrentUser']),
      async saveForm() {
        this.loading = true;

        const response = await update({
          id: this.currentUser.user_id, email: this.email,
        });

        if (response.status === 200) {
          Message.success('Email Confirmation has been sent to your new email');

          const updatedCurrentUser = { ...this.currentUser };
          updatedCurrentUser.unconfirmedEmail = this.email;

          this.setCurrentUser(updatedCurrentUser);
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

<style lang="scss" scoped>
  input{
    @apply block w-full pl-10;

    @screen sm {
      @apply text-sm leading-5;
    }
  }

  .input-icon {
    @apply absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;
  }
</style>
