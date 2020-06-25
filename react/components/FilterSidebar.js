import classNames from 'classnames'
import produce from 'immer'
import React, { useState, useEffect, useMemo, Fragment, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import { ExtensionPoint } from 'vtex.render-runtime'
import { Button } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import FilterNavigatorContext, {
  useFilterNavigator
} from "./FilterNavigatorContext";
import AccordionFilterContainer from "./AccordionFilterContainer";
import { MAP_CATEGORY_CHAR } from '../constants'
import { buildNewQueryMap } from "../hooks/useFacetNavigation";

import styles from '../searchResult.css'
import { getFullTextAndCollection } from '../utils/compatibilityLayer'
import {
  isCategoryDepartmentCollectionOrFT,
  filterCategoryDepartmentCollectionAndFT,
} from '../utils/queryAndMapUtils'
import useSelectedFilters from '../hooks/useSelectedFilters'

const CSS_HANDLES = [
  "filterPopupButton",
  "filterPopupTitle",
  "filterButtonsBox",
  "filterPopupArrowIcon",
  "filterClearButtonWrapper",
  "filterApplyButtonWrapper"
];

const FilterSidebar = ({
  loading,
  mobileLayout,
  selectedFilters,
  filters,
  tree,
  priceRange,
  preventRouteChange,
  initiallyCollapsed,
  navigateToFacet,
  hiddenFacets,
  showSelectedFilters,
  maxItemsDepartment,
  maxItemsCategory
}) => {
  // const filters = useSelectedFilters(filtersFacets)
  const filterContext = useFilterNavigator();
  const handles = useCssHandles(CSS_HANDLES);
  const shouldClear = useRef(false)

  const [filterOperations, setFilterOperations] = useState([]);
  const [categoryTreeOperations, setCategoryTreeOperations] = useState([]);
  // const [filterOperations, setFilterOperations] = useState(selectedFilters.filter(op => op.map !== "c"));
  // const [categoryTreeOperations, setCategoryTreeOperations] = useState(selectedFilters.filter(op => op.map === "c"));
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const currentTree = useCategoryTree(tree, categoryTreeOperations);

  const isFilterSelected = (filters, filter) => {
    return filters.find(
      filterOperation =>
        filter.value === filterOperation.value && filter.map === filter.map
    );
  };

  const handleFilterCheck = filter => {
    if (!isFilterSelected(filterOperations, filter)) {
      setFilterOperations(filterOperations.concat(filter));
    } else {
      setFilterOperations(
        filterOperations.filter(facet => facet.value !== filter.value)
      );
    }
  };

  const handleApply = () => {
    navigateToFacet(filterOperations, preventRouteChange);
    setFilterOperations([]);
  };

  const handleClearFilters = () => {
    shouldClear.current = true
    // Gets the previously selected facets that should be cleared
    const selectedFacets = selectedFilters.filter(
      facet => !isCategoryDepartmentCollectionOrFT(facet.key) && facet.selected
    )

    // Should not clear categories, departments and clusterIds
    const selectedRest = filterOperations.filter(facet =>
      isCategoryDepartmentCollectionOrFT(facet.key)
    )

    setFilterOperations([...selectedFacets, ...selectedRest])
  }

  const handleUpdateCategories = maybeCategories => {
    const categories = Array.isArray(maybeCategories)
      ? maybeCategories
      : [maybeCategories];

    /* There is no need to compare with CATEGORY and DEPARTMENT since
     they are seen as a normal facet in the new VTEX search */
    const categoriesSelected = filterOperations.filter(
      op => op.map === MAP_CATEGORY_CHAR
    )
    const newCategories = [...categoriesSelected, ...categories]

    // Just save the newest operation here to be recorded at the category tree hook and update the tree
    setCategoryTreeOperations(categories);

    // Save all filters along with the new categories, appended to the old ones
    setFilterOperations(filters => {
      return filters
        .filter(operations => operations.map !== MAP_CATEGORY_CHAR)
        .concat(newCategories);
    });
  };

  const context = useMemo(() => {
    const { query, map } = filterContext
    const fullTextAndCollection = getFullTextAndCollection(query, map)

    /* This removes the previously selected stuff from the context when you click on 'clear'.
    It is important to notice that it keeps categories, departments and clusterIds since they
    are important to show the correct facets. */
    if (shouldClear.current) {
      shouldClear.current = false
      return filterCategoryDepartmentCollectionAndFT(filterContext)
    }

    /* The spread on selectedFilters was necessary because buildNewQueryMap
     changes the object but we do not want that on mobile */
    return {
      ...filterContext,
      ...buildNewQueryMap(fullTextAndCollection, filterOperations, [
        ...selectedFilters,
      ]),
    }
  }, [filterOperations, filterContext, selectedFilters])

  return (
    <Fragment>
      <FilterNavigatorContext.Provider value={context}>
        <AccordionFilterContainer
          loading={loading}
          mobileLayout={mobileLayout}
          filters={filters}
          tree={currentTree}
          onFilterCheck={handleFilterCheck}
          onCategorySelect={handleUpdateCategories}
          preventRouteChange={preventRouteChange}
          initiallyCollapsed={initiallyCollapsed}
          priceRange={priceRange}
          hiddenFacets={hiddenFacets}
          showSelectedFilters={showSelectedFilters}
          selectedFilters={filterOperations}
          appliedFilters={selectedFilters}
          maxItemsDepartment={maxItemsDepartment}
          maxItemsCategory={maxItemsCategory}
        />
      </FilterNavigatorContext.Provider>
      <div
        className={`${styles.filterButtonsBox} bt b--muted-5 bottom-0 absolute w-100 items-center flex z-1 bg-base`}
      >
        <div
          className={`${handles.filterClearButtonWrapper} bottom-0 fl w-50 pl4 pr2`}
        >
          <Button
            block
            variation="tertiary"
            size="regular"
            onClick={handleClearFilters}
          >
            <FormattedMessage id="store/search-result.filter-button.clear" />
          </Button>
        </div>
        <div
          className={`${handles.filterApplyButtonWrapper} bottom-0 fr w-50 pr4 pl2`}
        >
          <Button
            block
            variation="secondary"
            size="regular"
            onClick={handleApply}
          >
            <FormattedMessage id="store/search-result.filter-button.apply" />
          </Button>
        </div>
      </div>
    </Fragment>
  );
};

const updateTree = categories =>
  produce(draft => {
    if (!categories.length) {
      return;
    }

    let currentLevel = draft;

    while (
      !(
        currentLevel.find(category => category.value === categories[0].value) ||
        currentLevel.every(category => !category.selected)
      )
      ) {
      currentLevel = currentLevel.find(category => category.selected).children;
    }

    categories.forEach(category => {
      let selectedIndex = currentLevel.findIndex(
        cat => cat.value === category.value
      );

      currentLevel[selectedIndex].selected = !currentLevel[selectedIndex]
        .selected;
      currentLevel = currentLevel[selectedIndex].children;
    });
  });

// in order for us to avoid sending a request to the facets
// API and refetch all filters on every category change (like
// we are doing on desktop), we'll keep a local copy of the category
// tree structure, and locally modify it with the information we
// have.
//
// the component responsible for displaying the category tree
// in a user-friendly manner should reflect to the changes
// we make in the tree, the same as it would with a tree fetched
// from the API.
const useCategoryTree = (initialTree, categoryTreeOperations) => {
  const [tree, setTree] = useState(initialTree);

  useEffect(() => {
    setTree(initialTree);
  }, [initialTree]);

  useEffect(() => {
    setTree(updateTree(categoryTreeOperations));
  }, [categoryTreeOperations, initialTree]);

  return tree;
};

export default FilterSidebar;
