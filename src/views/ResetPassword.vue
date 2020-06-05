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
          el-form(
            ref='updatePasswordForm'
            :rules='rules'
            :model='user'
            label-position='top'
          )
            el-form-item(prop='password')
              el-input(
                placeholder='Password'
                type='password'
                prefix-icon="el-icon-lock"
                v-model.trim='user.password'
                auto-complete='new-password'
                @keyup.enter.native='submitForm'
              )
            el-form-item(prop='password_confirmation')
              el-input(
                placeholder='Password confirmation'
                type='password'
                prefix-icon="el-icon-lock"
                v-model.trim='user.password_confirmation'
                auto-complete='new-password'
                @keyup.enter.native='submitForm'
              )
            el-form-item.mb-0
              base-button(ref='resetPasswordSubmit' @click='submitForm')
                | Save Password
        p.leading-normal.text-gray-600.text-center(v-else)
          | {{ this.validationError }}
</template>

<script>
  import { Form, FormItem, Input, Message } from 'element-ui';
  import { mapGetters, mapMutations } from 'vuex';

  import { edit, reset } from '@/services/endpoints/auth/passwords';

  export default {
    components: {
      'el-form': Form,
      'el-form-item': FormItem,
      'el-input': Input,
    },
    props: {
      resetPasswordToken: {
        type: String,
        required: true,
      },
    },
    data() {
      const passwordConfirmationMatches = (rule, value, callback) => {
        if (!value || value !== this.user.password) {
          callback(new Error('Passwords do not match.'));
        } else {
          callback();
        }
      };

      return {
        tokenValid: null,
        validationError: '',
        user: {
          password: '',
          password_confirmation: '',
        },
        rules: {
          password: [
            {
              required: true,
              message: "Password can't be blank",
              trigger: 'blur',
            },
            {
              min: 8,
              max: 24,
              message: 'Password must be between 8 and 24 characters.',
              trigger: 'change',
            },
          ],
          password_confirmation: [
            {
              required: true,
              message: "Password confirmation can't be blank",
              trigger: 'change',
            },
            { validator: passwordConfirmationMatches, trigger: 'blur' },
          ],
        },
      };
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
      submitForm() {
        this.$refs.updatePasswordForm.validate((valid) => {
          if (valid) { this.submitNewPassword(); }

          return false;
        });
      },
      async submitNewPassword() {
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
