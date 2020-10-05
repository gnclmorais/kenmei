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
              base-form-input(
                v-model.trim="$v.email.$model"
                :validator="$v.email"
                label="Email"
                placeholder="you@example.com"
                :helperText="unconfirmedEmail"
              )
                template(slot='icon')
                  icon-mail.h-5.w-5
      .mt-8.border-t.border-gray-200.pt-5.col-span-3
        .flex.justify-end
          span.inline-flex.rounded-md.shadow-sm
            base-button(@click='saveForm') Save
</template>

<script>
  import { required, email } from 'vuelidate/lib/validators';
  import { mapState, mapMutations } from 'vuex';
  import { Message } from 'element-ui';

  import { update } from '@/services/endpoints/auth/registrations';

  export default {
    data() {
      return {
        email: '',
        loading: false,
      };
    },
    validations: {
      email: {
        required,
        email,
      },
    },
    computed: {
      ...mapState('user', [
        'currentUser',
      ]),
      unconfirmedEmail() {
        if (!this.currentUser.unconfirmedEmail) return;

        // eslint-disable-next-line consistent-return
        return `Currently waiting confirmation for: ${this.currentUser.unconfirmedEmail}`;
      },
    },
    mounted() {
      this.email = this.currentUser.email;
    },
    methods: {
      ...mapMutations('user', ['setCurrentUser']),
      async saveForm() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

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
