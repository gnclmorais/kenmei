import BaseFormAutocomplete from '@/components/base_components/BaseFormAutocomplete.vue';

jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

// TODO: I need to figure out why I can't watch the debounced query
describe.skip('BaseFormAutocomplete.vue', () => {
  let baseFormAutocomplete;

  beforeEach(() => {
    baseFormAutocomplete = shallowMount(BaseFormAutocomplete, {
      propsData: { selectedValue: '' },
    });
  });

  describe('when selectedValue is provided', () => {
    beforeEach(() => {
      baseFormAutocomplete.setProps({
        selectedValue: 'Some value', items: ['Some value'],
      });
    });

    it('shows selected value', async () => {
      expect(baseFormAutocomplete.text()).toContain('Some value');
    });

    describe("and it's being pressed", () => {
      beforeEach(() => {
        baseFormAutocomplete.setProps({
          value: '', selectedValue: 'Some value',
        });
      });

      // TODO: Figure out how to simulate Parent Component sending back
      // updated selectedValue, so that the base input shows up and receives
      // focus
      it.skip('resets the selection', async () => {
        const selectedValue = baseFormAutocomplete.find('a');
        const dropdown      = baseFormAutocomplete.find('.dropdown-body');

        await selectedValue.trigger('click');

        expect(dropdown.element).toBeVisible();
        expect(baseFormAutocomplete.emitted('selected')[0]).toEqual(['']);
      });
    });
  });

  describe('and query is not blank', () => {
    beforeEach(() => {
      baseFormAutocomplete.setData({ query: 'new query' });
    });

    describe('with loading true', () => {
      beforeEach(() => {
        baseFormAutocomplete.setProps({ loading: true });
      });

      it('shows skeleton loading', async () => {
        const skeleton = baseFormAutocomplete.findAll('.animate-pulse');
        expect(skeleton.at(0).element).toBeVisible();
      });
    });

    describe('with loading false', () => {
      beforeEach(() => {
        baseFormAutocomplete.setProps({ loading: false });
      });

      describe('and items are not blank', () => {
        beforeEach(() => {
          baseFormAutocomplete.setProps({ items: ['Title 1', 'Title 2'] });
        });

        it('shows dropdown with items', async () => {
          const dropdownListItem = baseFormAutocomplete.findAll('a').at(0);
          expect(dropdownListItem.element).toBeVisible();
          expect(dropdownListItem.text()).toContain('Title 1');
        });

        describe('and link is clicked', () => {
          it('emits selected value and closes dropdown', async () => {
            const dropdownListItem = baseFormAutocomplete.findAll('a').at(0);
            const dropdown = baseFormAutocomplete.find('.dropdown-body');

            await dropdownListItem.trigger('click');

            expect(dropdown.element).not.toBeVisible();
            expect(baseFormAutocomplete.emitted('selected')[0])
              .toEqual(['Title 1']);
          });
        });
      });

      describe('and items are blank', () => {
        it('shows Nothing found', async () => {
          const nothingFound = baseFormAutocomplete.find('p');

          expect(baseFormAutocomplete.findAll('a').exists()).toBeFalsy();
          expect(nothingFound.element).toBeVisible();
          expect(nothingFound.text()).toContain('Nothing found');
        });
      });
    });
  });

  describe('and query is blank', () => {
    it("doesn't show the dropdown", async () => {
      const dropdown = baseFormAutocomplete.find('.dropdown-body');
      expect(dropdown.element).not.toBeVisible();
    });
  });
});
