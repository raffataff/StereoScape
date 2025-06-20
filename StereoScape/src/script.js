// This file contains the JavaScript code that handles the functionality of the StereoScape application.
// It manages audio file uploads, playback controls, and visualizations.

document.addEventListener('DOMContentLoaded', () => {
    const audioFileInput = document.getElementById('audioFileInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const clearButton = document.getElementById('clearButton');
    const audioFileNameDisplay = document.getElementById('audioFileNameDisplay');
    const audioDurationDisplay = document.getElementById('audioDurationDisplay');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const pauseIndicator = document.getElementById('pauseIndicator');
    const frequencyThresholdDisplay = document.getElementById('frequencyThresholdDisplay');
    const frequencyZoomSlider = document.getElementById('frequencyZoomSlider');
    const frequencyZoomValue = document.getElementById('frequencyZoomValue');
    const leftChannelCanvas = document.getElementById('leftChannelCanvas');
    const rightChannelCanvas = document.getElementById('rightChannelCanvas');
    
    let audioContext;
    let audioBuffer;
    let sourceNode;
    let analyserNode;
    let isPlaying = false;

    audioFileInput.addEventListener('change', handleFileUpload);
    analyzeButton.addEventListener('click', playAudio);
    pauseButton.addEventListener('click', pauseAudio);
    stopButton.addEventListener('click', stopAudio);
    clearButton.addEventListener('click', clearAudio);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            audioFileNameDisplay.textContent = `File: ${file.name}`;
            const reader = new FileReader();
            reader.onload = function(e) {
                initAudioContext(e.target.result);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function initAudioContext(arrayBuffer) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            audioBuffer = buffer;
            audioDurationDisplay.textContent = `Duration: ${buffer.duration.toFixed(2)} seconds`;
            analyzeButton.disabled = false;
        });
    }

    function playAudio() {
        if (!audioBuffer) return;
        sourceNode = audioContext.createBufferSource();
        analyserNode = audioContext.createAnalyser();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
        sourceNode.start(0);
        isPlaying = true;
        updateCurrentTime();
        pauseIndicator.style.display = 'none';
        analyzeButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;
        clearButton.disabled = false;

        sourceNode.onended = () => {
            isPlaying = false;
            analyzeButton.disabled = false;
            pauseButton.disabled = true;
            stopButton.disabled = true;
            clearButton.disabled = false;
        };
    }

    function pauseAudio() {
        if (isPlaying) {
            audioContext.suspend();
            isPlaying = false;
            pauseIndicator.style.display = 'block';
            pauseButton.disabled = true;
            analyzeButton.disabled = false;
        }
    }

    function stopAudio() {
        if (sourceNode) {
            sourceNode.stop();
            isPlaying = false;
            analyzeButton.disabled = false;
            pauseButton.disabled = true;
            stopButton.disabled = true;
            clearButton.disabled = false;
        }
    }

    function clearAudio() {
        audioFileInput.value = '';
        audioFileNameDisplay.textContent = '';
        audioDurationDisplay.textContent = '';
        currentTimeDisplay.textContent = '';
        pauseIndicator.style.display = 'none';
        analyzeButton.disabled = true;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        clearButton.disabled = true;
    }

    function updateCurrentTime() {
        if (isPlaying) {
            currentTimeDisplay.textContent = `Current Time: ${audioContext.currentTime.toFixed(2)} seconds`;
            requestAnimationFrame(updateCurrentTime);
        }
    }

    frequencyZoomSlider.addEventListener('input', () => {
        frequencyZoomValue.textContent = frequencyZoomSlider.value;
    });
});