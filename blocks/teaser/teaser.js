/* eslint-disable */
/* eslint-disable */
import {
  div, a, span, img, video, source, button, h1,
} from '../../scripts/dom-helpers.js';
import { readBlockConfig } from '../../scripts/aem.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function createVideoPlayer(videoSrc) {
  const pauseIcon = `${window.hlx.codeBasePath}/icons/video-pause.svg`;
  const playIcon = `${window.hlx.codeBasePath}/icons/video-play.svg`;

  /* eslint-disable function-paren-newline */
  const videoPlayer = div({ class: 'video-container' },
      div({ class: 'video-play', id: 'playButton', tabindex: 0 },
          button({ class: 'video-play-btn', 'aria-label': 'video-play-btn' }, img({
            class: 'play-icon controls', src: playIcon, width: 28, height: 28, alt: 'play animation',
          })),
      ),
      div({ class: 'video-pause inactive', id: 'pauseButton' },
          button({ class: 'video-pause-btn', 'aria-label': 'video-pause-btn' }, img({
            class: 'pause-icon controls', src: pauseIcon, width: 28, height: 28, alt: 'pause animation',
          })),
      ),
      // INSTRUMENTATION: Added props for video editing if needed, though video logic is complex in UE
      video({ id: 'videoPlayer' },
          source({ src: videoSrc, type: 'video/mp4' }, 'Your browser does not support the video tag.'),
      ),
  );

  const videoEl = videoPlayer.querySelector('video');
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.loop = true;

  return videoPlayer;
}

function createBackgroundImage(properties) {
  let missingSrc;
  if (!properties.imageref) missingSrc = true;
  const imgSrc = (!missingSrc) ? properties.imageref : '';
  const imgAlt = (properties.imagealt) ? properties.imagealt : '';

  const imgBackground = div({ class: 'background-image' },
      // INSTRUMENTATION: Link this image to the 'imageRef' field in your JSON model
      img({
        class: 'teaser-background',
        src: imgSrc,
        alt: imgAlt,
        'data-aue-prop': 'imageRef',
        'data-aue-type': 'media',
        'data-aue-label': 'Image'
      }),
  );

  if (missingSrc) imgBackground.classList.add('inactive');

  return imgBackground;
}

function observeVideo(block, autoplay) {
  const videoPlayerEl = block.querySelector('video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!(prefersReducedMotion.matches) && autoplay && (videoPlayerEl.dataset.state !== 'pause')) {
          const playButton = document.getElementById('playButton');
          const pauseButton = document.getElementById('pauseButton');
          if(playButton && pauseButton) {
            playButton.classList.add('inactive');
            playButton.removeAttribute('tabindex');
            pauseButton.classList.remove('inactive');
            pauseButton.setAttribute('tabindex', 0);
            videoPlayerEl.play();
          }
        }
      } else {
        videoPlayerEl.pause();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(videoPlayerEl);
}

function attachListeners() {
  const videoPlayer = document.getElementById('videoPlayer');
  const playButton = document.getElementById('playButton');
  const pauseButton = document.getElementById('pauseButton');

  if(!playButton || !pauseButton) return;

  ['click', 'keydown'].forEach((eventType) => {
    playButton.addEventListener(eventType, (event) => {
      if (eventType === 'keydown' && event.key !== 'Enter') return;
      playButton.classList.add('inactive');
      playButton.removeAttribute('tabindex');
      pauseButton.classList.remove('inactive');
      pauseButton.setAttribute('tabindex', 0);
      videoPlayer.autoplay = true;
      videoPlayer.dataset.state = 'play';
      videoPlayer.play();
    });
  });

  ['click', 'keydown'].forEach((eventType) => {
    pauseButton.addEventListener(eventType, (event) => {
      if (eventType === 'keydown' && event.key !== 'Enter') return;
      playButton.classList.remove('inactive');
      playButton.setAttribute('tabindex', 0);
      pauseButton.classList.add('inactive');
      pauseButton.removeAttribute('tabindex');
      videoPlayer.autoplay = false;
      videoPlayer.dataset.state = 'pause';
      videoPlayer.pause();
    });
  });
}

export default function decorate(block) {
  // Logic to preserve existing RTE content before wiping block
  const rteElementTag = Array.from(block.querySelectorAll('p'))
      .find((el) => el.textContent.trim() === 'title');
  const rteElement = rteElementTag?.parentElement?.nextElementSibling;
  const rteContent = rteElement?.querySelector('p')?.innerHTML;

  const sampleVideo = 'https://v.ftcdn.net/02/35/97/40/700_F_235974059_oVftmgBBJ32tgsDvxRdMdtpQDMfNFWEt_ST.mp4';

  const properties = readBlockConfig(block);

  let swooshbgClass = 'swoosh-bg';
  let swooshlayersClass = 'swoosh-layers';

  if (properties.useswoosh && properties.useswoosh === 'false') {
    swooshbgClass = 'swoosh-bg-hidden';
    swooshlayersClass = 'swoosh-layers-hidden';
  }

  // Get CTA style and set button container class
  let buttonContainerClass = 'button-container';
  if (properties.ctastyle) {
    buttonContainerClass = `cta-${properties.ctastyle}`;
  }

  const swooshFirst = `${window.hlx.codeBasePath}/icons/teaser_innerswoosh.svg`;
  const swooshSecond = `${window.hlx.codeBasePath}/icons/teaser_outerswoosh.svg`;
  const isVideo = (properties.teaserstyle && properties.teaserstyle === 'video');
  const videoAutoplay = (properties.videobehavior && properties.videobehavior === 'autoplay');
  const buttonText = (properties.buttontext) ? properties.buttontext : 'Button';
  const buttonStyle = (properties['btn-style']) ? properties['btn-style'] : 'dark-bg';
  const buttonLink = (properties['btn-link']) ? properties['btn-link'] : '';
  const videoReference = isVideo ? properties.videoreference : sampleVideo;

  const teaser = div({ class: 'teaser-container' },
      isVideo ? createVideoPlayer(videoReference) : createBackgroundImage(properties),
      div({ class: 'teaser-swoosh-wrapper' },
          div({ class: swooshbgClass }),
          div({ class: swooshlayersClass },
              img({ class: 'swoosh first', src: swooshFirst, alt: 'background swoosh first' }),
              img({ class: 'swoosh second', src: swooshSecond, alt: 'background swoosh second' }),
          ),
          div({ class: 'teaser-title-wrapper' },
              // INSTRUMENTATION: Added props for Title
              h1({
                class: 'teaser-title',
                'data-aue-prop': 'title',
                'data-aue-type': 'rich-text',
                'data-aue-label': 'Title'
              }),
              div({ class: buttonContainerClass },
                  // INSTRUMENTATION: Added props for Button Link and Text
                  a({
                        id: 'button',
                        href: buttonLink,
                        class: `button ${buttonStyle}`,
                        'data-aue-prop': 'btn-link',
                        'data-aue-type': 'reference',
                        'data-aue-label': 'Button Link'
                      },
                      span({
                        class: 'button-text',
                        'data-aue-prop': 'buttonText',
                        'data-aue-type': 'text',
                        'data-aue-label': 'Button Text'
                      }, buttonText),
                  ),
              ),
          ),
      ),
  );

  teaser.querySelector('.teaser-title').innerHTML = properties.title ? rteContent : 'Title';

  // Clear the block and append the new instrumented DOM
  block.innerHTML = '';
  block.appendChild(teaser);

  // add observer for video and listeners for play/pause
  if (isVideo) observeVideo(block, videoAutoplay);
  if (isVideo) attachListeners();
}
