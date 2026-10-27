import './motion-regions.css';

// Only native, repeating decorations use this state. Entrance/reveal animations
// and ReactDrops canvases have their own playback. The interactive phoenix
// separately pauses its CSS animations and timers when its stage leaves view.
function observeMotionRegions() {
  const regions = new Set();
  const visibility = new Map();
  const syncRegion = region => {
    const active = String(!document.hidden && visibility.get(region));
    if (region.dataset.motionActive !== active) region.dataset.motionActive = active;
  };
  const sync = () => {
    for (const region of regions) syncRegion(region);
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!regions.has(entry.target)) continue;
      visibility.set(entry.target, entry.isIntersecting);
      syncRegion(entry.target);
    }
  });
  const attach = region => {
    if (regions.has(region)) return;
    regions.add(region);
    visibility.set(region, false);
    region.dataset.motionRegion = '';
    syncRegion(region);
    observer.observe(region);
  };
  const detach = region => {
    observer.unobserve(region);
    regions.delete(region);
    visibility.delete(region);
    delete region.dataset.motionRegion;
    delete region.dataset.motionActive;
  };
  document.querySelectorAll('.hero-full, #how, .site-footer').forEach(attach);

  // Each card is a region: the section's footnote may still be visible long
  // after all its animated illustrations have left the viewport. Filtering
  // replaces the grid's direct children, so observe only that narrow boundary.
  const grid = document.getElementById('ideas-grid');
  let cards = new Set();
  const syncCards = () => {
    const next = new Set([...grid.children].filter(child => child.matches('.idea-card')));
    for (const card of cards) if (!next.has(card)) detach(card);
    for (const card of next) if (!cards.has(card)) attach(card);
    cards = next;
  };
  const gridObserver = new MutationObserver(syncCards);
  if (grid) {
    syncCards();
    gridObserver.observe(grid, { childList: true });
  }
  document.addEventListener('visibilitychange', sync);

  return () => {
    gridObserver.disconnect();
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    for (const region of regions) {
      delete region.dataset.motionRegion;
      delete region.dataset.motionActive;
    }
    regions.clear();
    visibility.clear();
    cards.clear();
  };
}

const stopObserving = observeMotionRegions();
if (import.meta.hot) import.meta.hot.dispose(stopObserving);
