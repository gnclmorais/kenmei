import i18n from 'i18n';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';
import TheImporters from '@/components/TheImporters.vue';
import lists from '@/store/modules/lists';
import * as importersEndpoint from '@/services/endpoints/importers';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('TheImporters.vue', () => {
  describe('when closing dialog', () => {
    let store;
    let importers;

    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              lists: [],
              entries: [],
            },
            actions: lists.actions,
            getters: lists.getters,
            mutations: lists.mutations,
          },
        },
      });
      importers = shallowMount(TheImporters, {
        store,
        localVue,
        propsData: { visible: true },
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.skip('resets data to original state', async () => {
      // Can't get this to work at the moment. Known issue, might be fine in Jest 27
      // https://github.com/facebook/jest/issues/3465

      jest.useFakeTimers('modern');

      await importers.setData({
        importURL: 'https://mangadex.org/list/007',
        activeTab: 'mangaDex',
        loading: true,
      });

      await importers.setProps({ visible: false });

      expect(importers.vm.importURL).toEqual('');
      expect(importers.vm.activeTab).toEqual('trackrMoe');
      expect(importers.vm.loading).toEqual(false);
    });
  });

  describe('when importing MangaDex entries from Trackr.moe JSON', () => {
    let importedList;
    let store;
    let importers;

    beforeEach(() => {
      importedList = {
        series: {
          reading: {
            manga: [{
              full_title_url: 'example.url/manga/1',
              generated_current_data: {
                url: 'example.url/chapter/1',
                number: 'v5/c34',
              },
              site_data: {
                site: 'mangadex.org',
              },
            }],
          },
        },
      };
      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              lists: [],
              entries: [],
            },
            actions: lists.actions,
            getters: lists.getters,
            mutations: lists.mutations,
          },
        },
      });
      importers = mount(TheImporters, { store, localVue });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('when file is valid', () => {
      it('parses manga list', async () => {
        const file = new File(
          [importedList], 'list.json', { type: 'application/json' },
        );
        const fileReaderReadTextMock = jest.spyOn(window, 'FileReader');

        fileReaderReadTextMock.mockImplementation(() => ({
          readAsText: jest.fn(),
        }));

        importers.vm.processUpload({ file });

        await flushPromises();

        expect(fileReaderReadTextMock).toHaveBeenCalled();
      });

      describe('and request status is success', () => {
        it('shows success message', async () => {
          const postTrackrMoeMock = jest.spyOn(
            importersEndpoint, 'postTrackrMoe',
          );

          postTrackrMoeMock.mockResolvedValue({
            status: 200,
            data: 'You will receive an email',
          });

          importers.vm.processMangaDexList(importedList);

          await flushPromises();

          expect(importers.text()).toContain('Import started');
          expect(importers.text()).toContain('You will receive an email');
        });
      });

      describe('and request status is bad request', () => {
        it('shows that import is currently in progress', async () => {
          const postTrackrMoeMock = jest.spyOn(
            importersEndpoint, 'postTrackrMoe',
          );

          postTrackrMoeMock.mockResolvedValue({
            status: 400,
            data: 'Import in progress',
          });

          importers.vm.processMangaDexList(importedList);

          await flushPromises();

          expect(importers.text()).toContain('Import currently in progress');
          expect(importers.text()).toContain('Import in progress');
        });
      });

      describe('and request status is not handled', () => {
        it('shows Something went wrong message', async () => {
          const postTrackrMoeMock = jest.spyOn(
            importersEndpoint, 'postTrackrMoe',
          );

          postTrackrMoeMock.mockResolvedValue({ status: 500 });

          importers.vm.processMangaDexList(importedList);

          await flushPromises();

          expect(importers.text()).toContain('Something went wrong');
          expect(importers.text()).toContain(
            'Try again later or contact hi@kenmei.co',
          );
        });
      });
    });

    describe('when file is invalid', () => {
      it.todo('raises an File is incorrect error if not trackr.moe file');
      it.todo('raises a Partial list error if trackr.moe list is incomplete');
    });
  });

  describe('when importing MangaDex entries from MangaDex MDList', () => {
    let store;
    let importers;

    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          lists: {
            namespaced: true,
            state: {
              lists: [],
              entries: [],
            },
            actions: lists.actions,
            getters: lists.getters,
            mutations: lists.mutations,
          },
        },
      });
      importers = mount(TheImporters, {
        store,
        localVue,
        i18n,
        data() {
          return {
            importURL: 'https://mangadex.org/list/007',
            activeTab: 'mangaDex',
          };
        },
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('and has client-side errors', () => {
      it('shows validation errors', async () => {
        await importers.setData({ importURL: 'https://mangadex.org/list/12/' });
        await importers
          .findComponent({ ref: 'importMangaDexButton' })
          .trigger('click');

        expect(importers.text())
          .toContain('MDList URLmust be a MDList url');
      });
    });

    describe('and request status is success', () => {
      it('shows success message', async () => {
        const postMDListSpy = jest.spyOn(importersEndpoint, 'postMDList');

        postMDListSpy.mockResolvedValue({
          status: 200,
          data: 'You will receive an email',
        });

        importers.vm.importMangaDex();

        await flushPromises();

        expect(importers.text()).toContain('Import started');
        expect(importers.text()).toContain('You will receive an email');
      });
    });

    describe('and request status is bad request', () => {
      it('shows that import is currently in progress', async () => {
        const postMDListSpy = jest.spyOn(importersEndpoint, 'postMDList');

        postMDListSpy.mockResolvedValue({
          status: 400,
          data: 'Import in progress',
        });

        importers.vm.importMangaDex();

        await flushPromises();

        expect(importers.text()).toContain('Import currently in progress');
        expect(importers.text()).toContain('Import in progress');
      });
    });

    describe('and request status is not found', () => {
      it('shows something went wrong message', async () => {
        const postMDListSpy = jest.spyOn(importersEndpoint, 'postMDList');

        postMDListSpy.mockResolvedValue({
          status: 404,
          data: 'MDList not found',
        });

        importers.vm.importMangaDex();

        await flushPromises();

        expect(importers.text()).toContain('List is private');
        expect(importers.text()).toContain('MDList not found');
      });
    });

    describe('and request status is not handled', () => {
      it('shows something went wrong message', async () => {
        const postMDListSpy = jest.spyOn(importersEndpoint, 'postMDList');

        postMDListSpy.mockResolvedValue({ status: 500 });

        importers.vm.importMangaDex();

        await flushPromises();

        expect(importers.text()).toContain('Something went wrong');
        expect(importers.text()).toContain(
          'Try again later or contact hi@kenmei.co',
        );
      });
    });
  });
});
