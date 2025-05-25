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

// Initialize a new SpeechSynthesisUtterance object
let speech = new SpeechSynthesisUtterance();
let voices = []; // Array to store available voices
let isSpeaking = false; // Flag to track if speech is ongoing

// Event listener for when voices are loaded/changed in the browser
window.speechSynthesis.onvoiceschanged = () => {
    // Get all available voices
    voices = window.speechSynthesis.getVoices();
    // Populate the voice select dropdown with all available voices
    // The previous filter for 'en' has been removed to show more options.
    voiceSelect.innerHTML = voices
        .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
        .join(''); // Join options into a single string
};

// Event listener for input in the text area to update character count
textInput.addEventListener('input', () => {
    const count = textInput.value.length;
    charCount.textContent = count; // Update character count display
    // Update status text based on character limit
    statusText.textContent = count >= 10000 ? 
        "Maximum character limit reached!" : 
        "Ready to convert text to speech";
});

// Event listener for rate slider to update its displayed value
rate.addEventListener('input', () => rateValue.textContent = rate.value);
// Event listener for pitch slider to update its displayed value
pitch.addEventListener('input', () => pitchValue.textContent = pitch.value);

// Event listener for the Start/Pause button
startBtn.addEventListener('click', () => {
    // If currently speaking, pause or resume
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
        return; // Exit function after handling pause/resume
    }

    // If text input is empty, show a message
    if (textInput.value.trim() === '') {
        statusText.textContent = "Please enter some text!";
        return;
    }

    // Set speech properties from input values
    speech.text = textInput.value;
    speech.rate = parseFloat(rate.value); // Ensure rate is a number
    speech.pitch = parseFloat(pitch.value); // Ensure pitch is a number
    // Find the selected voice object from the voices array
    speech.voice = voices.find(voice => voice.name === voiceSelect.value);
    
    // Start speaking
    window.speechSynthesis.speak(speech);
    isSpeaking = true; // Set speaking flag to true
    startBtn.textContent = "Pause"; // Change button text to "Pause"
    statusText.textContent = "Reading..."; // Update status text
});

// Event listener for the Stop button
stopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    isSpeaking = false; // Reset speaking flag
    startBtn.textContent = "Start Reading"; // Reset button text
    statusText.textContent = "Reading stopped"; // Update status text
});

// Event listener for when speech ends
speech.onend = () => {
    isSpeaking = false; // Reset speaking flag
    startBtn.textContent = "Start Reading"; // Reset button text
    statusText.textContent = "Reading completed"; // Update status text
};

// Event listener for speech errors
speech.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
    statusText.textContent = `Error: ${event.error}. Please try again.`;
    isSpeaking = false;
    startBtn.textContent = "Start Reading";
};