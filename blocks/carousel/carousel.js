import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createSlider from '../../scripts/slider.js';

function setCarouselItems(number) {
  const list = document.querySelector('.carousel > ul');
  if (list) {
    list.style.setProperty('--items-per-view', number);
  }
}

export default function decorate(block) {
  let i = 0;

  const slider = document.createElement('ul');
  const leftContent = document.createElement('div');

  [...block.children].forEach((row) => {
    if (i > 3) {
      const li = document.createElement('li');

      // Read card style from the third div (index 2)
      const styleDiv = row.children[2];
      const styleParagraph = styleDiv?.querySelector('p');
      const cardStyle = styleParagraph?.textContent?.trim() || 'default';
      if (cardStyle && cardStyle !== 'default') {
        li.className = cardStyle;
      }

      // Read CTA style from the fourth div (index 3)
      const ctaDiv = row.children[3];
      const ctaParagraph = ctaDiv?.querySelector('p');
      const ctaStyle = ctaParagraph?.textContent?.trim() || 'default';

      moveInstrumentation(row, li);
      while (row.firstElementChild) li.append(row.firstElementChild);

      // Process the li children to identify and style them correctly
      [...li.children].forEach((div, index) => {
        if (index === 0) {
          // First div (index 0) - Image
          div.className = 'cards-card-image';
        } else if (index === 1) {
          // Second div (index 1) - Content with button
          div.className = 'cards-card-body';
        } else if (index === 2) {
          // Third div (index 2) - Card style configuration
          div.className = 'cards-config';
          const p = div.querySelector('p');
          if (p) {
            p.style.display = 'none'; // Hide the configuration text
          }
        } else if (index === 3) {
          // Fourth div (index 3) - CTA style configuration
          div.className = 'cards-config';
          const p = div.querySelector('p');
          if (p) {
            p.style.display = 'none'; // Hide the configuration text
          }
        } else {
          // Any other divs
          div.className = 'cards-card-body';
        }
      });

      // Apply CTA styles to button containers
      const buttonContainers = li.querySelectorAll('p.button-container');
      buttonContainers.forEach((buttonContainer) => {
        // Remove any existing CTA classes
        buttonContainer.classList.remove('default', 'cta-button', 'cta-button-secondary', 'cta-button-dark', 'cta-default');
        // Add the correct CTA class
        buttonContainer.classList.add(ctaStyle);
      });

      slider.append(li);
    } else {
      if (row.firstElementChild.firstElementChild) {
        leftContent.append(row.firstElementChild.firstElementChild);
      }
      if (row.firstElementChild) {
        leftContent.append(row.firstElementChild.firstElementChild || '');
      }
      leftContent.className = 'default-content-wrapper';
    }
    i += 1;
  });

  slider.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.parentNode.parentNode.prepend(leftContent);
  block.append(slider);

  // Set items property directly on the slider element we created
  slider.style.setProperty('--items-per-view', 2);

  createSlider(block);
}
