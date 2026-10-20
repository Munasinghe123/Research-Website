/**
 * SysDesign Contact Form Interactive Handler
 * Sends inquiries directly to jsan39196@gmail.com via FormSubmit AJAX
 */
(function () {
    const RECIPIENT_EMAIL = "jsan39196@gmail.com";
    const FORMSUBMIT_AJAX_URL = `https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`;

    function showStatus(statusBox, type, message, actionHtml = "") {
        if (!statusBox) return;

        let iconSvg = "";
        if (type === "success") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        } else if (type === "error") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else if (type === "info" || type === "warning") {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        statusBox.className = `contact-status-message visible ${type}`;
        statusBox.innerHTML = `
            ${iconSvg}
            <div class="status-content">
                <div>${message}</div>
                ${actionHtml ? `<div>${actionHtml}</div>` : ""}
            </div>
        `;
    }

    function clearStatus(statusBox) {
        if (!statusBox) return;
        statusBox.className = "contact-status-message";
        statusBox.innerHTML = "";
    }

    async function handleContactSubmit(e) {
        const form = e.target;
        if (!form || form.id !== "contactForm") return;

        e.preventDefault();

        const submitBtn = form.querySelector("#contactSubmitBtn") || form.querySelector(".contact-submit-btn");
        const statusBox = form.querySelector("#contactStatusMessage");
        if (!submitBtn) return;

        const fullNameInput = form.querySelector("#fullName");
        const emailInput = form.querySelector("#emailAddress");
        const subjectInput = form.querySelector("#subject");
        const messageInput = form.querySelector("#message");
        const honeyInput = form.querySelector('input[name="_honey"]');

        // Check honeypot for bot submissions
        if (honeyInput && honeyInput.value.trim() !== "") {
            console.warn("Spam submission blocked.");
            form.reset();
            return;
        }

        const fullName = fullNameInput ? fullNameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const subject = subjectInput ? subjectInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!fullName || !email || !subject || !message) {
            showStatus(statusBox, "error", "Please fill in all required fields.");
            return;
        }

        // Cache original button markup & styles
        const originalBtnHtml = submitBtn.innerHTML;
        const originalBtnBackground = submitBtn.style.background;
        const originalBtnColor = submitBtn.style.color;
        const originalBtnBoxShadow = submitBtn.style.boxShadow;

        // UI: Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="contact-spinner"></span>
            <span class="btn-text">Sending...</span>
        `;
        clearStatus(statusBox);

        // Fallback for direct local file:// protocol
        if (window.location.protocol === "file:") {
            const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${fullName}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
            showStatus(
                statusBox,
                "warning",
                "Form submissions require running through a web server (e.g. Live Server or GitHub Pages).",
                `<a href="${mailtoUrl}" class="status-action">Click here to send message directly via your Email App &rarr;</a>`
            );
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
            return;
        }

        try {
            const payload = {
                name: fullName,
                email: email,
                _subject: `SysDesign Research Inquiry: ${subject}`,
                subject: subject,
                message: message,
                _captcha: "false",
                _template: "table"
            };

            const response = await fetch(FORMSUBMIT_AJAX_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && (data.success === true || data.success === "true")) {
                // Successful send
                submitBtn.innerHTML = `
                    <span class="btn-text">Message Sent!</span>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                `;
                submitBtn.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
                submitBtn.style.color = "#ffffff";
                submitBtn.style.boxShadow = "0 0 25px rgba(16, 185, 129, 0.5)";

                showStatus(statusBox, "success", "Thank you! Your message has been sent successfully. We will get back to you shortly.");
                form.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.style.background = originalBtnBackground;
                    submitBtn.style.color = originalBtnColor;
                    submitBtn.style.boxShadow = originalBtnBoxShadow;
                }, 4000);
            } else if (data.message && data.message.toLowerCase().includes("activation")) {
                // One-time FormSubmit email activation notice
                submitBtn.innerHTML = `
                    <span class="btn-text">Activation Email Sent</span>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                `;
                submitBtn.style.background = "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)";
                submitBtn.style.color = "#ffffff";

                showStatus(
                    statusBox,
                    "info",
                    `One-time activation required: FormSubmit has sent an "Activate Form" email to ${RECIPIENT_EMAIL}. Once you click that link, messages will arrive directly in your inbox!`
                );

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.style.background = originalBtnBackground;
                    submitBtn.style.color = originalBtnColor;
                }, 5000);
            } else {
                throw new Error(data.message || "Failed to send message.");
            }
        } catch (err) {
            console.error("Contact Form Submission Error:", err);

            submitBtn.innerHTML = `
                <span class="btn-text">Send Failed</span>
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            `;
            submitBtn.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
            submitBtn.style.color = "#ffffff";
            submitBtn.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.45)";

            const mailtoFallback = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${fullName}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

            showStatus(
                statusBox,
                "error",
                `Unable to deliver message automatically (${err.message || "Network issue"}).`,
                `<a href="${mailtoFallback}" class="status-action">Click here to send directly via email client &rarr;</a>`
            );

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.style.background = originalBtnBackground;
                submitBtn.style.color = originalBtnColor;
                submitBtn.style.boxShadow = originalBtnBoxShadow;
            }, 5000);
        }
    }

    // Register delegated submit handler
    document.addEventListener("submit", handleContactSubmit);

    // Global initializer for modular section loader
    window.initContactForm = function () {
        // Ready for section injection
    };
})();
