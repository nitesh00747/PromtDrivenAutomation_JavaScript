# Saucedemo Shopping Flow Positive-Path Test Plan

## Application Overview

This plan covers the core shopping flow of Swag Labs (https://www.saucedemo.com/) beyond login and the basic inventory listing (that coverage already exists in specs/login-and-inventory.plan.md and must not be duplicated). Every scenario below starts from the already-logged-in state produced by `tests/seed.spec.ts` (standard_user, landed on /inventory.html with an empty cart). This plan is exclusively positive / happy-path coverage of: cart add/remove, the cart page, the full checkout flow, product sorting, the product detail page, logout, and Reset App State.

Confirmed selectors and structure (verified via live DOM inspection on 2026-10-03):

- **Cart icon/link**: `[data-test="shopping-cart-link"]`. Its accessible name is "Cart, empty" when there are no items, or "Cart, N items" when there are N items.
- **Cart badge**: `[data-test="shopping-cart-badge"]` — a `span` containing the numeric count. IMPORTANT: this element does not exist in the DOM at all when the cart is empty (it isn't just hidden/zero) — only assert its presence/text when the cart is non-empty, and assert its absence (or the "Cart, empty" accessible name) when empty.
- **Inventory page "Add to cart" buttons**: `[data-test="add-to-cart-<product-slug>"]`, e.g. `add-to-cart-sauce-labs-backpack`, `add-to-cart-sauce-labs-bike-light`, `add-to-cart-sauce-labs-bolt-t-shirt`, `add-to-cart-sauce-labs-fleece-jacket`, `add-to-cart-sauce-labs-onesie`, `add-to-cart-test.allthethings()-t-shirt-(red)`. Visible text is "Add to cart".
- **Inventory page "Remove" buttons** (shown in place of "Add to cart" once an item is in the cart): `[data-test="remove-<product-slug>"]`, visible text "Remove". Clicking it removes just that item and decrements the badge (or removes the badge entirely if it was the last item).
- **Cart page** (`/cart.html`, header text "Your Cart"): each line item is inside a `.cart_item` container containing: quantity (`[data-test="item-quantity"]`, plain number e.g. "1"), product name link (`[data-test="item-<id>-title-link"]`, e.g. id 4 = Sauce Labs Backpack), description, price (`.inventory_item_price`, e.g. "$29.99"), and a "Remove" button (`[data-test="remove-<product-slug>"]`). Two buttons below the list: "Continue Shopping" (`[data-test="continue-shopping"]`, navigates back to /inventory.html) and "Checkout" (`[data-test="checkout"]`, navigates to /checkout-step-one.html).
- **Checkout Step One** (`/checkout-step-one.html`, header "Checkout: Your Information"): a form with First Name (`[data-test="firstName"]`), Last Name (`[data-test="lastName"]`), Zip/Postal Code (`[data-test="postalCode"]`) text fields, and "Cancel" (`[data-test="cancel"]`) / "Continue" (`[data-test="continue"]`, navigates to /checkout-step-two.html) buttons.
- **Checkout Overview** (`/checkout-step-two.html`, header "Checkout: Overview"): same `.cart_item` line-item structure as the cart page but WITHOUT a Remove button. Below the items: `[data-test="payment-info-label"]`/`[data-test="payment-info-value"]` = "SauceCard #31337", `[data-test="shipping-info-label"]`/`[data-test="shipping-info-value"]` = "Free Pony Express Delivery!", `[data-test="subtotal-label"]` = "Item total: $X.XX" (sum of item prices), `[data-test="tax-label"]` = "Tax: $X.XX" (8% of item total, rounded to 2 decimals), `[data-test="total-label"]` = "Total: $X.XX" (item total + tax). Buttons: "Cancel" (`[data-test="cancel"]`) and "Finish" (`[data-test="finish"]`, navigates to /checkout-complete.html and empties the cart).
- **Checkout Complete** (`/checkout-complete.html`, header "Checkout: Complete!"): `[data-test="complete-header"]` = "Thank you for your order!", `[data-test="complete-text"]` = "Your order has been dispatched, and will arrive just as fast as the pony can get there!", a pony express image, and a "Back Home" button (`[data-test="back-to-products"]`) that navigates back to /inventory.html. (The live app also shows a "Generate PDF order" button here; it is out of scope for this plan.)
- **Sort dropdown** on the inventory page: `[data-test="product-sort-container"]`, accessible name "Sort products", a native `<select>` whose options are: "Name (A to Z)" (value `az`, selected by default), "Name (Z to A)" (value `za`), "Price (low to high)" (value `lohi`), "Price (high to low)" (value `hilo`). Confirmed live orderings: default A-Z = Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt (Red); Z-A is the exact reverse; low-to-high by price = Onesie $7.99, Bike Light $9.99, Bolt T-Shirt $15.99, Test.allTheThings() T-Shirt (Red) $15.99, Backpack $29.99, Fleece Jacket $49.99 (equal-priced items keep their A-Z relative order); high-to-low is the exact reverse of low-to-high.
- **Product detail page** (`/inventory-item.html?id=<id>`), reached by clicking a product's name link or its image on the inventory page (both share the accessible name "View details for <Product Name>"): shows the same image, name, description and price as the inventory card, plus an "Add to cart" button (`[data-test="add-to-cart"]` — this data-test value is generic/not slug-specific on this page, and becomes `[data-test="remove"]` / text "Remove" once clicked) and a "Back to products" button (`[data-test="back-to-products"]`) that returns to /inventory.html. NOTE: the `back-to-products` data-test value is reused by the Checkout Complete page's "Back Home" button — tests must scope assertions by the current page/URL.
- **Burger/hamburger menu**: opened via `#react-burger-menu-btn` (accessible name "Open Menu"), closed via `#react-burger-cross-btn` (accessible name "Close Menu"). Menu items: "All Items" (`[data-test="inventory-sidebar-link"]`), "Dynamic Catalog" (out of scope for this plan), "About" (external link to saucelabs.com, out of scope), "Logout" (`[data-test="logout-sidebar-link"]`), "Reset App State" (`[data-test="reset-sidebar-link"]`).
- **Logout**: clicking "Logout" in the menu navigates to the login page ('/') and clears the session. Confirmed live: navigating directly to /inventory.html afterwards redirects back to '/' instead of showing the inventory page, proving the session was cleared.
- **Reset App State** — IMPORTANT confirmed quirk: clicking it immediately clears the cart badge, and the cart's actual contents are cleared too (confirmed by navigating to /cart.html afterwards, which shows an empty list) — BUT on the inventory page itself, any product buttons that were already rendered as "Remove" do NOT visually revert to "Add to cart" until the page is reloaded or re-navigated to. Tests must: (a) assert the badge disappears immediately after clicking Reset App State, and (b) reload/re-navigate to /inventory.html before asserting that the buttons read "Add to cart" again.

## Test Scenarios

### 1. Cart - Inventory Page Interactions

**Seed:** `tests/seed.spec.ts`

#### 1.1. Adding a single item updates the cart badge and button

**File:** `tests/cart/cart-inventory-add-remove.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: The cart icon has accessible name 'Cart, empty' and no badge element is present
  2. Click the 'Add to cart' button for 'Sauce Labs Backpack' (data-test=add-to-cart-sauce-labs-backpack)
    - expect: The button's visible text changes to 'Remove' (data-test becomes remove-sauce-labs-backpack)
    - expect: The cart badge (data-test=shopping-cart-badge) appears and shows '1'
    - expect: The cart icon's accessible name becomes 'Cart, 1 items'

#### 1.2. Adding multiple items increments the badge correctly

**File:** `tests/cart/cart-inventory-add-remove.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state with an empty cart
    - expect: Cart icon shows 'Cart, empty'
  2. Click 'Add to cart' for 'Sauce Labs Backpack'
    - expect: Badge shows '1'
    - expect: Backpack button now reads 'Remove'
  3. Click 'Add to cart' for 'Sauce Labs Bike Light' (data-test=add-to-cart-sauce-labs-bike-light)
    - expect: Badge updates to show '2'
    - expect: Bike Light button now reads 'Remove'
    - expect: Backpack button still reads 'Remove'
  4. Click 'Add to cart' for 'Sauce Labs Bolt T-Shirt'
    - expect: Badge updates to show '3'
    - expect: All three buttons now read 'Remove'

#### 1.3. Removing an item via its inventory page Remove button decrements the badge and reverts the button

**File:** `tests/cart/cart-inventory-add-remove.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state and add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart
    - expect: Badge shows '2'
  2. Click the 'Remove' button for 'Sauce Labs Bike Light' (data-test=remove-sauce-labs-bike-light)
    - expect: Badge decrements to show '1'
    - expect: Bike Light's button reverts back to 'Add to cart' (data-test=add-to-cart-sauce-labs-bike-light)
    - expect: Backpack's button still reads 'Remove'
  3. Click the 'Remove' button for 'Sauce Labs Backpack'
    - expect: Badge/cart icon reverts to accessible name 'Cart, empty' with no badge element present
    - expect: Backpack's button reverts to 'Add to cart'

### 2. Cart Page

**Seed:** `tests/seed.spec.ts`

#### 2.1. Cart page shows exactly the items added, each with correct name, price and quantity

**File:** `tests/cart/cart-page.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state and add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart from the inventory page
    - expect: Badge shows '2'
  2. Click the cart icon (data-test=shopping-cart-link) to navigate to the cart page
    - expect: Page URL is /cart.html
    - expect: Header text 'Your Cart' is visible
  3. Inspect the cart line items
    - expect: Exactly 2 line items (.cart_item) are present, no more and no fewer
    - expect: One line item shows quantity '1', name 'Sauce Labs Backpack', and price '$29.99'
    - expect: The other line item shows quantity '1', name 'Sauce Labs Bike Light', and price '$9.99'
    - expect: 'Continue Shopping' and 'Checkout' buttons are both visible below the list

#### 2.2. Removing an item from the cart page itself updates the page and the badge

**File:** `tests/cart/cart-page.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart, then navigate to the cart page
    - expect: Two line items are visible, badge shows '2'
  2. Click the 'Remove' button on the 'Sauce Labs Backpack' line item (data-test=remove-sauce-labs-backpack)
    - expect: The Backpack line item disappears from the cart page
    - expect: Only the 'Sauce Labs Bike Light' line item remains
    - expect: The cart badge updates to show '1'
  3. Click the 'Remove' button on the remaining 'Sauce Labs Bike Light' line item
    - expect: The cart list becomes empty (no .cart_item elements remain)
    - expect: The cart badge disappears entirely and the cart icon's accessible name is 'Cart, empty'
    - expect: 'Continue Shopping' and 'Checkout' buttons remain visible

### 3. Checkout Flow (End to End)

**Seed:** `tests/seed.spec.ts`

#### 3.1. Complete the checkout happy path with a single item

**File:** `tests/checkout/checkout-flow.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state, add 'Sauce Labs Backpack' ($29.99) to the cart, then navigate to the cart page
    - expect: Cart page shows 1 line item for Sauce Labs Backpack
  2. Click the 'Checkout' button
    - expect: Page URL is /checkout-step-one.html
    - expect: Header text 'Checkout: Your Information' is visible
  3. Fill First Name with 'John', Last Name with 'Doe', Zip/Postal Code with '12345', then click 'Continue'
    - expect: Page URL is /checkout-step-two.html
    - expect: Header text 'Checkout: Overview' is visible
  4. Inspect the overview page contents
    - expect: Exactly 1 line item is shown: 'Sauce Labs Backpack', quantity '1', price '$29.99'
    - expect: Payment Information value is 'SauceCard #31337'
    - expect: Shipping Information value is 'Free Pony Express Delivery!'
    - expect: Item total (subtotal-label) reads 'Item total: $29.99'
    - expect: Tax (tax-label) reads 'Tax: $2.40'
    - expect: Total (total-label) reads 'Total: $32.39' (item total + tax)
  5. Click the 'Finish' button
    - expect: Page URL is /checkout-complete.html
    - expect: Header text 'Checkout: Complete!' is visible
    - expect: Heading/text 'Thank you for your order!' is visible (data-test=complete-header)
    - expect: Confirmation text 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' is visible (data-test=complete-text)
    - expect: A 'Back Home' button is visible
  6. Click the 'Back Home' button
    - expect: Page URL is /inventory.html
    - expect: The cart icon shows accessible name 'Cart, empty' (cart was cleared by completing the order)

#### 3.2. Complete the checkout happy path with multiple items and verify correct price totals

**File:** `tests/checkout/checkout-flow.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state, add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart, then go to the cart page and click 'Checkout'
    - expect: Page URL is /checkout-step-one.html
  2. Fill First Name with 'Jane', Last Name with 'Smith', Zip/Postal Code with '54321', then click 'Continue'
    - expect: Page URL is /checkout-step-two.html
    - expect: Header text 'Checkout: Overview' is visible
  3. Inspect the overview page contents
    - expect: Exactly 2 line items are shown, one for each product with quantity '1' each and their individual prices ($29.99 and $9.99)
    - expect: Item total reads 'Item total: $39.98'
    - expect: Tax reads 'Tax: $3.20' (8% of $39.98, rounded)
    - expect: Total reads 'Total: $43.18' (item total + tax)
  4. Click the 'Finish' button
    - expect: Page URL is /checkout-complete.html
    - expect: 'Thank you for your order!' message is visible
  5. Click the 'Back Home' button
    - expect: Page URL is /inventory.html
    - expect: Cart is empty (accessible name 'Cart, empty')

### 4. Product Sorting

**Seed:** `tests/seed.spec.ts`

#### 4.1. Default sort is Name (A to Z) and can be re-selected explicitly

**File:** `tests/sorting/product-sort.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: The sort dropdown (data-test=product-sort-container) shows 'Name (A to Z)' as the selected option by default
  2. Read the product names in the order they appear on the page
    - expect: The order is exactly: Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)
  3. Explicitly select the 'Name (A to Z)' option (value 'az') from the dropdown
    - expect: The product order remains unchanged: Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt (Red)

#### 4.2. Sorting by Name (Z to A) reverses the alphabetical order

**File:** `tests/sorting/product-sort.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: Default sort is 'Name (A to Z)'
  2. Select 'Name (Z to A)' (value 'za') from the sort dropdown (data-test=product-sort-container)
    - expect: The dropdown now shows 'Name (Z to A)' selected
    - expect: The product order is exactly: Test.allTheThings() T-Shirt (Red), Sauce Labs Onesie, Sauce Labs Fleece Jacket, Sauce Labs Bolt T-Shirt, Sauce Labs Bike Light, Sauce Labs Backpack

#### 4.3. Sorting by Price (low to high) orders items ascending by price

**File:** `tests/sorting/product-sort.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: Default sort is 'Name (A to Z)'
  2. Select 'Price (low to high)' (value 'lohi') from the sort dropdown
    - expect: The dropdown now shows 'Price (low to high)' selected
    - expect: The product order is exactly: Sauce Labs Onesie ($7.99), Sauce Labs Bike Light ($9.99), Sauce Labs Bolt T-Shirt ($15.99), Test.allTheThings() T-Shirt (Red) ($15.99), Sauce Labs Backpack ($29.99), Sauce Labs Fleece Jacket ($49.99)
    - expect: Each item's displayed price is non-decreasing from top to bottom of the list

#### 4.4. Sorting by Price (high to low) orders items descending by price

**File:** `tests/sorting/product-sort.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: Default sort is 'Name (A to Z)'
  2. Select 'Price (high to low)' (value 'hilo') from the sort dropdown
    - expect: The dropdown now shows 'Price (high to low)' selected
    - expect: The product order is exactly: Sauce Labs Fleece Jacket ($49.99), Sauce Labs Backpack ($29.99), Sauce Labs Bolt T-Shirt ($15.99), Test.allTheThings() T-Shirt (Red) ($15.99), Sauce Labs Bike Light ($9.99), Sauce Labs Onesie ($7.99)
    - expect: Each item's displayed price is non-increasing from top to bottom of the list

### 5. Product Detail Page

**Seed:** `tests/seed.spec.ts`

#### 5.1. Clicking a product's name navigates to its detail page with matching content, and Back to products returns to inventory

**File:** `tests/product-detail/product-detail.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html and note the name, description and price shown on the 'Sauce Labs Backpack' inventory card
    - expect: Card shows name 'Sauce Labs Backpack', a description, and price '$29.99'
  2. Click the 'Sauce Labs Backpack' product name link (accessible name 'View details for Sauce Labs Backpack')
    - expect: Page URL matches /inventory-item.html?id=4 (or equivalent product id)
    - expect: The same product name 'Sauce Labs Backpack' is shown
    - expect: The same description text is shown
    - expect: The same price '$29.99' is shown
    - expect: The product image is visible
    - expect: An 'Add to cart' button is visible
    - expect: A 'Back to products' button is visible
  3. Click the 'Back to products' button (data-test=back-to-products)
    - expect: Page URL returns to /inventory.html
    - expect: The full 6-item inventory list is visible again

#### 5.2. Clicking a product's image navigates to its detail page, and Add to cart works from that page

**File:** `tests/product-detail/product-detail.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: Cart is empty
  2. Click the product image for 'Sauce Labs Bike Light' (accessible name 'View details for Sauce Labs Bike Light')
    - expect: Page URL matches /inventory-item.html?id=<id> for Sauce Labs Bike Light
    - expect: Name 'Sauce Labs Bike Light', description, price '$9.99', and image are shown
    - expect: An 'Add to cart' button is visible (data-test=add-to-cart)
  3. Click the 'Add to cart' button on the detail page
    - expect: The button's text changes to 'Remove'
    - expect: The cart badge appears showing '1'
  4. Click 'Back to products'
    - expect: Page URL returns to /inventory.html
    - expect: The 'Sauce Labs Bike Light' card on the inventory page also shows a 'Remove' button and the cart badge still shows '1'

### 6. Logout

**Seed:** `tests/seed.spec.ts`

#### 6.1. Logging out via the burger menu returns to the login page and clears the session

**File:** `tests/menu/logout.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html
    - expect: Page URL is /inventory.html
  2. Click the 'Open Menu' burger button (#react-burger-menu-btn) to open the side menu
    - expect: The menu is visible with 'All Items', 'Logout', and 'Reset App State' options
  3. Click 'Logout' (data-test=logout-sidebar-link)
    - expect: Page URL navigates to the login page ('/')
    - expect: The login form (Username, Password, Login button) is visible
  4. Attempt to navigate directly to /inventory.html via the browser address bar
    - expect: The app redirects back to the login page ('/') instead of showing the inventory page, confirming the session was cleared

### 7. Reset App State

**Seed:** `tests/seed.spec.ts`

#### 7.1. Reset App State clears the cart after items have been added

**File:** `tests/menu/reset-app-state.spec.ts`

**Steps:**
  1. Start from the seeded logged-in state on /inventory.html and add 'Sauce Labs Backpack' to the cart
    - expect: Cart badge shows '1' and the Backpack button reads 'Remove'
  2. Open the burger menu ('Open Menu' button) and click 'Reset App State' (data-test=reset-sidebar-link)
    - expect: The cart badge disappears immediately (cart icon's accessible name becomes 'Cart, empty')
  3. Navigate to the cart page (/cart.html)
    - expect: The cart page shows no line items (cart contents were actually cleared, not just the badge)
  4. Navigate back to /inventory.html (fresh navigation/reload)
    - expect: The 'Sauce Labs Backpack' button has reverted to 'Add to cart' (data-test=add-to-cart-sauce-labs-backpack)
    - expect: All other product buttons also read 'Add to cart'
    - expect: The cart badge remains absent
