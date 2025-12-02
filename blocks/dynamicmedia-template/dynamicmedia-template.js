import { getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { getHostname, isAuthorEnvironment } from '../../scripts/utils.js';

/**
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const inputs = block.querySelectorAll('.dynamicmedia-template > div');
  const configSrc = Array.from(block.children)[0]?.textContent?.trim(); // inline or cf

  if (configSrc === 'inline') {
    // Get DM Url input
    const templateURL = inputs[1]?.textContent?.trim();
    const variablemapping = inputs[2]?.textContent?.trim();

    if (!templateURL) {
      // eslint-disable-next-line no-console
      console.error('Missing mandatory template URL');
      block.innerHTML = '';
      return;
    }

    // Step 1: Convert to key-value object
    const paramPairs = variablemapping.split(',');
    const paramObject = {};

    if (paramPairs) {
      paramPairs.forEach((pair) => {
        const indexOfEqual = pair.indexOf('=');
        if (indexOfEqual !== -1) {
          const key = pair.slice(0, indexOfEqual).trim();
          let value = pair.slice(indexOfEqual + 1).trim();

          // Remove trailing comma (if any)
          if (value.endsWith(',')) {
            value = value.slice(0, -1);
          }

          // Only add if key is not empty
          if (key) {
            paramObject[key] = value;
          }
        }
      });
    }

    // Manually construct the query string (preserving `$` in keys)
    const queryString = Object.entries(paramObject)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    // Combine with template URL (already includes ? or not)
    const finalUrl = templateURL.includes('?')
        ? `${templateURL}&${queryString}`
        : `${templateURL}?${queryString}`;

    if (finalUrl) {
      const finalImg = document.createElement('img');
      Object.assign(finalImg, {
        className: 'dm-template-image',
        src: finalUrl,
        alt: 'dm-template-image',
      });
      // Add error handling for image load failure
      finalImg.onerror = function onError() {
        // eslint-disable-next-line no-console
        console.warn('Failed to load image:', finalUrl);
        // Set fallback image
        this.src = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/WKND%20Template?wid=2000&hei=2000&qlt=100&fit=constrain';
        this.alt = 'Fallback image - template image not correctly authored';
      };
      block.innerHTML = '';
      block.append(finalImg);
      // moveInstrumentation typically takes (block, element), ensuring it's used
      moveInstrumentation(block, finalImg);
    }
  } else if (configSrc === 'cf') {
    const CONFIG = {
      WRAPPER_SERVICE_URL: 'https://prod-60.eastus2.logic.azure.com:443/workflows/94ef4cd1fc1243e08aeab8ae74bc7980/triggers/manual/paths/invoke',
      WRAPPER_SERVICE_PARAMS: 'api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=e81iCCcESEf9NzzxLvbfMGPmredbADtTZSs8mspUTa4',
      GRAPHQL_QUERY: '/graphql/execute.json/ref-demo-eds/DynamicMediaTemplateByPath',
    };

    const hostnameFromPlaceholders = await getHostname();
    const hostname = hostnameFromPlaceholders || getMetadata('hostname');
    const aemauthorurl = getMetadata('authorurl') || '';

    const aempublishurl = hostname?.replace('author', 'publish')?.replace(/\/$/, '');

    const contentPath = block.querySelector('p.button-container > a')?.textContent?.trim();
    const isAuthor = isAuthorEnvironment();

    // Prepare request configuration based on environment
    const requestConfig = isAuthor
        ? {
          url: `${aemauthorurl}${CONFIG.GRAPHQL_QUERY};path=${contentPath};ts=${Date.now()}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
        : {
          url: `${CONFIG.WRAPPER_SERVICE_URL}?${CONFIG.WRAPPER_SERVICE_PARAMS}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            graphQLPath: `${aempublishurl}${CONFIG.GRAPHQL_QUERY}`,
            cfPath: contentPath,
            variation: 'master',
          }),
        };

    try {
      // Fetch data
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        ...(requestConfig.body && { body: requestConfig.body }),
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error(`error making cf graphql request:${response.status}`);
        block.innerHTML = '';
        return;
      }

      const offer = await response.json();
      // Get the template URL and parameter mappings
      const templateURL = offer?.data?.dynamicMediaTemplateByPath?.item?.dm_template;
      const paramPairs = offer?.data?.dynamicMediaTemplateByPath?.item?.var_mapping;

      // Create parameter object
      const paramObject = {};

      // Process each parameter pair
      if (paramPairs) {
        paramPairs.forEach((pair) => {
          const indexOfEqual = pair.indexOf('=');
          const key = pair.slice(0, indexOfEqual).trim();
          let value = pair.slice(indexOfEqual + 1).trim();

          // Remove trailing comma if any
          if (value.endsWith(',')) {
            value = value.slice(0, -1);
          }
          paramObject[key] = value;
        });
      }

      // Construct the query string (preserving `$` in keys)
      const queryString = Object.entries(paramObject)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');

      // Combine with template URL
      const finalUrl = templateURL.includes('?')
          ? `${templateURL}&${queryString}`
          : `${templateURL}?${queryString}`;

      // Create and append the image element
      if (finalUrl) {
        const finalImg = document.createElement('img');
        Object.assign(finalImg, {
          className: 'dm-template-image',
          src: finalUrl,
          alt: 'dm-template-image',
        });

        // Add error handling for image load failure
        finalImg.onerror = function onError() {
          // eslint-disable-next-line no-console
          console.warn('Failed to load image:', finalUrl);
          // Set fallback image
          this.src = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/WKND%20Template?wid=2000&hei=2000&qlt=100&fit=constrain';
          this.alt = 'Fallback image - template image not correctly authored';
        };

        block.innerHTML = '';
        block.append(finalImg);
        moveInstrumentation(block, finalImg);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('error rendering content fragment', {
        error: error.message,
        stack: error.stack,
      });
      block.innerHTML = '';
    }
  }
}
