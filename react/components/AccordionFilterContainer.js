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
  maxItemsDepartment,
  maxItemsCategory
}) => {
  // const [openItem, setOpenItem] = useState(null);
  const handles = useCssHandles(CSS_HANDLES);

  // console.log('filters',filters)
  // console.log('filters',selectedFilters)

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
            filters={selectedFilters.filter(op => op.map !== "c")}
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
          filters={filters}
          priceRange={priceRange}
          preventRouteChange={preventRouteChange}
          initiallyCollapsed={initiallyCollapsed}
          navigateToFacet={onFilterCheck}
        />
      </div>
      <ExtensionPoint id="shop-review-summary" />
    </Fragment>
  );

  // return (
  //   <div className={classNames(styles.accordionFilter, "h-100")}>
  //     <div
  //       className={classNames(
  //         styles.filterAccordionBreadcrumbs,
  //         "pointer flex flex-row items-center pa5 bg-base w-100 z-max bb b--muted-4"
  //       )}
  //     >
  //       <div
  //         role="button"
  //         tabIndex={0}
  //         className="pv4 flex items-center"
  //         onClick={() => setOpenItem(null)}
  //         onKeyDown={handleKeyDown}
  //       >
  //         <div
  //           className={classNames("t-heading-4", {
  //             "c-muted-2": openItem,
  //             "c-on-base": !openItem
  //           })}
  //         >
  //           {intl.formatMessage({
  //             id: "store/search-result.filter-breadcrumbs.primary"
  //           })}
  //         </div>
  //       </div>
  //       {openItem && (
  //         <div
  //           className={`${handles.filterBreadcrumbsItem} pv4 flex items-center`}
  //         >
  //           <IconCaret orientation="right" size={13} />
  //           <div
  //             className={`${handles.filterBreadcrumbsItemName} pl3 t-heading-4 c-on-base`}
  //           >
  //             {intl.formatMessage({ id: openItem })}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //
  //     {tree.length > 0 && (
  //       <AccordionFilterItem
  //         title={CATEGORIES_TITLE}
  //         open={departmentsOpen}
  //         show={!openItem || departmentsOpen}
  //         onOpen={handleOpen(CATEGORIES_TITLE)}
  //       >
  //         <div className={itemClassName}>
  //           <DepartmentFilters
  //             tree={tree}
  //             isVisible={tree.length > 0}
  //             onCategorySelect={onCategorySelect}
  //             hideBorder
  //           />
  //         </div>
  //       </AccordionFilterItem>
  //     )}
  //
  //     {nonEmptyFilters.map(filter => {
  //       const { type, title } = filter;
  //       const isOpen = openItem === filter.title;
  //
  //       switch (type) {
  //         case "PriceRanges":
  //           return (
  //             <AccordionFilterPriceRange
  //               title={filter.title}
  //               facets={filter.facets}
  //               key={title}
  //               className={itemClassName}
  //               open={isOpen}
  //               show={!openItem || isOpen}
  //               onOpen={handleOpen(title)}
  //               onFilterCheck={onFilterCheck}
  //               priceRange={priceRange}
  //             />
  //           );
  //         default:
  //           return (
  //             <AccordionFilterGroup
  //               title={filter.title}
  //               facets={filter.facets}
  //               key={title}
  //               className={itemClassName}
  //               open={isOpen}
  //               show={!openItem || isOpen}
  //               onOpen={handleOpen(title)}
  //               onFilterCheck={onFilterCheck}
  //             />
  //           );
  //       }
  //     })}
  //   </div>
  // );
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
  maxItemsDepartment: PropTypes.number,
  maxItemsCategory: PropTypes.number
};

export default injectIntl(AccordionFilterContainer);
