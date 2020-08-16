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
        const state = { currentUser: null, dissmissedBannerID: null };

        user.mutations.setCurrentUser(state, newUser);

        expect(state).toEqual({
          currentUser: newUser,
          dissmissedBannerID: null,
        });
      });
    });

    describe('dismissUpdateBanner', () => {
      it('sets the id for the banner to be dismissed', () => {
        const state = { currentUser: null, dissmissedBannerID: null };

        user.mutations.dismissUpdateBanner(state, 1);

        expect(state).toEqual({ currentUser: null, dissmissedBannerID: 1 });
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
          { user: mockData },
        );
        expect(commit).toHaveBeenCalledWith(
          'setCurrentUser', { user_id: mockResponse.user_id },
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
          mockResponse.response.data.error,
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
          'Please check your email inbox and confirm your account first',
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
          mockResponse.response.data.error,
        );
      });
    });
  });
});
