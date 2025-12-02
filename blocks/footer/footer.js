import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');

  // FIX 1: Update the default path to point to your project folder
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/site-demo-dos/footer';

  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';

  // FIX 2: Safety check - only run this if the fragment actually loaded
  if (fragment) {
    const footer = document.createElement('div');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);
  } else {
    // Optional: Log a cleaner warning if footer is missing, instead of crashing
    console.warn(`Footer fragment not found at: ${footerPath}`);
  }
}
