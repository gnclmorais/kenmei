import { Message } from 'element-ui';
import flushPromises from 'flush-promises';
import MangaListTags from '@/components/settings/SettingsMangaListTags.vue';
import BaseDropdown from '@/components/base_components/BaseDropdown.vue';
import * as endpoint from '@/services/endpoints/UserTags';

const localVue = createLocalVue();

// To avoid missing directive Vue warnings
localVue.directive('loading', true);

describe('SettingsMangaListTags.vue', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  describe('when mounted', () => {
    let tagsSpy;

    beforeEach(() => {
      tagsSpy = jest.spyOn(endpoint, 'index');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('and API returns tags', () => {
      it('shows list of tags', async () => {
        tagsSpy.mockResolvedValue({
          status: 200,
          data: factories.userTag.buildList(1),
        });

        const mangaListTags = shallowMount(MangaListTags, { localVue });

        await flushPromises();

        expect(mangaListTags.find('ul').html()).toMatchSnapshot();
      });

      it('shows No tags added yet without tags', async () => {
        tagsSpy.mockResolvedValue({ status: 200, data: [] });

        const mangaListTags = shallowMount(MangaListTags, { localVue });

        await flushPromises();

        expect(mangaListTags.text()).toContain('No tags added yet');
      });
    });

    describe('and API returns an error', () => {
      it('shows Something went wrong message', async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');
        tagsSpy.mockResolvedValue({ status: 500 });

        shallowMount(MangaListTags, { localVue });

        await flushPromises();

        expect(errorMessageMock).toHaveBeenCalledWith(
          'Something went wrong, try refreshing the page',
        );
      });
    });
  });

  describe('when selecting an action for a tag', () => {
    let mangaListTags;

    const tag1 = factories.userTag.build({ name: 'Tag 1' });
    const tag2 = factories.userTag.build({ name: 'Tag 2' });

    beforeEach(() => {
      mangaListTags = shallowMount(MangaListTags, {
        localVue,
        data() { return { tags: [tag1, tag2] }; },
      });
    });

    describe('and action is Edit', () => {
      it('shows modal with populated tag details', async () => {
        await mangaListTags.findAllComponents(BaseDropdown).at(1).vm.$emit(
          'click', 'Edit',
        );

        expect(mangaListTags.vm.form.id).toEqual(tag2.id);
        expect(mangaListTags.vm.form.name).toEqual(tag2.name);
        expect(mangaListTags.vm.form.description).toEqual(tag2.description);
        expect(mangaListTags.vm.modalVisible).toBeTruthy();
      });
    });

    describe('and action is Delete', () => {
      it('shows modal with populated tag details', async () => {
        await mangaListTags.findAllComponents(BaseDropdown).at(1).vm.$emit(
          'click', 'Delete',
        );

        expect(mangaListTags.vm.form.id).toEqual(tag2.id);
      });
    });
  });

  describe('when creating a tag', () => {
    let tagsSpy;
    let mangaListTags;

    const tag1 = factories.userTag.build({ name: 'Tag 1' });

    beforeEach(() => {
      tagsSpy = jest.spyOn(endpoint, 'create');

      mangaListTags = mount(MangaListTags, {
        localVue,
        data() { return { tags: [tag1] }; },
      });
    });

    it('shows tag creation modal', async () => {
      mangaListTags.find({ ref: 'openTagCreationModal' }).trigger('click');

      expect(mangaListTags.vm.modalVisible).toBeTruthy();
    });

    describe('and creation is successful', () => {
      it('adds new tag to the tags list', async () => {
        const newTag = factories.userTag.build({
          id: null, name: 'New Tag', description: 'Description',
        });

        tagsSpy.mockResolvedValue({ status: 200, data: newTag });

        await mangaListTags.find({ ref: 'openTagCreationModal' })
          .trigger('click');
        await mangaListTags.setData({ form: newTag });

        mangaListTags.find({ ref: 'addTagButton' }).trigger('click');

        await flushPromises();

        expect(tagsSpy).toHaveBeenCalledWith(newTag);
        expect(mangaListTags.vm.modalVisible).toBeFalsy();
        expect(mangaListTags.vm.modalLoading).toBeFalsy();
        expect(mangaListTags.vm.tags).toEqual([tag1, newTag]);
        expect(mangaListTags.vm.form).toEqual({
          id: null,
          name: '',
          description: '',
        });
      });
    });

    describe('and creation is unsuccessful', () => {
      it('shows validation errors', async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');
        tagsSpy.mockResolvedValue({ status: 500, data: 'Name exists' });

        await mangaListTags.find({ ref: 'openTagCreationModal' })
          .trigger('click');
        await mangaListTags.setData({
          form: factories.userTag.build({ id: null }),
        });

        mangaListTags.find({ ref: 'addTagButton' }).trigger('click');

        await flushPromises();

        expect(mangaListTags.vm.modalVisible).toBeTruthy();
        expect(mangaListTags.vm.modalLoading).toBeFalsy();
        expect(errorMessageMock).toHaveBeenCalledWith('Name exists');
      });
    });
  });

  describe('when updating a tag', () => {
    let tagsSpy;
    let mangaListTags;

    const tag1 = factories.userTag.build({ name: 'Tag 1' });
    const tag2 = factories.userTag.build({ name: 'Tag 2' });

    beforeEach(() => {
      tagsSpy = jest.spyOn(endpoint, 'update');

      mangaListTags = mount(MangaListTags, {
        localVue,
        data() { return { tags: [tag1, tag2], modalVisible: true }; },
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('and update is successful', () => {
      it('updates tag data', async () => {
        const updatedTag = factories.userTag.build({
          id: tag1.id, name: 'New Tag', description: '',
        });

        tagsSpy.mockResolvedValue({ status: 200, data: updatedTag });

        await mangaListTags.setData({ form: updatedTag });

        mangaListTags.find({ ref: 'addTagButton' }).trigger('click');

        await flushPromises();

        expect(mangaListTags.vm.modalVisible).toBeFalsy();
        expect(mangaListTags.vm.modalLoading).toBeFalsy();
        expect(mangaListTags.vm.tags).toEqual([
          updatedTag,
          tag2,
        ]);
        expect(mangaListTags.vm.form).toEqual({
          id: null,
          name: '',
          description: '',
        });
      });
    });

    describe('and update is unsuccessful', () => {
      it('shows validation errors', async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');
        tagsSpy.mockResolvedValue({ status: 500, data: 'Name exists' });

        await mangaListTags.setData({ form: factories.userTag.build() });

        mangaListTags.find({ ref: 'addTagButton' }).trigger('click');

        await flushPromises();

        expect(mangaListTags.vm.modalVisible).toBeTruthy();
        expect(mangaListTags.vm.modalLoading).toBeFalsy();
        expect(errorMessageMock).toHaveBeenCalledWith('Name exists');
      });
    });
  });

  describe('when deleting a tag', () => {
    let tagsSpy;
    let mangaListTags;

    const tag1 = factories.userTag.build();
    const tag2 = factories.userTag.build();

    beforeEach(() => {
      tagsSpy = jest.spyOn(endpoint, 'destroy');

      mangaListTags = mount(MangaListTags, {
        localVue,
        data() { return { tags: [tag1, tag2] }; },
      });
    });

    afterEach(() => {
      expect(tagsSpy).toHaveBeenCalledWith(tag2.id);
      expect(mangaListTags.vm.form).toEqual({
        id: null,
        name: '',
        description: '',
      });
    });

    describe('and deletion is successful', () => {
      it('removes tag from tags list', async () => {
        tagsSpy.mockResolvedValue({ status: 200 });

        await mangaListTags.findAllComponents(BaseDropdown).at(1).vm.$emit(
          'click', 'Delete',
        );

        await flushPromises();

        expect(mangaListTags.vm.tags).toEqual([tag1]);
      });
    });

    describe('and deletion is unsuccessful', () => {
      it('shows validation errors', async () => {
        const errorMessageMock = jest.spyOn(Message, 'error');

        tagsSpy.mockResolvedValue({ status: 500, data: 'Not your tag' });

        await mangaListTags.findAllComponents(BaseDropdown).at(1).vm.$emit(
          'click', 'Delete',
        );

        await flushPromises();

        expect(errorMessageMock).toHaveBeenCalledWith('Not your tag');
      });
    });
  });
});
