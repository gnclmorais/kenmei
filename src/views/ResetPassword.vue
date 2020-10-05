<template lang="pug">
  .flex.flex-col.h-full.w-full.items-center.justify-center
    base-card.max-w-sm.my-56
      .px-6.py-4#reset-pass-card
        p.text-lg.leading-normal.text-gray-600.text-center(
          v-if="tokenValid === null"
        )
          | Checking token validity
          br
          i.el-icon-loading
        template(v-else-if="tokenValid")
          h3.leading-normal.text-gray-600.text-center
            | Reset Password
          base-form-input.mt-5(
            v-model.trim="$v.user.password.$model"
            :validator="$v.user.password"
            label="Password"
            autocomplete='new-password'
            type="password"
          )
          base-form-input.mt-5(
            v-model.trim="$v.user.passwordConfirmation.$model"
            :validator="$v.user.passwordConfirmation"
            label="Password confirmation"
            autocomplete='new-password'
            type="password"
          )
          base-button.mt-5(ref='resetPasswordSubmit' @click='submitNewPassword')
            | Save Password
        p.leading-normal.text-gray-600.text-center(v-else)
          | {{ this.validationError }}
</template>

<script>
  import {
    required, minLength, maxLength, sameAs,
  } from 'vuelidate/lib/validators';
  import { Message } from 'element-ui';
  import { mapGetters, mapMutations } from 'vuex';

  import { edit, reset } from '@/services/endpoints/auth/passwords';

  export default {
    props: {
      resetPasswordToken: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        tokenValid: null,
        validationError: '',
        user: {
          password: '',
          passwordConfirmation: '',
        },
      };
    },
    validations: {
      user: {
        password: {
          required,
          minLength8: minLength(8),
          maxLength24: maxLength(24),
        },
        passwordConfirmation: {
          sameAs: sameAs('password'),
        },
      },
    },
    computed: {
      ...mapGetters('user', [
        'signedIn',
      ]),
    },
    mounted() {
      this.checkTokenValidity();
    },
    methods: {
      ...mapMutations('user', [
        'setCurrentUser',
      ]),
      async submitNewPassword() {
        this.$v.$touch();
        if (this.$v.$invalid) return;

        const response = await reset(this.user, this.resetPasswordToken);

        if (response.status === 200) {
          this.setCurrentUser({
            user_id: response.data.user_id,
            email: response.data.email,
            unconfirmedEmail: response.data.unconfirmedEmail,
          });
          localStorage.access = response.data.access;

          this.$router.push({ name: 'manga-list' });
        } else {
          Message.error({
            dangerouslyUseHTMLString: true,
            message: response.data.error,
          });
        }
      },
      async checkTokenValidity() {
        const response = await edit(this.resetPasswordToken);

        if (response.status === 200) {
          this.tokenValid = true;
        } else {
          const { error } = response.data;

          this.tokenValid = false;

          if (error === 'Token not found' || error === 'Token has expired') {
            this.validationError = `${error}, please reset your password again`;
          } else {
            this.validationError = `
              Something went wrong, try again later or contact hi@kenmei.co
            `;
          }
        }
      },
    },
  };
</script>
