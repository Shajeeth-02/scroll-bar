/**
 * Scroll Bar block – interactive step progress indicator.
 * Hover over the steps to move the progress fill and highlight the active step.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Parse every row into a label → cell map
  const data = {};
  [...block.children].forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim();
    data[key] = cells[1];
  });

  // Step definitions in order
  const stepKeys = ['car', 'user', 'explore', 'phone'];
  const stepsData = stepKeys.map((key) => {
    const iconCell = data[`${key}-icon`];
    // Support both plain <img> and <picture><img>
    const img = iconCell?.querySelector('img');
    return {
      iconSrc: img?.src || '',
      iconAlt: img?.alt || '',
      heading: data[`${key}-icon-info-heading`]?.textContent.trim() || '',
      subHeading: data[`${key}-icon-info-sub-heading`]?.textContent.trim() || '',
    };
  });

  // ── Header ───────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'scroll-bar-header';

  const h2 = document.createElement('h2');
  h2.textContent = data['Heading']?.textContent.trim() || '';

  const subP = document.createElement('p');
  subP.textContent = data['Sub-Heading']?.textContent.trim() || '';

  header.append(h2, subP);

  // ── Steps section ─────────────────────────────────────────────────────────
  const stepsSection = document.createElement('div');
  stepsSection.className = 'scroll-bar-steps';

  // Connecting track line (sits behind the icons)
  const track = document.createElement('div');
  track.className = 'scroll-bar-track';

  const fill = document.createElement('div');
  fill.className = 'scroll-bar-fill';
  track.append(fill);
  stepsSection.append(track);

  // Build each step element
  const stepEls = stepsData.map((step, i) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'scroll-bar-step';
    if (i === 0) stepEl.classList.add('is-active');

    // Icon circle
    const iconWrap = document.createElement('div');
    iconWrap.className = 'scroll-bar-step-icon';
    if (step.iconSrc) {
      const img = document.createElement('img');
      img.src = step.iconSrc;
      img.alt = step.iconAlt;
      img.width = 24;
      img.height = 24;
      iconWrap.append(img);
    }

    // Text info
    const info = document.createElement('div');
    info.className = 'scroll-bar-step-info';

    const headingEl = document.createElement('span');
    headingEl.className = 'scroll-bar-step-heading';
    headingEl.textContent = step.heading;

    const subEl = document.createElement('span');
    subEl.className = 'scroll-bar-step-subheading';
    subEl.textContent = step.subHeading;

    info.append(headingEl, subEl);
    stepEl.append(iconWrap, info);
    stepsSection.append(stepEl);
    return stepEl;
  });

  // ── Interaction ───────────────────────────────────────────────────────────
  let activeIndex = 0;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    stepEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
    // Fill spans 0 % (step 0 center) → 100 % (last step center)
    const pct = stepsData.length > 1 ? (index / (stepsData.length - 1)) * 100 : 0;
    fill.style.width = `${pct}%`;
  }

  stepsSection.addEventListener('mousemove', (e) => {
    const rect = stepsSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const stepWidth = rect.width / stepsData.length;
    const index = Math.min(stepsData.length - 1, Math.max(0, Math.floor(x / stepWidth)));
    setActive(index);
  });

  stepsSection.addEventListener('mouseleave', () => {
    setActive(0);
  });

  // Initialise fill at step 0 (fill = 0 %)
  fill.style.width = '0%';

  block.replaceChildren(header, stepsSection);
}
