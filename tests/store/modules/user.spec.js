import axios from 'axios';
import flushPromises from 'flush-promises';
import { Message } from 'element-ui';
import user from '@/store/modules/user';

describe('user', () => {
  describe('getters', () => {
    describe('signedIn', () => {
      it('returns true if current user is set', () => {
        const state = { currentUser: jest.fn() };

        expect(user.getters.signedIn(state)).toBeTruthy();
      });
    });
  });

  describe('mutations', () => {
    describe('setCurrentUser', () => {
      it('sets current user state', () => {
        const newUser = { user_id: 1 };
        const state = { currentUser: null };

        user.mutations.setCurrentUser(state, newUser);

        expect(state).toEqual({ currentUser: newUser });
      });
    });
  });

  describe('actions', () => {
    let commit;

    beforeEach(() => {
      commit = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('signIn', () => {
      it('sends credentials and sets current user with access token', async () => {
        const axiosSpy = jest.spyOn(axios, 'post');
        const mockData = { email: 'test@example.com', password: 'password' };
        const mockResponse = { access: '123.abc.jwt', user_id: 1 };

        axiosSpy.mockResolvedValue({ status: 200, data: mockResponse });

        user.actions.signIn({ commit }, mockData);

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith(
          '/api/v1/sessions/',
          { user: mockData }
        );
        expect(commit).toHaveBeenCalledWith(
          'setCurrentUser', { user_id: mockResponse.user_id }
        );
      });

      it('raises Message error if server returns unauthorized', async () => {
        const axiosSpy        = jest.spyOn(axios, 'post');
        const errorMessageSpy = jest.spyOn(Message, 'error');

        const mockData = {
          email: 'test@example.com',
          password: 'wrong_password',
        };
        const mockResponse = {
          response: { data: { error: 'Invalid email or password' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        user.actions.signIn({ commit }, mockData);

        await flushPromises();

        expect(commit).not.toHaveBeenCalledWith('setCurrentUser');
        expect(errorMessageSpy).toHaveBeenLastCalledWith(
          mockResponse.response.data.error
        );
      });

      it('shows confirmation info message if server returns unconfirmed', async () => {
        const axiosSpy       = jest.spyOn(axios, 'post');
        const infoMessageSpy = jest.spyOn(Message, 'info');

        const mockData = { email: 'test@example.com', password: 'password' };
        const mockResponse = {
          response: { data: { error: 'User unconfirmed' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        user.actions.signIn({ commit }, mockData);

        await flushPromises();

        expect(commit).not.toHaveBeenCalledWith('setCurrentUser');
        expect(infoMessageSpy).toHaveBeenLastCalledWith(
          'Please email hi@kenmei.co to get your account confirmed'
        );
      });
    });

    describe('signOut', () => {
      it('logs out user and resets access token and current user', async () => {
        const axiosSpy = jest.spyOn(axios, 'delete');

        axiosSpy.mockResolvedValue();

        user.actions.signOut({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/sessions/');
        expect(commit).toHaveBeenCalledWith('setCurrentUser', null);
      });

      it('logs user out if the token has expired', async () => {
        const axiosSpy = jest.spyOn(axios, 'delete');

        const mockResponse = {
          response: { data: { error: 'Signature has expired' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        user.actions.signOut({ commit });

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith('/api/v1/sessions/');
        expect(commit).toHaveBeenCalledWith('setCurrentUser', null);
      });

      it('raises Message error if get request failed', async () => {
        const axiosSpy         = jest.spyOn(axios, 'delete');
        const errorMessageMock = jest.spyOn(Message, 'error');

        const mockResponse = {
          response: { data: { error: 'Some other error' } },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        user.actions.signOut({ commit });

        await flushPromises();

        expect(commit).not.toHaveBeenCalledWith('setCurrentUser');
        expect(errorMessageMock).toHaveBeenLastCalledWith(
          mockResponse.response.data.error
        );
      });
    });

    describe('signUp', () => {
      it('POSTs to registrations endpoint and show confirmation message', async () => {
        const axiosSpy = jest.spyOn(axios, 'post');
        const mockData = {
          email: 'test@example.com',
          password: 'password',
          password_confirmation: 'password',
        };

        axiosSpy.mockResolvedValue({ status: 200 });

        user.actions.signUp({ commit }, mockData);

        await flushPromises();

        expect(axiosSpy).toHaveBeenCalledWith(
          '/api/v1/registrations/',
          { user: mockData }
        );
      });

      it('shows server-side errors if request failed', async () => {
        const axiosSpy        = jest.spyOn(axios, 'post');
        const errorMessageSpy = jest.spyOn(Message, 'error');

        const mockData     = { email: 'test@example.com' };
        const mockResponse = {
          response: {
            data: 'Missing password<br>Missing password confirmation',
          },
        };

        axiosSpy.mockRejectedValue(mockResponse);

        user.actions.signUp({ commit }, mockData);

        await flushPromises();

        expect(commit).not.toHaveBeenCalledWith('setCurrentUser');
        // TODO: Check that we actually called it with server-side errors
        expect(errorMessageSpy).toBeCalled();
      });
    });
  });
});