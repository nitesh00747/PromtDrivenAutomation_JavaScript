/** SauceDemo's catalogue: display name -> the slug used in data-test ids. */
export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', price: '$29.99' },
  bikeLight: { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light', price: '$9.99' },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', slug: 'sauce-labs-bolt-t-shirt', price: '$15.99' },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', slug: 'sauce-labs-fleece-jacket', price: '$49.99' },
  onesie: { name: 'Sauce Labs Onesie', slug: 'sauce-labs-onesie', price: '$7.99' },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', slug: 'test.allthethings()-t-shirt-(red)', price: '$15.99' },
} as const;

export type Product = (typeof PRODUCTS)[keyof typeof PRODUCTS];
