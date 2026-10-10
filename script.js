/**
 * SYSDESIGN — Research Website
 * Modular Section Loader & Anchor Navigation Handler
 */

let isAboutSectionLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
    loadAboutSection();
});

/**
 * Loads sections/about.html into the #about placeholder using the native Fetch API.
 */
async function loadAboutSection() {
    const aboutContainer = document.getElementById('about');
    if (!aboutContainer) return;

    // Prevent duplicate loading
    if (isAboutSectionLoaded || aboutContainer.dataset.loaded === 'true') {
        return;
    }

    try {
        const response = await fetch('./sections/about.html');
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Prevent race condition or duplicate injection
        if (aboutContainer.dataset.loaded === 'true') return;

        aboutContainer.innerHTML = html;
        aboutContainer.dataset.loaded = 'true';
        isAboutSectionLoaded = true;

        // Preserve and handle anchor navigation
        handleAnchorNavigation();
    } catch (error) {
        console.error('Error loading About section:', error);

        const isFileProtocol = window.location.protocol === 'file:';
        const errorMessage = isFileProtocol
            ? 'Browser security restricts Fetch requests on the local file:// protocol. Please preview this website using a local static HTTP server (e.g., VS Code Live Server) or deploy to static web hosting.'
            : 'Unable to load section content. Please check your network connection or verify that sections/about.html is available.';

        aboutContainer.innerHTML = `
            <section class="research-overview-section" style="text-align: center; padding: 60px 20px;">
                <div style="max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid rgba(238, 89, 50, 0.3); border-radius: 12px; background: rgba(36, 35, 34, 0.6);">
                    <p style="color: var(--accent, #EE5932); font-weight: 600; margin: 0 0 10px 0;">About Section Notice</p>
                    <p style="color: var(--text-muted, #9B9B9A); font-size: 0.95rem; margin: 0; line-height: 1.6;">${errorMessage}</p>
                </div>
            </section>
        `;
    }
}

/**
 * Handles smooth scrolling to the target anchor if the page was opened with a hash
 * or if a navigation link was clicked before the dynamic content loaded.
 */
function handleAnchorNavigation() {
    const hash = window.location.hash;
    if (hash === '#about' || hash === '#research-overview') {
        const target = document.getElementById(hash.substring(1));
        if (target) {
            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
}
