import { Message, Loading } from 'element-ui';
import { secure, plain } from '@/modules/axios';

const state = {
  currentUser: null,
};

const getters = {
  signedIn: state => state.currentUser !== null,
};

const actions = {
  signIn({ commit }, data) {
    const loading = Loading.service({ target: '#sign-on-card' });

    return plain.post('/api/v1/sessions/', { user: data })
      .then((response) => {
        commit('setCurrentUser', { user_id: response.data.user_id });
        localStorage.access = response.data.access;
      })
      .catch((request) => {
        if (request.response.data.error === 'User unconfirmed') {
          Message.info(
            'Please email hi@kenmei.co to get your account confirmed'
          );
        } else {
          Message.error(request.response.data.error);
        }
      })
      .then(() => { loading.close(); });
  },
  signOut({ commit }) {
    return secure.delete('/api/v1/sessions/')
      .then(() => {
        commit('setCurrentUser', null);
        delete localStorage.access;
      })
      .catch((request) => {
        if (request.response.data.error === 'Signature has expired') {
          commit('setCurrentUser', null);
          delete localStorage.access;
        } else {
          Message.error(request.response.data.error);
        }
      });
  },
  signUp({ _commit }, data) {
    const loading = Loading.service({ target: '#sign-on-card' });

    return plain.post('/api/v1/registrations/', { user: data })
      .then(() => {
        Message({
          message: `Thank you for registering. Please email hi@kenmei.co from
          the same email to get your account confirmed`,
          type: 'success',
          duration: 0,
          showClose: true,
        });
      })
      .catch((request) => {
        Message.error({
          dangerouslyUseHTMLString: true,
          message: request.response.data,
        });
      })
      .then(() => { loading.close(); });
  },
  updatePassword({ commit }, { resetPasswordToken, user }) {
    const loading = Loading.service({ target: '#reset-pass-card' });
    const payload = { user, reset_password_token: resetPasswordToken };

    return plain.put('/auth/passwords/', payload)
      .then((response) => {
        commit('setCurrentUser', { user_id: response.data.user_id });
        localStorage.access = response.data.access;
      })
      .catch((request) => {
        Message.error({
          dangerouslyUseHTMLString: true,
          message: request.response.data,
        });
      })
      .then(() => { loading.close(); });
  },
};

const mutations = {
  setCurrentUser(state, data) {
    state.currentUser = data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
