<template lang="pug">
  .flex.flex-col.h-full.w-full.items-center.justify-center
    base-card.max-w-sm.my-56
      .px-6.py-4#user-confirmation-card
        p.text-lg.leading-normal.text-gray-600.text-center(
          v-if="tokenValid === null"
        )
          | Checking token validity
          br
          i.el-icon-loading
        p.leading-normal.text-gray-600.text-center(v-else)
          | {{ this.validationError }}
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';

  import { show } from '@/services/endpoints/auth/confirmations';

  export default {
    props: {
      confirmationToken: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        tokenValid: null,
        validationError: '',
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
      async checkTokenValidity() {
        const response = await show(this.confirmationToken);

        if (response.status === 200) {
          this.setCurrentUser({
            user_id: response.data.user_id,
            email: response.data.email,
          });
          localStorage.access = response.data.access;

          this.$router.push({ name: 'manga-list' });
        } else {
          const { error } = response.data;

          this.tokenValid = false;

          if (error === 'Token not found') {
            this.validationError = `
              ${error}, please double check it's correct or contact hi@kenmei.co
            `;
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
