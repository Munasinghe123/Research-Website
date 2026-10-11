/**
 * Seamless Continuous Right-to-Left Marquee Engine
 * Dynamically measures group width + gap and smoothly animates using requestAnimationFrame.
 * Mathematically connects the end directly to the front with zero pixel jumps.
 */
(function() {
    let animationFrameId = null;

    window.initMarquee = function() {
        const track = document.getElementById('marquee-track');
        if (!track) return;

        // Cancel any running animation loop before re-initializing
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        const container = track.parentElement;
        const initialGroup = track.querySelector('.marquee-group');
        if (!initialGroup) return;

        // Reset track to only contain the master group
        const existingGroups = track.querySelectorAll('.marquee-group');
        existingGroups.forEach((group, index) => {
            if (index > 0) group.remove();
        });

        // Computed gap between groups
        const computedStyle = window.getComputedStyle(track);
        const gap = parseFloat(computedStyle.gap) || 24;

        // Measure group width
        const groupRect = initialGroup.getBoundingClientRect();
        const groupWidth = groupRect.width;

        if (groupWidth === 0) {
            // If DOM layout hasn't completed paint, retry next frame
            requestAnimationFrame(window.initMarquee);
            return;
        }

        // Exact distance from start of group N to start of group N+1
        const stepWidth = groupWidth + gap;

        // Calculate how many clones are needed to comfortably exceed container width
        const containerWidth = container.offsetWidth || window.innerWidth;
        const totalGroupsNeeded = Math.max(3, Math.ceil(containerWidth / stepWidth) + 2);

        // Clone the master group
        for (let i = 1; i < totalGroupsNeeded; i++) {
            const clone = initialGroup.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        }

        let offset = 0;
        const speedPixelsPerSecond = 45; // Smooth, readable velocity
        let isPaused = false;
        let lastTimestamp = null;

        // Hover pause listeners
        const handleMouseEnter = () => { isPaused = true; };
        const handleMouseLeave = () => { isPaused = false; };
        track.onmouseenter = handleMouseEnter;
        track.onmouseleave = handleMouseLeave;

        function animate(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
            lastTimestamp = timestamp;

            if (!isPaused) {
                // Advance right-to-left
                offset += speedPixelsPerSecond * deltaSeconds;

                // When offset reaches one full group cycle, wrap around seamlessly
                if (offset >= stepWidth) {
                    offset = offset % stepWidth;
                }

                track.style.transform = `translate3d(-${offset.toFixed(2)}px, 0, 0)`;
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    // Auto-recalculate on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (document.getElementById('marquee-track')) {
                window.initMarquee();
            }
        }, 150);
    });
})();
