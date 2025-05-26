document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements for TTS
    const textInput = document.querySelector('.text-input');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const rate = document.getElementById('rate');
    const pitch = document.getElementById('pitch');
    const rateValue = document.getElementById('rateValue');
    const pitchValue = document.getElementById('pitchValue');
    const charCount = document.getElementById('charCount');
    const statusText = document.getElementById('statusText');

    // Initialize speech objects
    let speech = new SpeechSynthesisUtterance();
    let voices = [];
    let isSpeaking = false;

    // Function to populate voices (with quality preference and limit)
    function populateVoices() {
        const availableVoices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';

        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a voice';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        voiceSelect.appendChild(defaultOption);

        const maxVoices = 15; // Set your desired maximum number of voices
        let voicesAdded = 0;

        // 1. Prioritize English voices (en-US, en-GB first)
        const preferredLangs = ['en-US', 'en-GB'];
        const englishVoices = availableVoices.filter(voice =>
            preferredLangs.includes(voice.lang) || voice.lang.startsWith('en-')
        );
        const otherVoices = availableVoices.filter(voice =>
            !englishVoices.includes(voice)
        );

        // Function to check for common "good quality" voice names (heuristic)
        const isLikelyHighQuality = (voiceName) => {
            const lowerName = voiceName.toLowerCase();
            return lowerName.includes('google') ||
                   lowerName.includes('microsoft') ||
                   lowerName.includes('apple') ||
                   lowerName.includes('zira') || // Microsoft Zira
                   lowerName.includes('david') || // Microsoft David
                   lowerName.includes('samantha') || // Apple Samantha
                   lowerName.includes('daniel'); // Apple Daniel
        };

        // Sort English voices: preferred languages, then by name (to group similar providers)
        englishVoices.sort((a, b) => {
            const aPreferred = preferredLangs.indexOf(a.lang);
            const bPreferred = preferredLangs.indexOf(b.lang);

            if (aPreferred !== -1 && bPreferred === -1) return -1;
            if (aPreferred === -1 && bPreferred !== -1) return 1;

            // Prioritize common "good" names
            const aQuality = isLikelyHighQuality(a.name);
            const bQuality = isLikelyHighQuality(b.name);

            if (aQuality && !bQuality) return -1;
            if (!aQuality && bQuality) return 1;

            return a.name.localeCompare(b.name); // Then sort by name
        });

        // Combine all voices, prioritizing English
        const sortedVoices = [...englishVoices, ...otherVoices];
        voices = sortedVoices; // Update the global voices array

        // Add options to the select dropdown, limiting to maxVoices
        voices.forEach(voice => {
            if (voicesAdded >= maxVoices) {
                return; // Stop adding voices if limit reached
            }

            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
            voicesAdded++;
        });
    }

    // Initialize voices - multiple approaches for reliability
    function initVoices() {
        populateVoices();

        // Some browsers need this
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoices;
        }

        // Fallback timeout
        setTimeout(populateVoices, 1000);
    }

    // TTS Event listeners
    if (textInput && charCount) { // Check if elements exist before adding listeners
        textInput.addEventListener('input', () => {
            const count = textInput.value.length;
            charCount.textContent = count;
            statusText.textContent = count >= 10000 ?
                "Maximum character limit reached!" :
                "Ready to convert text to speech";
        });
    }

    if (rate && rateValue) {
        rate.addEventListener('input', () => {
            rateValue.textContent = rate.value;
        });
    }

    if (pitch && pitchValue) {
        pitch.addEventListener('input', () => {
            pitchValue.textContent = pitch.value;
        });
    }

    if (startBtn && textInput && voiceSelect && statusText) {
        startBtn.addEventListener('click', () => {
            if (isSpeaking) {
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                    statusText.textContent = "Resumed reading";
                    startBtn.textContent = "Pause";
                } else {
                    window.speechSynthesis.pause();
                    statusText.textContent = "Paused reading";
                    startBtn.textContent = "Resume";
                }
                return;
            }

            if (textInput.value.trim() === '') {
                statusText.textContent = "Please enter some text!";
                return;
            }

            if (voiceSelect.selectedIndex <= 0) {
                statusText.textContent = "Please select a voice!";
                return;
            }

            speech.text = textInput.value;
            speech.rate = parseFloat(rate.value);
            speech.pitch = parseFloat(pitch.value);

            const selectedOption = voiceSelect.selectedOptions[0];
            speech.voice = voices.find(voice =>
                voice.name === selectedOption.getAttribute('data-name')
            );

            // Clear any previous utterances
            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(speech);
            isSpeaking = true;
            startBtn.textContent = "Pause";
            statusText.textContent = "Reading...";
        });
    }


    if (stopBtn && startBtn && statusText) {
        stopBtn.addEventListener('click', () => {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            startBtn.textContent = "Start Reading";
            statusText.textContent = "Reading stopped";
        });
    }

    // Speech event handlers
    speech.onend = () => {
        isSpeaking = false;
        if (startBtn) startBtn.textContent = "Start Reading";
        if (statusText) statusText.textContent = "Reading completed";
    };

    speech.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        if (statusText) statusText.textContent = `Error: ${event.error}. Please try again.`;
        isSpeaking = false;
        if (startBtn) startBtn.textContent = "Start Reading";
    };

    // Initialize voices
    initVoices();

    // Debugging helper
    console.log('Speech synthesis support:', 'speechSynthesis' in window);

    // --- NAVIGATION & BURGER MENU LOGIC ---

    // Burger menu toggle
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinksList = document.querySelector('.nav-links'); // Renamed for clarity to avoid conflict

    if (burgerMenu && navLinksList) {
        burgerMenu.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            burgerMenu.classList.toggle('open');
        });
    }

    // Page Navigation Logic (This is the crucial fix)
    // Target both the main nav links AND the cta/task buttons using a combined selector
    document.querySelectorAll('nav .nav-links a, .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');

            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.classList.add('active');

                // If on mobile, close the burger menu after clicking a nav link
                if (window.matchMedia("(max-width: 768px)").matches) {
                    if (navLinksList) navLinksList.classList.remove('active');
                    if (burgerMenu) burgerMenu.classList.remove('open');
                }
            }
        });
    });

    // Contact Form Logic (Feedback via mailto)
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const userEmail = document.getElementById('feedbackEmail').value.trim();
            const userMessage = document.getElementById('feedbackMessage').value.trim();

            if (userMessage === '') {
                alert('Please enter your feedback message.');
                return;
            }

            const recipientEmail = 'your-feedback-email@example.com'; // CHANGE THIS TO YOUR ACTUAL FEEDBACK EMAIL!
            const subject = encodeURIComponent('Feedback from VoiceTools Web App');
            let body = encodeURIComponent(userMessage);

            if (userEmail) {
                body += encodeURIComponent(`\n\nFrom: ${userEmail}`);
            }

            // Construct the mailto link
            const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

            // Open the user's default email client
            window.location.href = mailtoLink;

            // Optionally clear the form after opening the email client
            feedbackForm.reset();
        });
    }
});
