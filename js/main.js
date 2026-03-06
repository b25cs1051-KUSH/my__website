document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 3. Simple Scroll Reveal Animation Setup (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // We will add class 'reveal-on-scroll' to elements that need this animation
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    // 4. Contact Form Handling (Google Apps Script Integration)
    const contactForm = document.getElementById('contactForm');
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaU1X1Msl4pLqmtPGbuQAoD2NtCWrgI6R9_fl5Ipqx8LZMadZNpVP7W7zBs_AjtYXwyQ/exec';

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = contactForm.querySelector('.form-submit');
            const originalText = btn.innerHTML;

            // Visual feedback: Loading
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Idea...`;
            btn.disabled = true;

            // Gather all form data
            const formData = new FormData(contactForm);

            // Because checkboxes with the same name will be overwritten in standard FormData if we don't handle them manually,
            // let's grab all checked services and join them.
            const checkedServices = [];
            document.querySelectorAll('input[name="ServicsRequested"]:checked').forEach(checkbox => {
                checkedServices.push(checkbox.value);
            });
            formData.set('ServicsRequested', checkedServices.join(', '));

            // Perform POST request to Google Apps Script
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: new URLSearchParams(formData), // Send as application/x-www-form-urlencoded
                mode: 'no-cors' // Crucial for Google Apps Script to prevent strict CORS blocks
            })
                .then(response => {
                    // With no-cors, we get an opaque response back even on success. 
                    // So we assume success if it didn't throw an outright network error.
                    btn.innerHTML = `<i class="fas fa-check"></i> Sent Successfully!`;
                    btn.style.background = "#22c55e"; // Neo-brutalist green
                    btn.style.color = "white";

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = "";
                        btn.style.color = "";
                        btn.disabled = false;
                        contactForm.reset();
                    }, 3000);
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Oops! Try Again`;
                    btn.style.background = "#ef4444"; // Neo-brutalist red
                    btn.style.color = "white";

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = "";
                        btn.style.color = "";
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }

    // 5. Update Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
