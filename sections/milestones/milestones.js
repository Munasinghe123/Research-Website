/**
 * Project Milestones - Scroll-Driven Progress Bar & Interactive Timeline
 */

(function () {
  let timelineWrapper = null;
  let timelineList = null;
  let ticking = false;

  function updateTimelineProgress() {
    if (!timelineWrapper || !timelineList) {
      timelineWrapper = document.querySelector(".timeline-wrapper");
      timelineList = document.querySelector(".timeline-list");
      if (!timelineWrapper || !timelineList) return;
    }

    const rect = timelineList.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Match GSAP trigger positions
    const start = viewportHeight * 0.75;
    const end = viewportHeight * 0.25;

    const distance = rect.height + start - end;

    const progress = Math.min(
      1,
      Math.max(0, (start - rect.top) / distance)
    );

    // Update CSS Custom Properties for progress bar fill
    timelineWrapper.style.setProperty("--about-progress", progress);
    timelineWrapper.style.setProperty("--timeline-progress", progress);

    // Illuminate milestone dots as progress passes them
    const items = timelineList.querySelectorAll(".timeline-item");
    const currentFillPx = progress * rect.height;

    items.forEach((item) => {
      const itemCenter = item.offsetTop + item.offsetHeight / 2;
      if (currentFillPx >= itemCenter - 20) {
        item.classList.add("is-passed");
      } else {
        item.classList.remove("is-passed");
      }
    });

    ticking = false;
  }

  function requestProgressUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateTimelineProgress);
      ticking = true;
    }
  }

  function initMilestonesTimeline() {
    timelineWrapper = document.querySelector(".timeline-wrapper");
    timelineList = document.querySelector(".timeline-list");

    if (timelineWrapper && timelineList) {
      updateTimelineProgress();
    }
  }

  // Register global listeners
  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);

  // Expose init function for modular section loading
  window.initMilestonesTimeline = initMilestonesTimeline;

  // Auto-run if DOM is already ready or content exists
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMilestonesTimeline);
  } else {
    initMilestonesTimeline();
  }
})();
