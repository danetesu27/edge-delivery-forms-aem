/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
    // this shouldHide logic is temporary till the time DM rendering on published live site is resolved.
    const { hostname } = window.location;
    const shouldHide = hostname.includes('aem.live') || hostname.includes('aem.page');

    const deliveryType = Array.from(block.children)[0]?.textContent?.trim();
    const inputs = block.querySelectorAll('.dynamicmedia-image > div');

    const inputsArray = Array.from(inputs);
    if (inputsArray.length < 2) {
        // Console statements are disabled by linter
        return;
    }

    const imageEl = inputs[1]?.getElementsByTagName('img')[0];
    // Get DM Url input
    const dmUrlEl = inputs[2]?.getElementsByTagName('a')[0];
    // const rotate = inputs[3]?.textContent?.trim(); // Unused
    // const flip = inputs[4]?.textContent?.trim(); // Unused
    const altText = inputs[6].textContent?.trim();

    if (deliveryType !== 'na' && !shouldHide) {
        if (deliveryType === 'dm') {
            // Ensure S7 is loaded
            if (typeof window.s7responsiveImage !== 'function') {
                return;
            }

            // Get image
            if (!imageEl) {
                return;
            }

            const imageSrc = imageEl.getAttribute('src');
            if (!imageSrc) {
                return;
            }

            // Get imageName from imageSrc expected in the format /content/dam/<...>/<imageName>.<extension>
            const imageName = imageSrc.split('/').pop().split('.')[0];

            const dmUrl = dmUrlEl?.getAttribute('href') || 'https://smartimaging.scene7.com/is/image/DynamicMediaNA';

            const finalSrc = `${dmUrl}${dmUrl.endsWith('/') ? '' : '/'}${imageName}`;

            imageEl.setAttribute('data-src', finalSrc);
            imageEl.setAttribute('src', finalSrc);
            imageEl.setAttribute('alt', altText || 'dynamic media image');
            imageEl.setAttribute('data-mode', 'smartcrop');
            block.innerHTML = '';
            block.append(imageEl);
            window.s7responsiveImage(imageEl);
        } else if (deliveryType === 'dm-openapi') {
            block.children[6]?.remove();
            block.children[5]?.remove();
            block.children[4]?.remove();
            block.children[3]?.remove();
            block.children[2]?.remove();
            block.children[0]?.remove();
        }
    } else {
        block.innerHTML = '';
    }
}
