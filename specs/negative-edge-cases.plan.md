# Negative and Edge Case Scenarios

## Application Overview

This plan provides exclusively NEGATIVE and EDGE-CASE test coverage for the Sauce Demo application (https://www.saucedemo.com/) that is NOT already covered by specs/login-and-inventory.plan.md (login credential validation, inventory listing) or specs/shopping-flow.plan.md (cart operations, happy-path checkout, sorting, product detail, logout, reset app state). This plan covers three areas confirmed via live exploration on 2026-10-03:

1. Checkout step one ("Checkout: Your Information", /checkout-step-one.html) field-level validation errors when First Name, Last Name, or Zip/Postal Code is left empty on Continue.
2. Checkout Cancel flows from both step one (/checkout-step-one.html) and step two ("Checkout: Overview", /checkout-step-two.html), including confirmed destination pages and cart-preservation behavior.
3. Route-guard behavior for all protected pages when no active login session exists, confirming redirect to the login page ('/') and the exact page-specific error message shown.

All starting states are assumed fresh (no pre-existing session/cookies) unless a step explicitly logs in via the seed pattern (tests/seed.spec.ts: fill Username 'standard_user', Password 'secret_sauce', click Login).

Key facts confirmed live during exploration (do not re-derive, use as ground truth):
- Checkout step one form fields have data-test attributes: firstName, lastName, postalCode. Buttons: data-test="continue", data-test="cancel".
- Error container markup: `<div class="error-message-container error"><h3 data-test="error" role="alert">...<button data-test="error-button" aria-label="Dismiss error">...</button>Error: &lt;message&gt;</h3></div>`. The error text is always accessed as an `alert` role element; selector `h3[data-test="error"]` (or `.error-message-container.error`) is reliable across both the checkout form and the login page.
- First Name empty -> exact error text: "Error: First Name is required". Affected input gets classes "input_error form_input error". Page stays on /checkout-step-one.html.
- Last Name empty (First Name filled) -> exact error text: "Error: Last Name is required". Page stays on /checkout-step-one.html.
- Zip/Postal Code empty (First Name and Last Name filled) -> exact error text: "Error: Postal Code is required" (note: field label reads "Zip/Postal Code" but the error message text says "Postal Code is required", not "Zip/Postal Code"). Page stays on /checkout-step-one.html.
- Validation checks the fields top-to-bottom and stops at the first empty required field (confirmed by sequentially fixing fields and re-clicking Continue, observing the next error in order).
- Clicking Cancel on /checkout-step-one.html navigates to /cart.html (NOT /inventory.html). Cart contents are preserved (item count and line items unchanged).
- Clicking Cancel on /checkout-step-two.html ("Checkout: Overview") navigates to /inventory.html (NOT /cart.html - this differs from step one's Cancel destination). Cart contents are preserved (cart badge count and item still present in cart).
- When logged out (no session) and navigating directly to any of the following protected URLs, the app redirects to '/' (login page) and displays a page-specific error message of the exact form: "Epic sadface: You can only access '&lt;path&gt;' when you are logged in." where &lt;path&gt; is the page's own pathname (confirmed NOT a generic shared message - each page names itself):
  - /inventory.html -> "Epic sadface: You can only access '/inventory.html' when you are logged in."
  - /cart.html -> "Epic sadface: You can only access '/cart.html' when you are logged in."
  - /checkout-step-one.html -> "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
  - /checkout-step-two.html -> "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."
  - /checkout-complete.html -> "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."
  - /inventory-item.html?id=4 -> "Epic sadface: You can only access '/inventory-item.html' when you are logged in." (note: the query string ?id=4 is dropped from the message; only the pathname is shown).
  This error renders in the same `h3[data-test="error"]` alert element used on the checkout form.

## Test Scenarios

### 1. Checkout Step One Validation Errors

**Seed:** `tests/seed.spec.ts`

#### 1.1. Continue with empty First Name shows required error and does not proceed

**File:** `tests/negative-edge-cases/checkout-step-one-validation.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state on /inventory.html.
    - expect: Page is on /inventory.html
  2. Click 'Add to cart' on the Sauce Labs Backpack product tile.
    - expect: Cart badge shows '1'
  3. Click the cart icon to navigate to /cart.html, then click the 'Checkout' button.
    - expect: Page navigates to /checkout-step-one.html and shows heading 'Checkout: Your Information'
  4. Leave the First Name, Last Name, and Zip/Postal Code fields all empty and click the 'Continue' button (data-test='continue').
    - expect: Page remains on /checkout-step-one.html (does not navigate to /checkout-step-two.html)
    - expect: An alert element matching selector h3[data-test='error'] appears with exact text 'Error: First Name is required'
    - expect: The First Name input (data-test='firstName') gains an error-indicating CSS class (e.g. 'input_error')

#### 1.2. Continue with First Name filled but empty Last Name shows required error and does not proceed

**File:** `tests/negative-edge-cases/checkout-step-one-validation.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state, add any product to the cart, open the cart, and click 'Checkout' to reach /checkout-step-one.html.
    - expect: Page shows 'Checkout: Your Information'
  2. Fill the First Name field (data-test='firstName') with 'John'. Leave Last Name and Zip/Postal Code empty. Click 'Continue'.
    - expect: Page remains on /checkout-step-one.html
    - expect: The error alert (h3[data-test='error']) shows exact text 'Error: Last Name is required'
    - expect: First Name field retains the value 'John'

#### 1.3. Continue with First and Last Name filled but empty Zip/Postal Code shows required error and does not proceed

**File:** `tests/negative-edge-cases/checkout-step-one-validation.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state, add any product to the cart, open the cart, and click 'Checkout' to reach /checkout-step-one.html.
    - expect: Page shows 'Checkout: Your Information'
  2. Fill First Name with 'John' and Last Name with 'Doe' (data-test='lastName'). Leave Zip/Postal Code (data-test='postalCode') empty. Click 'Continue'.
    - expect: Page remains on /checkout-step-one.html
    - expect: The error alert (h3[data-test='error']) shows exact text 'Error: Postal Code is required' (note the message says 'Postal Code', not the field's displayed label 'Zip/Postal Code')
    - expect: First Name and Last Name fields retain their entered values

#### 1.4. Filling all three required fields allows successful progression to step two

**File:** `tests/negative-edge-cases/checkout-step-one-validation.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state, add any product to the cart, open the cart, and click 'Checkout' to reach /checkout-step-one.html.
    - expect: Page shows 'Checkout: Your Information'
  2. Fill First Name 'John', Last Name 'Doe', and Zip/Postal Code '12345'. Click 'Continue'.
    - expect: Page navigates to /checkout-step-two.html showing heading 'Checkout: Overview'
    - expect: No error alert is present

### 2. Checkout Cancel Flows

**Seed:** `tests/seed.spec.ts`

#### 2.1. Cancel on checkout step one returns to the cart page with cart contents preserved

**File:** `tests/negative-edge-cases/checkout-cancel-flows.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state on /inventory.html. Add the Sauce Labs Backpack to the cart.
    - expect: Cart badge shows '1'
  2. Open the cart (/cart.html) and click 'Checkout' to reach /checkout-step-one.html.
    - expect: Page shows 'Checkout: Your Information'
  3. Without filling any fields, click the 'Cancel' button (data-test='cancel').
    - expect: Page navigates to /cart.html (NOT /checkout-step-two.html and NOT /inventory.html)
    - expect: The cart still shows 1 item: 'Sauce Labs Backpack' with its Remove button present
    - expect: Cart badge in the header still shows '1'

#### 2.2. Cancel on checkout overview (step two) returns to the inventory page with cart contents preserved

**File:** `tests/negative-edge-cases/checkout-cancel-flows.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state on /inventory.html. Add the Sauce Labs Backpack to the cart.
    - expect: Cart badge shows '1'
  2. Open the cart and click 'Checkout'. On /checkout-step-one.html, fill First Name 'John', Last Name 'Doe', Zip/Postal Code '12345', then click 'Continue'.
    - expect: Page navigates to /checkout-step-two.html showing 'Checkout: Overview' with the item total, tax, and grand total displayed
  3. Click the 'Cancel' button (data-test='cancel') on the overview page.
    - expect: Page navigates to /inventory.html (NOT back to /cart.html and NOT /checkout-step-one.html) - this is a different destination than Cancel on step one
    - expect: Cart badge in the header still shows '1'
    - expect: Navigating to /cart.html afterward confirms the 'Sauce Labs Backpack' line item is still present with its 'Remove' button

### 3. Protected Pages Require Active Login Session

**Seed:** `tests/seed.spec.ts`

#### 3.1. Direct navigation to /inventory.html without a session redirects to login with page-specific error

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. Ensure no active session: start a fresh browser context with no cookies/localStorage (do not run the login seed) and navigate directly to https://www.saucedemo.com/inventory.html.
    - expect: Browser is redirected to '/' (the login page), URL does not remain on /inventory.html
    - expect: An alert element (h3[data-test='error']) is visible with exact text "Epic sadface: You can only access '/inventory.html' when you are logged in."
    - expect: The Username and Password login fields and Login button are visible (standard login form is shown, not the inventory page)

#### 3.2. Direct navigation to /cart.html without a session redirects to login with page-specific error

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. With no active session, navigate directly to https://www.saucedemo.com/cart.html.
    - expect: Browser is redirected to '/' (login page)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/cart.html' when you are logged in."

#### 3.3. Direct navigation to /checkout-step-one.html without a session redirects to login with page-specific error

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. With no active session, navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: Browser is redirected to '/' (login page)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 3.4. Direct navigation to /checkout-step-two.html without a session redirects to login with page-specific error

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. With no active session, navigate directly to https://www.saucedemo.com/checkout-step-two.html.
    - expect: Browser is redirected to '/' (login page)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."

#### 3.5. Direct navigation to /checkout-complete.html without a session redirects to login with page-specific error

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. With no active session, navigate directly to https://www.saucedemo.com/checkout-complete.html.
    - expect: Browser is redirected to '/' (login page)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."

#### 3.6. Direct navigation to /inventory-item.html?id=4 without a session redirects to login with path-only error (query string dropped)

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. With no active session, navigate directly to https://www.saucedemo.com/inventory-item.html?id=4.
    - expect: Browser is redirected to '/' (login page)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/inventory-item.html' when you are logged in." (the '?id=4' query string does NOT appear in the message, confirming only the pathname is reported)

#### 3.7. After logging out mid-session, previously accessible protected pages become inaccessible again

**File:** `tests/negative-edge-cases/route-guard-redirects.spec.ts`

**Steps:**
  1. Start from the seed's logged-in state on /inventory.html. Open the burger menu and click 'Logout'.
    - expect: Page navigates to '/' (login page) with the login form visible
  2. Attempt to navigate directly back to /inventory.html using the browser address bar / goto.
    - expect: Browser is redirected to '/' again (session was fully cleared by Logout, not just the UI)
    - expect: Error alert text is exactly "Epic sadface: You can only access '/inventory.html' when you are logged in."
