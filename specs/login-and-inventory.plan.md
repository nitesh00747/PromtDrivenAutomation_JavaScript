# Saucedemo Login and Inventory Page Test Plan

## Application Overview

Swag Labs (https://www.saucedemo.com/) is a demo e-commerce site used for test automation practice. This plan covers two areas of the application:

1. Login page functionality (`/`) - validating the six "accepted" usernames listed on the login page, each paired with the shared password `secret_sauce`. Five of the six (standard_user, problem_user, performance_glitch_user, error_user, visual_user) are expected to log in successfully and land on `/inventory.html`. The sixth, locked_out_user, is explicitly denied login despite using the correct password, and must show the error message "Epic sadface: Sorry, this user has been locked out." A further negative scenario covers a valid username with an incorrect password, which must be denied with the error message "Epic sadface: Username and password do not match any user in this service".

   Confirmed selectors (via DOM inspection):
   - Username field: `[data-test="username"]` (accessible name "Username")
   - Password field: `[data-test="password"]` (accessible name "Password")
   - Login button: `[data-test="login-button"]` (accessible name "Login")
   - Error banner: `[data-test="error"]`, rendered inside an `alert` role container with a "Dismiss error" button

2. Inventory page (`/inventory.html`), reached after a successful login (e.g. as standard_user per the seed file). The page must display exactly 6 product items, each with a visible product name, a visible price, and its own "Add to cart" button.

   Confirmed DOM structure: each product is wrapped in a container with class `inventory_item` (6 total). Within each container: the name has class `inventory_item_name`, the price has class `inventory_item_price`, and the add-to-cart button has a unique `data-test`/`id` such as `add-to-cart-sauce-labs-backpack`. IMPORTANT: all 6 "Add to cart" buttons share the identical accessible name "Add to cart" (Playwright's `getByRole('button', { name: 'Add to cart' })` will match all 6 and throw a strict-mode violation if used unscoped). Tests/generators must scope the button locator to each item's container (e.g. by iterating `.inventory_item` containers, or using the per-item unique `data-test` attribute) rather than querying by accessible name alone at the page level.

## Test Scenarios

### 1. Login - Accepted Users

**Seed:** ``

#### 1.1. standard_user logs in successfully

**File:** `tests/login/login-accepted-users.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed with Username field, Password field, and Login button
  2. Fill the Username field with 'standard_user'
  3. Fill the Password field with 'secret_sauce'
  4. Click the Login button
    - expect: No error message is shown
    - expect: Page URL matches /inventory.html
    - expect: The 'Products' page title/header is visible

#### 1.2. problem_user logs in successfully

**File:** `tests/login/login-accepted-users.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed
  2. Fill the Username field with 'problem_user'
  3. Fill the Password field with 'secret_sauce'
  4. Click the Login button
    - expect: No error message is shown
    - expect: Page URL matches /inventory.html

#### 1.3. performance_glitch_user logs in successfully

**File:** `tests/login/login-accepted-users.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed
  2. Fill the Username field with 'performance_glitch_user'
  3. Fill the Password field with 'secret_sauce'
  4. Click the Login button
    - expect: No error message is shown
    - expect: Page URL matches /inventory.html (allow extra time/timeout for this user since it is known to simulate a performance delay before navigating)

#### 1.4. error_user logs in successfully

**File:** `tests/login/login-accepted-users.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed
  2. Fill the Username field with 'error_user'
  3. Fill the Password field with 'secret_sauce'
  4. Click the Login button
    - expect: No error message is shown
    - expect: Page URL matches /inventory.html

#### 1.5. visual_user logs in successfully

**File:** `tests/login/login-accepted-users.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed
  2. Fill the Username field with 'visual_user'
  3. Fill the Password field with 'secret_sauce'
  4. Click the Login button
    - expect: No error message is shown
    - expect: Page URL matches /inventory.html

### 2. Login - Negative Scenarios

**Seed:** ``

#### 2.1. locked_out_user is denied login with correct password

**File:** `tests/login/login-negative.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed, no error banner is present
  2. Fill the Username field with 'locked_out_user'
  3. Fill the Password field with 'secret_sauce' (the correct/valid password)
  4. Click the Login button
    - expect: Login is denied; page URL remains on the login page ('/') and does NOT navigate to /inventory.html
    - expect: An error alert is displayed containing the exact text: "Epic sadface: Sorry, this user has been locked out."
    - expect: The error element is selectable via [data-test="error"] and includes a 'Dismiss error' button

#### 2.2. valid username with wrong password is denied login

**File:** `tests/login/login-negative.spec.ts`

**Steps:**
  1. Navigate to the base URL (login page, '/')
    - expect: Login form is displayed, no error banner is present
  2. Fill the Username field with 'standard_user' (a valid/accepted username)
  3. Fill the Password field with an incorrect password, e.g. 'wrong_password'
  4. Click the Login button
    - expect: Login is denied; page URL remains on the login page ('/') and does NOT navigate to /inventory.html
    - expect: An error alert is displayed containing the exact text: "Epic sadface: Username and password do not match any user in this service"
    - expect: The error element is selectable via [data-test="error"]

### 3. Inventory Page

**Seed:** `tests/seed.spec.ts`

#### 3.1. Inventory page lists exactly 6 items, each with name, price, and its own Add to cart button

**File:** `tests/inventory/inventory-items.spec.ts`

**Steps:**
  1. Start from the logged-in state produced by the seed file (standard_user logged in, landed on /inventory.html)
    - expect: Page URL matches /inventory.html
    - expect: The 'Products' header is visible
  2. Locate all product item containers on the page (each item is wrapped in an element with class 'inventory_item')
    - expect: Exactly 6 item containers are found/counted
  3. For each of the 6 item containers in turn, inspect its contents
    - expect: Each container has a visible product name element (class 'inventory_item_name') with non-empty text
    - expect: Each container has a visible price element (class 'inventory_item_price') whose text matches a currency format such as '$XX.XX'
    - expect: Each container has exactly one visible 'Add to cart' button scoped to that container
  4. Verify the full set of 6 expected product names are all present on the page (Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red))
    - expect: All 6 expected product names are found exactly once each
