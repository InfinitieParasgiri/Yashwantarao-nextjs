# Project History - Hyperlocal-Yashwantarao-Customization-Web

## [2026-07-31] - Project Selection & Initialization
- **Feature**: Project context selected (`Hyperlocal-Yashwantarao-Customization-Web`).
- **Files Modified**: `PROJECT_HISTORY.md`
- **Logic Changes**: Initialized `PROJECT_HISTORY.md` to track project memory.
- **Pending Tasks**: Awaiting user decision on whether to add `HomeCategories` to the grocery page.

## [2026-07-31] - Inspected Grocery Page for "Shop by Category"
- **Feature**: Checked if "Shop by Category" (`HomeCategories`) section is commented out or missing on the grocery page.
- **Files Inspected**: [src/pages/grocery/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/grocery/index.tsx), [src/views/homePage/HomeCategories.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeCategories.tsx)
- **Logic Changes**: None (inspection only). Found that `<HomeCategories />` (which displays "Shop By Category") is omitted from `src/pages/grocery/index.tsx`.
- **Pending Tasks**: Completed.

## [2026-07-31] - Added "Shop by Category" to Grocery Page
- **Feature**: Rendered `HomeCategories` ("Shop by Category") section on `/grocery`.
- **Files Modified**: [src/pages/grocery/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/grocery/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Imported `HomeCategories` and added `<HomeCategories initialCategories={initialCategories} moduleType="grocery" />` inside `src/pages/grocery/index.tsx`.
- **Pending Tasks**: None.
## [2026-07-31] - Repositioned "Shop by Category" on Grocery Page
- **Feature**: Moved `<HomeCategories />` section right before `<HomeBrands />` ("Featured Brands") on `/grocery`.
- **Files Modified**: [src/pages/grocery/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/grocery/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Reordered components so top banners (`HomeTopSlider`) display first, followed by `HomeCategories`, then `HomeBrands` ("Featured Brands").

## [2026-07-31] - Passed business_type in "See All" Categories Link
- **Feature**: Added `business_type` query parameter to "See All" link in `HomeCategories` and updated `/categories` page to consume it.
- **Files Modified**: [src/views/homePage/HomeCategories.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeCategories.tsx), [src/pages/categories/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Updated "See All" `Link` in `HomeCategories` to append `business_type=${effectiveModule}`. Updated `/categories` page `useInfiniteData` and `getServerSideProps` to filter categories by `business_type`.
- **Pending Tasks**: None.

## [2026-07-31] - Passed business_type in CategoryCard Click Links
- **Feature**: Updated `CategoryCard` to automatically append `business_type` to category links when clicked.
- **Files Modified**: [src/components/Cards/CategoryCard.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Cards/CategoryCard.tsx), [src/views/homePage/HomeCategories.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeCategories.tsx), [src/pages/categories/[slug]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/[slug]/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: In `CategoryCard`, dynamically resolved `businessType` from props, `router.query.business_type`, or Redux `activeModule` and appended `business_type` to the destination URL. Updated `src/pages/categories/[slug]/index.tsx` to prioritize `router.query.business_type`.
- **Pending Tasks**: None.

## [2026-07-31] - Passed business_type in Subcategories API Calls
- **Feature**: Added `business_type` parameter to subcategory fetching API calls.
- **Files Modified**: [src/components/Functional/SubcategoryTabs.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategoryTabs.tsx), [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [src/components/Functional/SubcategoryTabsMobile.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategoryTabsMobile.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Passed `business_type` in `extraParams` and `dataKey` for `useInfiniteData` in `SubcategoryTabs`, `SubcategorySidebar`, and `SubcategoryTabsMobile`. API call `/api/categories?slug=...&scope_category_slug=...` now includes `business_type=grocery`.

## [2026-07-31] - Audited & Verified Multi-Module (Courier, Restaurant, Grocery) business_type Resolution
- **Feature**: Ensured robust handling for all 3 modules (`grocery`, `restaurant`, `courier`).
- **Files Modified**: [src/pages/categories/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `activeModule` fallback to `src/pages/categories/index.tsx` so `business_type` evaluates in priority: explicit `moduleType` prop -> `router.query.business_type` -> Redux `activeModule`.
- **Pending Tasks**: None.

## [2026-07-31] - Category Products Page UI Layout Update (Filter & Categories Swapped)
- **Feature**: Placed Categories/Subcategories in the left sidebar and moved ProductFilter (Search, Sort, Filter Drawer button) to the top bar.
- **Files Modified**: [src/components/Products/ProductFilter/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Products/ProductFilter/index.tsx), [src/pages/categories/[slug]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/[slug]/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Updated `ProductFilter` to support `layout="top"` horizontal bar format. Rendered `ProductFilter` at top and `SubcategorySidebar` on the left sidebar in `src/pages/categories/[slug]/index.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - SubcategorySidebar UI Compact Update
- **Feature**: Reduced `SubcategorySidebar` width to `w-56` and replaced "All Products" text button with an icon card.
- **Files Modified**: [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Changed `SubcategorySidebar` width from `w-72` to `w-56`. Replaced text `{t("all_products")}` button with a clean `<Grid3X3 size={20} />` icon card.
- **Pending Tasks**: None.

## [2026-07-31] - SubcategorySidebar Compact Width Update (w-44)
- **Feature**: Reduced `SubcategorySidebar` container width from `w-56` to `w-44` (176px).
- **Files Modified**: [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Set sidebar container width to `w-44` and adjusted padding/item elements (`w-8 h-8` image/icon wrapper) to fit snuggly without unused horizontal space.
- **Pending Tasks**: None.

## [2026-07-31] - SubcategorySidebar Ultra-Compact Update (w-36 & Auto Height)
- **Feature**: Reduced `SubcategorySidebar` width to `w-36` (144px) and set height to `h-auto max-h-[75vh]`.
- **Files Modified**: [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Set container width to `w-36` and changed fixed `h-[75vh]` to `h-auto max-h-[75vh]`, eliminating empty dark vertical space under items and making the sidebar ultra-compact.
- **Pending Tasks**: None.

## [2026-07-31] - SubcategorySidebar Vertical Strip Redesign (Matching Image 2)
- **Feature**: Redesigned `SubcategorySidebar` as a vertical strip (`w-24 min-w-24`, `h-[75vh]`) with centered category images on top and title labels underneath.
- **Files Modified**: [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Restructured items into vertical column alignment: centered `w-14 h-14 rounded-2xl` image box on top, `text-[11px]` line-clamp-2 text below, active green/primary right-edge indicator bar (`absolute right-0 top-2 bottom-2 w-1 bg-primary-500 rounded-l-full`), and restored `h-[75vh]` sidebar height.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Filter Bar Layout Update
- **Feature**: Updated mobile filter bar layout to place the search bar on its own full-width line (`w-full`), moving Filters and Sort controls to line 2.
- **Files Modified**: [src/components/Products/ProductFilter/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Products/ProductFilter/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Separated single 3-item row into two rows on mobile screens (`md:hidden`): Line 1 renders `<Input className="w-full" />` and Line 2 renders `Filters` button badge and `Sort` dropdown.
- **Pending Tasks**: None.

## [2026-07-31] - Search Input Background Contrast Fix
- **Feature**: Fixed dark mode visibility for search inputs across mobile and desktop layouts.
- **Files Modified**: [src/components/Products/ProductFilter/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Products/ProductFilter/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Replaced `bg-black` class on inputWrapper with `bg-content1 dark:bg-content1 border border-gray-200 dark:border-default-200 shadow-xs`, giving the input box clear background contrast and visible borders in dark mode.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Left Subcategory Sidebar Enablement
- **Feature**: Enabled vertical left subcategory sidebar on mobile view, removing top horizontal subcategory tabs.
- **Files Modified**: [src/components/Functional/SubcategorySidebar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/SubcategorySidebar.tsx), [src/pages/categories/[slug]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/[slug]/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Replaced `hidden md:block` on `SubcategorySidebar` with responsive `block w-20 md:w-24`, removed `SubcategoryTabsMobile`, and updated layout flex direction to `flex-row` across all screen sizes.
- **Pending Tasks**: None.

## [2026-07-31] - Conditional Footer Rendering (Landing Page Only)
- **Feature**: Restricted Footer visibility strictly to the main landing page (`/`).
- **Files Modified**: [src/layouts/default.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/layouts/default.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `const isLandingPage = router.pathname === "/";` condition in `src/layouts/default.tsx` and wrapped `<Footer />` rendering as `{isLandingPage && <Footer />}`.
- **Pending Tasks**: None.

## [2026-07-31] - Module Switcher Buttons Relocation to Header
- **Feature**: Commented out the 3 module cards in `HomeHero.tsx` and added 3 pill buttons (Grocery, Restaurant, Courier with image + name + active highlight border) to the top right Navbar before the language switcher.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Commented out module buttons container in `HomeHero.tsx`. Rendered 3 interactive module buttons in `navbar.tsx` right before `LanguageSwitcher`, displaying image & name with a white highlight border (`border-2 border-white bg-white/25`) when active.
- **Pending Tasks**: None.

## [2026-07-31] - Hidden HomeModuleCards Section on Landing Page
- **Feature**: Commented out `HomeModuleCards` section on the landing page (`src/pages/index.tsx`).
- **Files Modified**: [src/pages/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Wrapped `<HomeModuleCards />` in JSX comment `{/* <HomeModuleCards /> */}` in `src/pages/index.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Hidden ModuleSwitcherHero Cards Container
- **Feature**: Commented out the 3 module cards container inside `ModuleSwitcherHero.tsx` (the 3 cards at the bottom of the hero banner on `/grocery`, `/restaurant`, and `/courier` pages) and adjusted hero section padding/height.
- **Files Modified**: [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Commented out lines 255-301 in `ModuleSwitcherHero.tsx` containing the 3 module cards (Grocery, Restaurant, Courier) and updated hero banner height to `min-h-[380px] md:min-h-[420px]` with `pb-12 md:pb-16` padding.
- **Pending Tasks**: None.

## [2026-07-31] - Left Hero Image Position & Navbar Label Fallback Fix
- **Feature**: Fixed left side grocery basket image visibility in `ModuleSwitcherHero.tsx` and navbar module translation label fallback.
- **Files Modified**: [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Adjusted left grocery basket position from `top-[351px]` to `top-[60px] md:top-[80px]` so it floats cleanly inside the hero banner on `/grocery`. Fixed fallback in `navbar.tsx` so `nav.courier` falls back to `"Courier"`.
- **Pending Tasks**: None.

## [2026-07-31] - Reduced HomeHero Height on Landing Page
- **Feature**: Reduced vertical padding and image container dimensions of `HomeHero.tsx` on the main landing page to match the compact height of the module hero sections.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Changed container padding from `pt-32 pb-16 lg:pt-40 lg:pb-24` to `pt-24 pb-8 lg:pt-28 lg:pb-10`, reduced title font size to `text-3xl sm:text-4xl lg:text-5xl`, reduced paragraph margin to `mb-4`, and set right image dimensions to `w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px]`.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile View Module Switcher & Hero Clearance Fix
- **Feature**: Enabled the 3 module buttons on mobile view in the navbar header strip and adjusted hero top padding to eliminate text overlap with mobile location/search controls.
- **Files Modified**: [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Rendered the 3 module buttons (Grocery, Restaurant, Courier) in the mobile header section of `navbar.tsx`. Set `pt-[150px]` on mobile for `HomeHero.tsx` and `ModuleSwitcherHero.tsx` so hero titles sit cleanly below the location selector without any overlap.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Element Ordering (Address Bar -> Modules -> Text -> Image)
- **Feature**: Reordered mobile header elements strictly according to user directive: 1. Address Bar, 2. Three Module Buttons, 3. Hero Text, 4. Hero Image.
- **Files Modified**: [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: In `navbar.tsx` mobile section, placed `<LocationSelector />` (Address Bar) first and 3 Module Buttons second. Increased hero top padding to `pt-[210px]` on mobile so the hero title and subtitle display cleanly right below the 3 module buttons without any overlap, followed by the hero image.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Layout Spacing & Module Buttons Relocation (After Text)
- **Feature**: Embedded 3 module buttons (Grocery, Restaurant, Courier) directly inside `HomeHero.tsx` and `ModuleSwitcherHero.tsx` after the hero subtitle on mobile view, eliminating cramped sticky header spacing.
- **Files Modified**: [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Removed module buttons from absolute mobile navbar. Embedded 3 pill buttons right after the subtitle paragraph (`flex md:hidden items-center justify-center gap-2 my-4`) inside `HomeHero.tsx` and `ModuleSwitcherHero.tsx`, resetting top padding to `pt-[140px]` on mobile.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Top Padding Fix (pt-[220px]) for Address Bar Clearance
- **Feature**: Increased top padding on mobile for `HomeHero.tsx` and `ModuleSwitcherHero.tsx` to `pt-[220px]` so the title text starts completely below the mobile address bar with clear breathing room.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Increased mobile top padding from `pt-[140px]` to `pt-[220px]` in both `HomeHero.tsx` and `ModuleSwitcherHero.tsx`, compensating for the `mt-[-70px]` negative margin offset and the absolute mobile header height.
- **Pending Tasks**: None.

## [2026-07-31] - Animated 3-Module Hero Image Switcher Implementation
- **Feature**: Implemented dynamic, animated 3-module image and text rotator in `HomeHero.tsx` using Framer Motion (`AnimatePresence`).
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Configured module data for Grocery (`/assets/fresh-produce-groceries-reusable-shopping-bag 1.png`), Restaurant (`/assets/restaurant-hero-plate.png`), and Courier (`/assets/courier-hero.png`). Added auto-rotation timer (4.5s) and synced manual module button selection. Wrapped title/subtitle text and hero image in `AnimatePresence mode="wait"` with smooth fade, scale, and y-axis slide transitions. Only 1 module image is rendered at a time.
- **Pending Tasks**: None.

## [2026-07-31] - Centered Animated Hero Image Alignment
- **Feature**: Centered the animated hero image container horizontally and vertically in `HomeHero.tsx`.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Replaced `lg:justify-end` alignment with `justify-center items-center mx-auto` across the outer wrapper, motion wrapper, and image container in `HomeHero.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Restored HomeModuleCards Section on Landing Page
- **Feature**: Re-enabled `<HomeModuleCards />` ("WHAT WE DELIVER - Three Services, One Promise") on the landing page (`src/pages/index.tsx`).
- **Files Modified**: [src/pages/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Uncommented `<HomeModuleCards />` in `src/pages/index.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Restored Image 1 Style Big White Module Buttons with Animation
- **Feature**: Replaced small outline pill buttons with Image 1 style big white module buttons (with 3D icon, bold title, and colored arrow badge) in `HomeHero.tsx` and `ModuleSwitcherHero.tsx`.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Updated buttons to white pill container (`bg-white rounded-full`), left 3D icon circle, bold module label, and right colored arrow badge (`bg-[#84cc16]`, `bg-[#f97316]`, `bg-[#a855f7]`). Preserved active selection animation and text/image transition.
- **Pending Tasks**: None.

## [2026-07-31] - Hidden Top Navbar Module Buttons on Landing Page
- **Feature**: Hidden the 3 top navbar outline module buttons specifically on the landing page (`router.pathname === "/"`).
- **Files Modified**: [src/components/navbar.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/navbar.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Wrapped the top desktop navbar module buttons with `{router.pathname !== "/" && (...)}`, removing them from the header on `/` while preserving them on other pages.
- **Pending Tasks**: None.

## [2026-07-31] - Increased HomeHero Height & Refined Spacing
- **Feature**: Increased vertical padding and image container dimensions in `HomeHero.tsx` to give the landing page hero banner a taller, spacious presentation on desktop.
- **Files Modified**: [src/views/homePage/HomeHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/HomeHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Increased container padding to `md:pt-36 lg:pt-40 pb-12 lg:pb-16`, increased subtitle bottom margin to `mb-4 sm:mb-6`, button margin to `my-4 sm:my-6`, and hero image container size to `lg:w-[420px] lg:h-[420px]`.
- **Pending Tasks**: None.

## [2026-07-31] - Section Title Update (Recommended for You)
- **Feature**: Replaced section title `"Discover Restaurants"` with `"Recommended for You"` in `src/pages/restaurant/index.tsx`.
- **Files Modified**: [src/pages/restaurant/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/restaurant/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Passed `title="Recommended for You"` to `<RestaurantList />` in `src/pages/restaurant/index.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Wishlist Icon Update (Bookmark -> Heart Icon)
- **Feature**: Replaced Bookmark icon (`Bookmark`) with Heart icon (`Heart` from `lucide-react`) on Product Cards and Product Detail view.
- **Files Modified**: [src/components/Cards/ProductCard.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Cards/ProductCard.tsx), [src/views/restaurant/RestaurantItemDetail/RestaurantItemDetailSection.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantItemDetail/RestaurantItemDetailSection.tsx), [src/views/restaurant/RestaurantItemDetail/RestaurantProductModal.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantItemDetail/RestaurantProductModal.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Replaced `Bookmark` imports and components with `Heart` in `ProductCard`, `RestaurantItemDetailSection`, and `RestaurantProductModal`. Configured filled red heart (`fill-red-500 text-red-500`) when item is favorited/wishlisted, preserving all click handlers and wishlist logic.
- **Pending Tasks**: None.

## [2026-07-31] - Added Heart Wishlist Button to Grocery Product Detail Page
- **Feature**: Added the Heart icon wishlist button next to the Share button on the grocery/general product detail page (`ProductDetailSection.tsx`).
- **Files Modified**: [src/components/Products/ProductDetailPage/ProductDetailSection.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Products/ProductDetailPage/ProductDetailSection.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `WishlistModal` and `Heart` icon integration to `ProductDetailSection.tsx`. Rendered Heart icon button right next to Share button in header action container, with full wishlist modal and login validation support.
- **Pending Tasks**: None.

## [2026-07-31] - Integrated Store-Wise Search API on Restaurant Detail Page
- **Feature**: Connected the search bar on the restaurant detail page to `/api/products/store-wise` (`getStoreWiseProducts`).
- **Files Modified**: [src/routes/api.ts](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/routes/api.ts), [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `getStoreWiseProducts` API helper targeting `/products/store-wise` with parameters `store_slug`, `store_id`, `per_page`, `page`, `latitude`, `longitude`, and `search`. Updated `useSWR` call in `RestaurantDetail.tsx` to pass `searchQuery` dynamically to `/products/store-wise`.
- **Pending Tasks**: None.

## [2026-07-31] - Commented Out Notifications Tab
- **Feature**: Commented out the "Notifications" tab in the top navbar profile dropdown and the user account sidebar.
- **Files Modified**: [src/components/ProfileBtn.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/ProfileBtn.tsx), [src/layouts/UserLayout.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/layouts/UserLayout.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Commented out the `/my-account/notifications` menu item entries in `ProfileBtn.tsx` and `UserLayout.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Updated Veg/Non-Veg Filter Label (BOTH -> ALL)
- **Feature**: Changed filter label text from `"BOTH"` to `"ALL"` on the restaurant detail page.
- **Files Modified**: [src/views/restaurant/RestaurantDetail/RestaurantHeader.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantHeader.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Replaced `{t("both") || "Both"}` with `{t("all") || "All"}` in `RestaurantHeader.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Stripped Plus Codes from Location Address Display
- **Feature**: Automatically stripped Google Plus Codes (e.g. `6MR8+QQV, `) from address strings in the location selector modal and address cookies.
- **Files Modified**: [src/helpers/functionalHelpers.ts](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/helpers/functionalHelpers.ts), [src/components/Location/LocationSelector.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Location/LocationSelector.tsx), [src/components/Location/LocationAutoComplete.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Location/LocationAutoComplete.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `cleanAddress` regex helper (`/^[A-Za-z0-9]{2,8}\+[A-Za-z0-9]{2,4}(,\s*|\s+)/`) to strip Plus Code prefixes. Applied `cleanAddress` across location selection, autocomplete predictions, current location geocoding, cookie storage, and navbar display.
- **Pending Tasks**: None.

## [2026-07-31] - Commented Out Transactions Tab
- **Feature**: Commented out the "Transactions" tab in the top navbar profile dropdown and the user account sidebar.
- **Files Modified**: [src/components/ProfileBtn.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/ProfileBtn.tsx), [src/layouts/UserLayout.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/layouts/UserLayout.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Commented out the `/my-account/transactions` menu item entries in `ProfileBtn.tsx` and `UserLayout.tsx`.
- **Pending Tasks**: None.

## [2026-07-31] - Conditional Transaction ID Display in Payment Details
- **Feature**: Added conditional display for `Transaction ID` in the Payment Details container on order and courier booking details pages.
- **Files Modified**: [src/types/ApiResponse/index.ts](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/types/ApiResponse/index.ts), [src/views/OrderDetailView/PaymentInfo.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/OrderDetailView/PaymentInfo.tsx), [src/pages/my-account/bookings/[id]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/my-account/bookings/[id]/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `transaction_id` and `transactionId` to `Order` interface. Updated `PaymentInfo.tsx` and courier booking details page to evaluate transaction ID from properties (`transaction_id`, `transactionId`, `payment_transaction_id`, `payment_response`, etc.). Renders the `Transaction ID` row strictly when a non-empty transaction ID string exists, and hides it when empty/absent.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Floating Category Menu Implementation
- **Feature**: Replaced horizontal scrollable category pills on mobile view with a sleek floating `[ 🍴 Menu ]` button and category list popover.
- **Files Modified**: [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Added `hidden md:flex` to the horizontal category pills row to hide it on mobile. Added state `isMobileMenuOpen` and floating button `[ 🍴 Menu ]` at bottom right (`md:hidden fixed bottom-6 right-4 z-50`) with Framer Motion backdrop overlay and popover card matching Image 3, listing all menu categories with item counts `(count)`.
- **Pending Tasks**: None.

## [2026-07-31] - Mobile Floating Menu Button Position Adjustment (Prevent Overlap)
- **Feature**: Positioned floating `[ 🍴 Menu ]` button higher at `bottom-20` on mobile view to avoid overlap with the Scroll-to-Top button.
- **Files Modified**: [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Changed container positioning from `fixed bottom-6 right-4` to `fixed bottom-20 right-4` on mobile (`md:hidden`), placing the `[ 🍴 Menu ]` button cleanly above the Scroll-to-Top button (`bottom-6`) with zero visual overlap.
- **Pending Tasks**: None.

## [2026-07-31] - Glassmorphism Styling for Mobile Category Menu & Button
- **Feature**: Applied glassmorphism backdrop blur and translucent border styling to the floating mobile category menu card and button.
- **Files Modified**: [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Applied `bg-[#141821]/80 backdrop-blur-xl border border-white/15 shadow-2xl ring-1 ring-black/20` to the popover card and `divide-y divide-white/10` to category dividers. Applied `bg-[#019CBF]/85 backdrop-blur-md border border-white/25 shadow-cyan-500/35` to the floating Menu button.
- **Pending Tasks**: None.

## [2026-07-31] - ScrollToTop Button Translate Height Fix (Zero Overlap)
- **Feature**: Fixed ScrollToTop button scroll-up animation translate height to `-translate-y-28` on mobile so it floats high above the stationary `[ 🍴 Menu ]` button (`bottom-6`).
- **Files Modified**: [src/components/Functional/ScrollToTopButton.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/ScrollToTopButton.tsx), [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Anchored `[ 🍴 Menu ]` button to `bottom-6` (24px) and updated `ScrollToTopButton` scroll-up translation to `-translate-y-28` (136px from bottom on mobile). The ArrowUp button slides up into a high position (136px) leaving a 68px gap above `[ 🍴 Menu ]`, guaranteeing zero overlap under any scroll condition.
- **Pending Tasks**: None.

## [2026-07-31] - 3-Tier Mobile Bottom Navigation & Action Stack Fix
- **Feature**: Positioned Menu button at `bottom-20` (80px) and Scroll-To-Top button at `-translate-y-36` (168px) on mobile so neither button is covered by the Mobile Bottom Navigation Bar (`Home`, `Categories`, `Cart`, `Stores`, `Profile`).
- **Files Modified**: [src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/restaurant/RestaurantDetail/RestaurantDetail.tsx), [src/components/Functional/ScrollToTopButton.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/ScrollToTopButton.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: Established clean 3-tier vertical stack on mobile:
  - **Tier 1 (0px - 60px)**: Mobile Bottom Navigation Bar
  - **Tier 2 (80px / bottom-20)**: `[ 🍴 Menu ]` floating button
  - **Tier 3 (168px / -translate-y-36)**: `ScrollToTopButton` Arrow Up circle when scrolling UP
  All elements sit with clear vertical breathing room, avoiding coverage by the bottom navigation bar and preventing button overlap.
- **Pending Tasks**: None.

## [2026-08-03] - Category Switching Product Duplication & Direct API Fetching Fix
- **Feature**: Replaced SWR caching layer in `useInfiniteData` with clean, direct API fetching on category/filter change and fixed CategoryProductsPage render logic.
- **Files Modified**: [src/hooks/useInfiniteData.ts](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/hooks/useInfiniteData.ts), [src/pages/categories/[slug]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/categories/[slug]/index.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Whenever category or filters change (`keyString`), previous category data is immediately wiped (`setData([])`, `setTotal(0)`, `setIsLoading(true)` synchronously).
  - Fixed `CategoryProductsPage` grid render condition (`isLoading ? SKELETONS : products.map(...)`) so old products are NEVER rendered above skeletons while a new category is loading.
  - In-flight request cancellation guard discards responses if category changes mid-fetch.
  - Multi-store deduplication (`getItemKey`) preserves products from different stores (e.g. Pani Puri from "Tasty Bites" and "Spicy Food") while preventing true duplicates.
- **Pending Tasks**: None.

## [2026-08-03] - Dedicated Delivery OTP Row Layout
- **Feature**: Positioned Delivery OTP in a dedicated row right after the `Est. Delivery` & payment method section on order cards.
- **Files Modified**: [src/components/Cards/OrderCard.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Cards/OrderCard.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Removed top header OTP badge to prevent overlap with download button and order status chip.
  - Added a clean dedicated row right after `Est. Delivery` and payment method (`cod`/card) with a key icon, "Delivery OTP" label, and a styled warning pill badge displaying the OTP value (`645361`).
- **Pending Tasks**: None.

## [2026-08-03] - Courier Order Prefix ID Support
- **Feature**: Displayed `order_prefix_id` (e.g. `PAR-184`) instead of plain ID `#184` across all courier pages, cards, and modals.
- **Files Modified**: [src/types/ApiResponse/index.ts](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/types/ApiResponse/index.ts), [src/pages/my-account/couriers/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/my-account/couriers/index.tsx), [src/pages/my-account/bookings/[id]/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/my-account/bookings/[id]/index.tsx), [src/components/Modals/TrackCourierModal.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Modals/TrackCourierModal.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Added `order_prefix_id?: string | null` field to `CourierRequest` interface.
  - Updated Courier card title (`Courier: PAR-184`), Courier Booking detail page breadcrumbs/heading (`Courier Booking PAR-184`), and live tracking modal (`Track Order PAR-184`) to display `booking.order_prefix_id` with fallback to `#${booking.id}`.
- **Pending Tasks**: None.

## [2026-08-04] - Mobile Module Switcher Conditional UI Styling
- **Feature**: Rendered white pill buttons with colored arrows (Image 1 style) strictly on the landing page (`/`), while preserving translucent outlined pills (Image 2 style) on module pages (`/grocery`, `/restaurant`, `/courier`) for mobile view.
- **Files Modified**: [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Added route check (`router.pathname === "/"`) to render Image 1 white pills with colored circle arrows on the main landing page, while preserving Image 2 translucent pill buttons on `/grocery`, `/restaurant`, and `/courier` pages in mobile view.
- **Pending Tasks**: None.

## [2026-08-04] - Hero Header & Content Section Gap Removal (Mobile View)
- **Feature**: Removed large 80px white gap between cyan Hero header banner and category/content section on mobile view.
- **Files Modified**: [src/pages/grocery/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/grocery/index.tsx), [src/pages/restaurant/index.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/pages/restaurant/index.tsx), [src/views/homePage/ModuleSwitcherHero.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/views/homePage/ModuleSwitcherHero.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Replaced hardcoded `mt-20` (80px margin) on main page wrapper in `grocery/index.tsx` and `restaurant/index.tsx` with responsive `mt-3 md:mt-6`.
  - Adjusted hero container bottom padding in `ModuleSwitcherHero.tsx` to `pb-4 sm:pb-8 md:pb-16` on mobile to seamlessly position the category icons row right beneath the hero banner.
- **Pending Tasks**: None.

## [2026-08-04] - Landing Page Mobile Bottom Navigation Bar Hiding
- **Feature**: Hidden mobile bottom navigation bar (`Home`, `Categories`, `Cart`, `Stores`, `Profile`) strictly on the main landing page (`/`).
- **Files Modified**: [src/components/Functional/BottomNavigation.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/components/Functional/BottomNavigation.tsx), [src/layouts/default.tsx](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/src/layouts/default.tsx), [PROJECT_HISTORY.md](file:///Users/infinitieparasgiri/Desktop/Nextjs-projcts/Hyperlocal-Yashwantarao-Customization-Web/PROJECT_HISTORY.md)
- **Logic Changes**: 
  - Added early `router.pathname === "/"` check in `BottomNavigation.tsx` and updated layout condition `{!isLandingPage && <BottomNavigation />}` in `src/layouts/default.tsx`.
  - The bottom bar is completely hidden on the main landing page (`/`), while remaining 100% visible and functional across all other pages (`/grocery`, `/restaurant`, `/courier`, `/categories`, etc.).
- **Pending Tasks**: None.




















































