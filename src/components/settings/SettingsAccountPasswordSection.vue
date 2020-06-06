<template lang="pug">
  .bg-white.shadow.px-4.py-5.rounded-lg.sm_p-6(v-loading="loading")
    .md_grid.md_grid-cols-3.md_gap-6
      .md_col-span-1
        h3.text-lg.font-medium.leading-6.text-gray-900 Password
        p.mt-1.text-sm.leading-5.text-gray-500
          | Current password is required, if you want to set a new password.
      .mt-5.md_mt-0.md_col-span-2
        .grid.grid-cols-6.gap-6
          .col-span-6.sm_col-span-3
            label(for="new-password") New password
            input#new-password.form-input(
              type='password'
              autocomplete='new-password'
              v-model="user.password"
            )
          .col-span-6.sm_col-span-3
            label(for="new-password-confirmation") Confirm new password
            input#new-password-confirmation.form-input(
              type='password'
              autocomplete='new-password'
              v-model="user.passwordConfirmation"
            )
          .col-span-6.sm_col-span-3
            label(for="current-password") Current password
            input#current-password.form-input(
              type='password'
              autocomplete='current-password'
              v-model="user.currentPassword"
            )
      .mt-8.border-t.border-gray-200.pt-5.col-span-3
        .flex.justify-end
          span.inline-flex.rounded-md.shadow-sm
            base-button(@click='updatePassword') Save
</template>

<script>
  import { Message } from 'element-ui';

  import { update } from '@/services/endpoints/auth/passwords';

  export default {
    data() {
      return {
        user: {
          password: '',
          passwordConfirmation: '',
          currentPassword: '',
        },
        loading: false,
      };
    },
    methods: {
      async updatePassword() {
        this.loading = true;

        const response = await update(this.user);

        if (response.status === 200) {
          Message.success('Password updated');
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

<style media="screen" lang="scss" scoped>
  label {
    @apply block text-sm font-medium leading-5 text-gray-700;
  }

  input {
    @apply mt-1 block w-full py-2 px-3 border border-gray-300;
    @apply rounded-md shadow-sm transition duration-150 ease-in-out;

    &:focus {
      @apply outline-none shadow-outline-blue border-blue-300;
    }

    @screen sm {
      @apply text-sm leading-5;
    }
  }
</style>
