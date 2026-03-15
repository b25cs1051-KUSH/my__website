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

    // 6. Pi AI Chatbot Logic
    const piToggleBtn = document.getElementById('piToggleBtn');
    const piCloseBtn = document.getElementById('piCloseBtn');
    const piChatWindow = document.getElementById('piChatWindow');
    const piChatForm = document.getElementById('piChatForm');
    const piChatInput = document.getElementById('piChatInput');
    const piChatBody = document.getElementById('piChatBody');
    const piAttentionGrabber = document.getElementById('piAttentionGrabber');

    if (piToggleBtn && piChatWindow) {
        // Toggle Open
        piToggleBtn.addEventListener('click', () => {
            piChatWindow.classList.add('active');
            piToggleBtn.style.transform = 'scale(0)';
            if (piAttentionGrabber) piAttentionGrabber.style.opacity = '0'; // Hide the tip
            setTimeout(() => { document.getElementById('piChatInput').focus(); }, 300);
        });

        // Toggle Close
        piCloseBtn.addEventListener('click', () => {
            piChatWindow.classList.remove('active');
            piToggleBtn.style.transform = 'scale(1)';
        });

        // Chat History Array
        let chatHistory = [];

        // Create Chat Message Element
        function addMessage(text, type) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `pi-message ${type}`;
            msgDiv.innerHTML = text; // allow HTML tags
            piChatBody.appendChild(msgDiv);
            piChatBody.scrollTop = piChatBody.scrollHeight;
        }

        // Logic for Bot Responses via Backend API
        async function getBotResponse(userMsg) {
            try {
                // Determine API URL based on environment
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const apiUrl = isLocal ? 'http://localhost:5000/api/chat' : '/api/chat';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userMsg,
                        history: chatHistory
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Update history with this exchange
                chatHistory.push({ role: 'user', text: userMsg });
                chatHistory.push({ role: 'model', text: data.reply });

                // Truncate history if it gets too long (keep last 10 messages)
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

                return data.reply;
            } catch (error) {
                console.error("Error communicating with AI backend:", error);
                return "I'm having a little trouble connecting to my brain right now! Could you please <a href='#contact' onclick='document.getElementById(\"piCloseBtn\").click()' style='color:var(--clr-accent-blue);font-weight:bold;text-decoration:underline;'>use our contact form</a> to reach Kush directly? 😅";
            }
        }

        // Handle Sending Message
        piChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = piChatInput.value.trim();
            if (!text) return;

            // Add user message
            addMessage(text, 'sent');
            piChatInput.value = '';

            // Loading state
            const loadingId = 'loading-' + Date.now();
            const loadingDiv = document.createElement('div');
            loadingDiv.className = `pi-message received`;
            loadingDiv.id = loadingId;
            loadingDiv.innerHTML = `<span class="typing-indicator"><span></span><span></span><span></span></span>`;
            piChatBody.appendChild(loadingDiv);
            piChatBody.scrollTop = piChatBody.scrollHeight;

            // Bot response wait for fetch
            const responseText = await getBotResponse(text);

            // Remove Loader & show response (with a tiny fake delay for natural feel if API is too fast)
            setTimeout(() => {
                const loader = document.getElementById(loadingId);
                if (loader) loader.remove();
                addMessage(responseText, 'received');
            }, 300);
        });
    }
});
