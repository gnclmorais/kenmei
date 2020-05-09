import BaseModal from '@/components/base_components/BaseModal.vue';

const localVue = createLocalVue();

// To avoid missing directive Vue warnings
localVue.directive('loading', true);
localVue.directive('scroll-lock', true);

describe('BaseModal.vue', () => {
  describe('when pressing Esc', () => {
    it('gets modal closed', () => {
      const baseModal = shallowMount(BaseModal, {
        localVue,
        attachToDocument: true,
        propsData: { visible: true },
      });

      baseModal.trigger('keydown.esc');

      expect(baseModal.emitted('dialogClosed')).toBeTruthy();
    });
  });

  describe('when pressing on mask', () => {
    it('gets modal closed', () => {
      const baseModal = shallowMount(BaseModal, { localVue });

      baseModal.find({ ref: 'modalMask' }).trigger('click');

      expect(baseModal.emitted('dialogClosed')).toBeTruthy();
    });
  });

  describe(':props', () => {
    let baseModal;

    beforeEach(() => {
      baseModal = shallowMount(BaseModal, { localVue });
    });

    describe(':visible', () => {
      it.todo('true - applies overflow hidden with padding');
      it.todo('false - removes overflow hidden');
    });

    describe(':size', () => {
      let body;

      beforeEach(() => {
        body = baseModal.find('.modal-body');
      });

      it('xs - sets body to be extra small', async () => {
        await baseModal.setProps({ size: 'xs' });

        expect(body.classes()).toContain('sm_max-w-xs');
      });

      it('sm - sets body to be small', async () => {
        await baseModal.setProps({ size: 'sm' });

        expect(body.classes()).toContain('sm_max-w-sm');
      });

      it('md - sets body to be medium', async () => {
        await baseModal.setProps({ size: 'md' });

        expect(body.classes()).toContain('sm_max-w-md');
      });

      it('lg - sets body to be large', async () => {
        await baseModal.setProps({ size: 'lg' });

        expect(body.classes()).toContain('sm_max-w-lg');
      });
    });
  });
});
