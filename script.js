document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
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

    // Function to populate voices
    function populateVoices() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a voice';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        voiceSelect.appendChild(defaultOption);
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
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

    // Event listeners
    textInput.addEventListener('input', () => {
        const count = textInput.value.length;
        charCount.textContent = count;
        statusText.textContent = count >= 10000 ? 
            "Maximum character limit reached!" : 
            "Ready to convert text to speech";
    });

    rate.addEventListener('input', () => {
        rateValue.textContent = rate.value;
    });

    pitch.addEventListener('input', () => {
        pitchValue.textContent = pitch.value;
    });

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

    stopBtn.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        startBtn.textContent = "Start Reading";
        statusText.textContent = "Reading stopped";
    });

    speech.onend = () => {
        isSpeaking = false;
        startBtn.textContent = "Start Reading";
        statusText.textContent = "Reading completed";
    };

    speech.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        statusText.textContent = `Error: ${event.error}. Please try again.`;
        isSpeaking = false;
        startBtn.textContent = "Start Reading";
    };

    // Initialize everything when page loads
    initVoices();

    // Debugging helper
    console.log('Speech synthesis support:', 'speechSynthesis' in window);
});
