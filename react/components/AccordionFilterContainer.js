import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl, intlShape } from "react-intl";
import classNames from "classnames";

import { applyModifiers, useCssHandles } from "vtex.css-handles";

// const CSS_HANDLES = ["filterBreadcrumbsItem", "filterBreadcrumbsItemName"];
import "../searchResult.css";
import DepartmentFilters from "./DepartmentFilters";
import SelectedFilters from "./SelectedFilters";
import AvailableFilters from "./AvailableFilters";
import { ExtensionPoint } from "vtex.render-runtime";
import useSelectedFilters from '../hooks/useSelectedFilters'
// import FilterSidebar from "./FilterSidebar";

const CATEGORIES_TITLE = "store/search.filter.title.categories";

const CSS_HANDLES = [
  "filter__container",
  "filterMessage",
  "filtersWrapper",
  "filtersWrapperMobile"
];

const AccordionFilterContainer = ({
  loading,
  mobileLayout,
  filters,
  onFilterCheck,
  tree,
  preventRouteChange,
  initiallyCollapsed,
  priceRange,
  hiddenFacets,
  showSelectedFilters,
  selectedFilters,
  appliedFilters,
  maxItemsDepartment,
  maxItemsCategory
}) => {
  const handles = useCssHandles(CSS_HANDLES);

  const filtersChecked = filters.map(filter => {
    const options = {};
    if(filter.title !== undefined) options.title = filter.title;
    if(filter.type !== undefined) options.type = filter.type;
    if(filter.facets.length > 0) {
      options.facets = useSelectedFilters(filter.facets)
    }

    return options;
  })

  const filterClasses = classNames({
    "flex-column items-center justify-center flex-auto h-100": mobileLayout,
    dn: loading
  });

  return (
    <Fragment>
      <div className={`${filterClasses} ${handles.filtersWrapper}`}>
        <div
          className={`${applyModifiers(
            handles.filter__container,
            "title"
          )} bb b--muted-4`}
        >
          <h5 className={`${handles.filterMessage} t-heading-5 mv5`}>
            <FormattedMessage id="store/search-result.filter-button.title" />
          </h5>
        </div>
        {showSelectedFilters ? (
          <SelectedFilters
            filters={appliedFilters.filter(op => op.map !== "c")}
            preventRouteChange={preventRouteChange}
            navigateToFacet={onFilterCheck}
          />
        ) : null}
        <DepartmentFilters
          title={CATEGORIES_TITLE}
          tree={tree}
          isVisible={!hiddenFacets.categories}
          onCategorySelect={onFilterCheck}
          preventRouteChange={preventRouteChange}
          maxItemsDepartment={maxItemsDepartment}
          maxItemsCategory={maxItemsCategory}
        />
        <AvailableFilters
          filters={filtersChecked}
          priceRange={priceRange}
          preventRouteChange={preventRouteChange}
          initiallyCollapsed={initiallyCollapsed}
          navigateToFacet={onFilterCheck}
        />
      </div>
      <ExtensionPoint id="shop-review-summary" />
    </Fragment>
  );
};

AccordionFilterContainer.propTypes = {
  loading: PropTypes.bool,
  mobileLayout: PropTypes.bool,
  /** Current available filters */
  filters: PropTypes.arrayOf(PropTypes.object),
  /** Intl instance */
  intl: intlShape,
  /** Filters mapped for checkbox */
  filtersChecks: PropTypes.object,
  /** Checkbox hit callback function */
  onFilterCheck: PropTypes.func,
  /** Current price range filter query parameter */
  priceRange: PropTypes.string,
  tree: PropTypes.any,
  onCategorySelect: PropTypes.func,
  preventRouteChange: PropTypes.bool,
  initiallyCollapsed: PropTypes.bool,
  hiddenFacets: PropTypes.object,
  showSelectedFilters: PropTypes.bool,
  selectedFilters: PropTypes.object,
  appliedFilters: PropTypes.object,
  maxItemsDepartment: PropTypes.number,
  maxItemsCategory: PropTypes.number
};

export default injectIntl(AccordionFilterContainer);
