
export default function decorate(block) {
 
  const data = {};
  [...block.children].forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim();
    data[key] = cells[1];
  });

 
  const stepKeys = ['car', 'explore', 'user', 'phone'];
  const stepsData = stepKeys.map((key) => {
    const iconCell = data[`${key}-icon`];
    const img = iconCell?.querySelector('img');
    return {
      iconSrc: img?.src || '',
      iconAlt: img?.alt || '',
      heading: data[`${key}-icon-info-heading`]?.textContent.trim()
        || data[`${key}-icon-heading`]?.textContent.trim()
        || '',
      subHeading: data[`${key}-icon-info-sub-heading`]?.textContent.trim()
        || data[`${key}-icon-sub-heading`]?.textContent.trim()
        || '',
    };
  });

  const header = document.createElement('div');
  header.className = 'scroll-bar-header';

  const h2 = document.createElement('h2');
  h2.textContent = data['Heading']?.textContent.trim() || '';

  const subP = document.createElement('p');
  subP.textContent = data['Sub-Heading']?.textContent.trim() || '';

  header.append(h2, subP);

  const stepsSection = document.createElement('div');
  stepsSection.className = 'scroll-bar-steps';

  const track = document.createElement('div');
  track.className = 'scroll-bar-track';

  const fill = document.createElement('div');
  fill.className = 'scroll-bar-fill';
  track.append(fill);
  stepsSection.append(track);

  const stepEls = stepsData.map((step, i) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'scroll-bar-step';
    if (i === 0) stepEl.classList.add('is-active');

   
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

  let activeIndex = 0;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    stepEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
    const pct = stepsData.length > 1 ? (index / (stepsData.length - 1)) * 100 : 0;
    fill.style.width = `${pct}%`;
  }

  // Scroll (mouse wheel) while cursor is over the block advances/retreats steps.
  // A cooldown locks the step for 700 ms after each change so it feels deliberate.
  let scrollLocked = false;

  block.addEventListener('wheel', (e) => {
    const direction = e.deltaY > 0 ? 1 : -1;
    const next = Math.min(stepsData.length - 1, Math.max(0, activeIndex + direction));
    if (next !== activeIndex) {
      e.preventDefault();
      if (!scrollLocked) {
        scrollLocked = true;
        setActive(next);
        setTimeout(() => { scrollLocked = false; }, 100);
      }
    }
  }, { passive: false });

  fill.style.width = '0%';

  block.replaceChildren(header, stepsSection);
}
