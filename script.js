// Define an object to store canvas attributes for each visualization
const visualizationCanvasAttributes = {
    bars: {
        leftCanvasRotation: Math.PI / 2, //  degrees in radians
        rightCanvasRotation: Math.PI / 2, // degrees in radians
        leftCanvasScaleX: -1, // No scaling for the left canvas
        rightCanvasScaleX: -1, // Flip the X-axis for the right canvas
        leftCanvasScaleY: -1, // No scaling for the left canvas
        rightCanvasScaleY: 1, // No scaling for the right canvas
        leftCanvasWidth: 800,
        leftCanvasHeight: 720,
        rightCanvasWidth: 800,
        rightCanvasHeight: 720,
    },

    heatMap: {
        leftCanvasRotation: Math.PI / 2, //  degrees in radians
        rightCanvasRotation: Math.PI / 2, // degrees in radians
        leftCanvasScaleX: -1, // No scaling for the left canvas
        rightCanvasScaleX: -1, // Flip the X-axis for the right canvas
        leftCanvasScaleY: -1, // No scaling for the left canvas
        rightCanvasScaleY: 1, // No scaling for the right canvas
        leftCanvasWidth: 800,
        leftCanvasHeight: 720,
        rightCanvasWidth: 800,
        rightCanvasHeight: 720,
    }, 


    frequencyConstellation: {
        leftCanvasRotation: 0, // No rotation for the left canvas
        rightCanvasRotation: 0, // No rotation for the right canvas
        leftCanvasScaleX: 1, // No scaling for the left canvas
        leftCanvasScaleY: 1, // No scaling for the left canvas
        rightCanvasScaleX: 1, // No scaling for the right canvas
        rightCanvasScaleY: 1, // No scaling for the right canvas
        leftCanvasWidth: 800,
        leftCanvasHeight: 800,
        rightCanvasWidth: 800,
        rightCanvasHeight: 800,
    },


    particleFlow: {
        leftCanvasRotation: 0, // No rotation for the left canvas
        rightCanvasRotation: 0, // No rotation for the right canvas
        leftCanvasScaleX: 1, // No scaling for the left canvas
        leftCanvasScaleY: 1, // No scaling for the left canvas
        rightCanvasScaleX: 1, // No scaling for the right canvas
        rightCanvasScaleY: 1, // No scaling for the right canvas
        leftCanvasWidth: 800,
        leftCanvasHeight: 990,
        rightCanvasWidth: 800,
        rightCanvasHeight: 990,
    },

    frequencyPolygon: {
        leftCanvasRotation: 0, // No rotation for the left canvas
        rightCanvasRotation: 0, // No rotation for the right canvas
        leftCanvasScaleX: 1, // No scaling for the left canvas
        leftCanvasScaleY: 1, // No scaling for the left canvas
        rightCanvasScaleX: 1, // No scaling for the right canvas
        rightCanvasScaleY: 1, // No scaling for the right canvas
        leftCanvasWidth: 800,
        leftCanvasHeight: 800,
        rightCanvasWidth: 800,
        rightCanvasHeight: 800,
    },

      overlayVisualizer: {
        leftCanvasRotation: 0,
        rightCanvasRotation: 0,
        leftCanvasScaleX: 1,
        leftCanvasScaleY: 1,
        rightCanvasScaleX: 1,
        rightCanvasScaleY: 1,
        leftCanvasWidth: 800,
        leftCanvasHeight: 800,
        rightCanvasWidth: 800,
        rightCanvasHeight: 800,
      },

};

const offscreenCanvases = {
    bars: {
        left: {
            canvas: new OffscreenCanvas(800, 720),
            ctx: null,
        },
        right: {
            canvas: new OffscreenCanvas(800, 720),
            ctx: null,
        },
    },
    heatMap: {
        left: {
            canvas: new OffscreenCanvas(800, 720),
            ctx: null,
        },
        right: {
            canvas: new OffscreenCanvas(800, 720),
            ctx: null,
        },
    },

    frequencyConstellation: {
        left: {
            canvas: new OffscreenCanvas(800, 800),
            ctx: null,
        },
        right: {
            canvas: new OffscreenCanvas(800, 800),
            ctx: null,
        },
    },

    particleFlow: {
        left: {
            canvas: new OffscreenCanvas(800, 990),
            ctx: null,
        },
        right: {
            canvas: new OffscreenCanvas(800, 990),
            ctx: null,
        },
    },

    frequencyPolygon: {
        left: {
            canvas: new OffscreenCanvas(800, 800),
            ctx: null,
        },
        right: {
            canvas: new OffscreenCanvas(800, 800),
            ctx: null,
        },
    },

      overlayVisualizer: {
        left: {
          canvas: new OffscreenCanvas(800, 800),
          ctx: null,
        },
        right: {
          canvas: new OffscreenCanvas(800, 800),
          ctx: null,
        },
      },
  
};

const FREQUENCY_RANGES = [
    { name: 'bass', min: 0, max: 200 },
    { name: 'midLow', min: 201, max: 800 },
    { name: 'mid', min: 801, max: 2000 },
    { name: 'midHigh', min: 2001, max: 8000 },
    { name: 'treble', min: 8001, max: 22000 }
];

let bassVolume = 0;
let midLowVolume = 0;
let midVolume = 0;
let midHighVolume = 0;
let trebleVolume = 0;
let totalVolume = bassVolume + midLowVolume + midVolume + midHighVolume + trebleVolume;
const smoothingFactor = 0.8;

const aiMage = {
    audioContext: null,
    audioBuffer: null,
    audioSource: null,
    leftChannelCanvas: null,
    rightChannelCanvas: null,
    leftCtx: null,
    rightCtx: null,
    visualizationType: 'bars',
    animationFrameId: null,
    analyserNode: null,
    bufferLength: 0,
    audioData: null,
    leftChannelData: null,
    rightChannelData: null,
    isPaused: false,
    frequencyLabels: [],
    colorMap: 'volume',
    pausedTime: 0,
    decibelThreshold: -0.1,
    exceededFrequencies: [],
    maxPointWidthLeft: 1.2,
    maxPointWidthRight: 1.2,
    maxBarHeightLeft: 1.6,
    maxBarHeightRight: 1.6,
    maxFreq: 22000,
    zoomValue: 1,
    leftTimeDomainData: null,
    rightTimeDomainData: null,
    startTime: 0,
    previousTime: 0,
    frequencyColorThreshold: 10, // New property to control the threshold for frequency color
    trailOpacity: 0.7,
    polygonSmoothingFactor: 0.7,
    particleFlowSmoothingFactor: 0.9,

   

    setupAudioContext: function () {
        // Create a new AudioContext instance
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create an AnalyserNode to analyze the audio data
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserNode.minDecibels = -60;
        this.analyserNode.maxDecibels = 0;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.audioData = new Uint8Array(this.bufferLength);
        

        // Log the min and max decibels to console
        console.log('AnalyserNode minDecibels:', this.analyserNode.minDecibels);
        console.log('AnalyserNode maxDecibels:', this.analyserNode.maxDecibels);

        // Create a channel splitter to split the audio into separate channels
        const channelSplitter = this.audioContext.createChannelSplitter(2);

        // Resume the AudioContext after it has been suspended (for autoplay policies)
        this.audioContext
            .resume()
            .then(() => {
                console.log('AudioContext resumed successfully');
                enableButtons(); // Enable buttons after AudioContext is resumed
            })
            .catch((error) => {
                console.error('Error resuming AudioContext:', error);
            });

        return channelSplitter;
    },

    createAudioSource: function () {
        // Create a channel splitter
        const channelSplitter = this.audioContext.createChannelSplitter(2);

        // Create two analyser nodes, one for each channel
        const leftAnalyser = this.audioContext.createAnalyser();
        const rightAnalyser = this.audioContext.createAnalyser();

        // Create a new audio source node from the audio buffer
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;

        // Connect the audio source to the channel splitter
        this.audioSource.connect(channelSplitter);

        // Connect the left output of the splitter to the left analyser
        channelSplitter.connect(leftAnalyser, 0, 0);

        // Connect the right output of the splitter to the right analyser
        channelSplitter.connect(rightAnalyser, 1, 0);

        // Save the analysers to the app object
        this.leftAnalyser = leftAnalyser;
        this.rightAnalyser = rightAnalyser;

        // Start the source
        this.audioSource.start();
    },

    analyzeAudio: function () {
        // Create a new audio source node from the audio buffer
        createNewAudioSource();
    
        // Initialize the channel data arrays
        aiMage.leftChannelData = new Uint8Array(aiMage.bufferLength);
        aiMage.rightChannelData = new Uint8Array(aiMage.bufferLength);
    
        // Time data
        aiMage.leftTimeDomainData = new Float32Array(aiMage.bufferLength);
        aiMage.rightTimeDomainData = new Float32Array(aiMage.bufferLength);
    
        // Reset the start time and previous time
        aiMage.startTime = aiMage.audioContext.currentTime;
        aiMage.previousTime = 0;
    
        // Clear the visible canvases
        aiMage.leftCtx.clearRect(0, 0, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
        aiMage.rightCtx.clearRect(0, 0, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);
    
        // Clear the offscreen canvases
        clearAllCanvases();
    
        // Reset the current time display
        resetCurrentTimeDisplay();
    
        // Start playing the audio source
        aiMage.audioSource.start(0);
    
        // Generate frequency labels for the visualization
        generateFrequencyLabels();
    
        // Initialize the arc data arrays with the correct starting angles
        const initialCurrentTime = aiMage.audioContext.currentTime - aiMage.startTime;
        const duration = aiMage.audioBuffer.duration;
        aiMage.leftArcData = new Array(aiMage.bufferLength).fill(0).map(() => mapRange(initialCurrentTime, 0, duration, -Math.PI / 2, Math.PI / 2));
        aiMage.rightArcData = new Array(aiMage.bufferLength).fill(0).map(() => mapRange(initialCurrentTime, 0, duration, -Math.PI / 2, Math.PI / 2));

    
        // Start drawing the visualization
        drawVisualization();
    },
};
// Helper functions

function createOffscreenCanvasContexts() {
    for (const visualizerType in offscreenCanvases) {
        const visualizer = offscreenCanvases[visualizerType];
        visualizer.left.ctx = visualizer.left.canvas.getContext('2d');
        visualizer.right.ctx = visualizer.right.canvas.getContext('2d');
    }
}

function calculateChannelAverage(channelData) {
    const sum = channelData.reduce((acc, val) => acc + val, 0);
    return sum / channelData.length;
}

function calculatePanning(leftAverage, rightAverage) {
    const difference = leftAverage - rightAverage;
    const sum = leftAverage + rightAverage;
    const normalizedDifference = difference / (sum || 1); // Divide by sum or 1 to prevent division by zero
    return normalizedDifference;
}

function mapRange(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
}

function smoothFrequencyData(data) {
    // Apply smoothing to the frequency data
    const smoothingFactor = 0.5;
    const length = data.length;
    const smoothedData = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        const prev = i === 0 ? 0 : smoothedData[i - 1];
        smoothedData[i] = Math.round(prev * smoothingFactor + data[i] * (1 - smoothingFactor));
    }

    data.set(smoothedData);
}

function getChannelVolume(data) {
    // Reduce data array to get total volume
    return data.reduce((a, b) => a + b, 0);
}

function mapVolumeToHeight(vol, height) {
    // Get volume as percentage of maximum (256)
    let volPercent = vol / 256;

    // Map percentage to canvas height
    return volPercent * height;
}

function mapVolumeToWidth(vol, width) {
    // Get volume as percentage of maximum (256)
    let volPercent = vol / 256;

    // Map percentage to canvas width
    return volPercent * width;
}


function volumeToDecibels(volume) {
    const minDecibels = aiMage.analyserNode.minDecibels;
    const maxDecibels = aiMage.analyserNode.maxDecibels;

    // Convert the volume to a linear scale between 0 and 1
    const linearVolume = volume / 255;

    // Map the linear volume to the decibel range
    const decibels = mapRange(linearVolume, 0, 1, minDecibels, maxDecibels, true);

    return decibels;
}

function getFrequencyData() {
    aiMage.leftAnalyser.getByteFrequencyData(aiMage.leftChannelData);
    aiMage.rightAnalyser.getByteFrequencyData(aiMage.rightChannelData);

    // Calculate frequency ranges for each channel
    const frequencyRanges = [
        { name: 'bass', min: 0, max: 200 },
        { name: 'midLow', min: 200, max: 800 },
        { name: 'mid', min: 800, max: 2000 },
        { name: 'midHigh', min: 2000, max: 8000 },
        { name: 'treble', min: 8000, max: 22000 }
    ];

    aiMage.leftFrequencyRanges = calculateFrequencyRanges(aiMage.leftChannelData, frequencyRanges);
    aiMage.rightFrequencyRanges = calculateFrequencyRanges(aiMage.rightChannelData, frequencyRanges);
}

function calculateFrequencyRanges(channelData, frequencyRanges) {
    const numFrequencies = channelData.length;
    const sampleRate = aiMage.audioContext.sampleRate;
    const frequencySize = sampleRate / 2 / numFrequencies;

    frequencyRanges.forEach(range => {
        const startIndex = Math.floor(range.min / frequencySize);
        const endIndex = Math.floor(range.max / frequencySize);
        const rangeData = channelData.slice(startIndex, endIndex + 1);
        const average = rangeData.reduce((sum, value) => sum + value, 0) / rangeData.length;

        // Update the global variables based on the frequency range
        switch (range.name) {
            case 'bass':
                bassVolume = average;
                break;
            case 'midLow':
                midLowVolume = average;
                break;
            case 'mid':
                midVolume = average;
                break;
            case 'midHigh':
                midHighVolume = average;
                break;
            case 'treble':
                trebleVolume = average;
                break;
        }
    });
}

function getFrequencyRangeData(channelData, minFrequency, maxFrequency) {
    const sampleRate = aiMage.audioContext.sampleRate;
    const numFrequencies = channelData.length;
    const frequencySize = sampleRate / 2 / numFrequencies;


    const startIndex = Math.floor(minFrequency / frequencySize);
    const endIndex = Math.floor(maxFrequency / frequencySize);


    const rangeData = channelData.slice(startIndex, endIndex + 1);

    return rangeData;
}

function generateFrequencyLabels(zoomValue = 1) {
    const minFreq = 0;
    const maxFreq = 22000 * zoomValue;
    const numLabels = 22;
    const freqRange = maxFreq - minFreq;

    aiMage.frequencyLabels = [];

    for (let i = 0; i <= numLabels; i++) {
        const freq = mapRange(i, 0, numLabels, minFreq, maxFreq, true);
        const label = Math.round(freq) + ' Hz';
        aiMage.frequencyLabels.push(label);
    }
}

function drawFrequencyLabels(ctx, canvas, labels, canvasSide) {
    const numLabels = labels.length;
    const labelWidth = 100;
    const labelFontSize = 12;
    const labelPadding = 0;

    ctx.font = `${labelFontSize}px Arial`;
    ctx.fillStyle = 'rgb(0, 145, 145)';
    ctx.textBaseline = 'middle';

    if (canvasSide === 'left') {
        ctx.textAlign = 'right';
        for (let i = 0; i < numLabels; i++) {
            const x = labelPadding + 50;
            const y = mapRange(i, 0, numLabels - 1, canvas.height - labelPadding, (labelPadding - 60));
            ctx.fillText(labels[i], x - labelPadding, y);
        }
    } else if (canvasSide === 'right') {
        ctx.textAlign = 'left';
        for (let i = 0; i < numLabels; i++) {
            const x = canvas.width - labelPadding - labelWidth;
            const y = mapRange(i, 0, numLabels - 1, canvas.height - labelPadding, labelPadding - 60);
            ctx.fillText(labels[i], x + labelPadding, y);
        }
    }
}

function drawGrid(ctx, canvas, labels, canvasSide) {
    const numLabels = labels.length ;
    const labelWidth = 0;
    const labelPadding = 0;
    const gridColor = 'rgba(200, 120, 120, 0.01)'; // Light gray color for the grid
    const mainLineWidth = 1; // Width of the main grid lines
    const subdivisionLineWidth = 2; // Width of the subdivision lines

    ctx.save();
    ctx.strokeStyle = gridColor;

    // Draw horizontal lines
    ctx.beginPath();
    for (let i = 0; i <= numLabels; i++) {
        const y = mapRange(i, 0, numLabels, 0, canvas.height);
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }

    // Draw vertical lines
    ctx.beginPath();
    if (canvasSide === 'left') {
        for (let i = 0; i <= labelWidth + labelPadding; i += 10) {
            const x = i*-1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);

            if (i === 0 || i === labelWidth + labelPadding) {
                ctx.lineWidth = mainLineWidth; // Thicker line for the left and right edges
            } else {
                ctx.lineWidth = subdivisionLineWidth; // Thinner line for subdivisions
            }

            ctx.stroke();
        }
    } else if (canvasSide === 'right') {
        for (let i = canvas.width - labelWidth - labelPadding; i <= canvas.width; i += 10) {
            const x = i * -1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);

            if (i === canvas.width - labelWidth - labelPadding || i === canvas.width) {
                ctx.lineWidth = mainLineWidth; // Thicker line for the left and right edges
            } else {
                ctx.lineWidth = subdivisionLineWidth; // Thinner line for subdivisions
            }

            ctx.stroke();
        }
    }

    ctx.restore();
}

function updateFrequencyZoom(zoomValue) {
    const maxFreq = 22000;
    const minFreq = 0;

    const newMaxFreq = minFreq + (maxFreq - minFreq) * zoomValue;
    // Update the maxFreq value in the drawLeftChannelBars function
    aiMage.maxFreqLeft = newMaxFreq;
    // Update the maxFreq value in the drawRightChannelBars function
    aiMage.maxFreqRight = newMaxFreq;


    // Calculate the maxPointWidth based on the zoom value (scaled from 1 to 2)
    const maxPointWidth = mapRange(zoomValue, 0, 1, 0.01, 1.2);
    // Update the maxPointWidth value in the drawLeftHeatMap function
    aiMage.maxPointWidthLeft = maxPointWidth;
    // Update the maxPointWidth value in the drawRightHeatMap function
    aiMage.maxPointWidthRight = maxPointWidth;


    // Calculate maxBarHeight based on the zoom value (scaled from 1.7 to 5)
    const maxBarHeight = mapRange(zoomValue, 0, 1, 10, 1.6);
    aiMage.maxBarHeightLeft = maxBarHeight;
    aiMage.maxBarHeightRight = maxBarHeight;


    // Generate frequency labels based on the new zoom value
    generateFrequencyLabels(zoomValue);
}
         
function getColorForFrequency(frequency, volume, colorMode, frequencyRanges, barWidth) {
    const currentTime = aiMage.audioContext.currentTime - aiMage.startTime;

    if (typeof frequency === 'number' && Number.isInteger(frequency) && frequency >= 0 && frequency < 5) {
        // If frequency is an index (0-4), map it to a color based on the index
        const hue = mapRange(frequency, 0, 4, 0, 360);
        return `hsl(${hue}, 80%, 50%)`;
    }

    if (colorMode === 'rainbow') {
        const hue = (frequency / 22000) *( midHighVolume * 10) - 300;
        const saturation = mapRange(bassVolume, 0, 255, 30, 100);
        return `hsl(${hue}, ${saturation}%, 50%)`;
        
    } else if (colorMode === 'volume') {
        const minVolume = 0;
        const maxVolume = 255;
        const normalizedVolume = Math.max(0, Math.min(1, (volume - minVolume) / (maxVolume - minVolume)));
        const hue = mapRange(normalizedVolume, 0, 1, 120, 0); // Green to red hue range
        return `hsl(${hue}, 80%, 50%)`;

    } else if (colorMode === 'sight') {
        const brightness = Math.round((barWidth / 255) * 255) + 10;
        const saturation = midVolume / 255 * 100 + 25; 
        return `rgb(${brightness}, ${saturation}, ${brightness})`;

    } else if (colorMode === 'electric') {
        const hue = (frequency / 22000) * 360;
        const saturation = Math.min(100, bassVolume / 255 * 100 + 25); // Increase saturation based on volume
        const lightness = Math.min(50, midVolume / 255 * 50 + 25); // Increase lightness based on volume
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    } else if (colorMode === 'temporal') {
        return getTemporalColor(frequency, volume, currentTime);

    } else if (colorMode === 'frequencyRange') {
        const hue = (frequency / 22000) * bassVolume + currentTime + trebleVolume;
        const saturation = Math.min(100, bassVolume / 255 * 100 + 25); // Increase saturation based on volume
        const lightness = Math.min(50, bassVolume / 255 * 50 + 25); // Increase lightness based on volume
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    } else if (colorMode === 'exceededFrequency') {
        return getExceededFrequencyColor(frequency);
    
    } else if (colorMode === 'smile') {
        const minVolume = midHighVolume;
        const maxVolume = trebleVolume;
        const normalizedVolume = Math.max(0, Math.min(1, (bassVolume - minVolume) / (maxVolume - minVolume)));
        const hue = mapRange(normalizedVolume, 0, 10, 240, 120); // Green to red hue range
        return `hsl(${hue}, 80%, 50%)`;
        
    }

    return 'volume'; // Default color if colorMode is not recognized
}

// Helper function to convert hex color to HSL
function hexToHSL(hex) {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

// Helper function to convert HSL color to hex
function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


const frequencyColorMap = new Map();
const colorChangeThresholds = {
    green: 1,
    yellow: 5,
    orange: 10,
    red: 15,
};

function getExceededFrequencyColor(frequency) {
    const roundedFrequency = Math.round(frequency);
    const exceededCount = frequencyColorMap.get(roundedFrequency) || 0;

    if (exceededCount >= colorChangeThresholds.red) {
        return 'hsl(0, 100%, 50%)'; // Red with 100% saturation
    } else if (exceededCount >= colorChangeThresholds.orange) {
        return 'hsl(30, 100%, 50%)'; // Orange with 100% saturation
    } else if (exceededCount >= colorChangeThresholds.yellow) {
        return 'hsl(60, 100%, 50%)'; // Yellow with 100% saturation
    } else if (exceededCount >= colorChangeThresholds.green) {
        return 'hsl(120, 100%, 50%)'; // Green with 100% saturation
    } else {
        return 'hsl(120, 100%, 50%)'; // Green with 100% saturation
    }
}

function colorizeFrequencies(listElement) {
    const frequencies = Array.from(listElement.querySelectorAll('li')).map(li => parseInt(li.textContent.replace(' Hz', '')));
    const frequencyCounts = {};

    // Count the occurrences of each frequency
    frequencies.forEach(freq => {
        frequencyCounts[freq] = (frequencyCounts[freq] || 0) + 1;
    });

    // Color the frequencies based on the number of occurrences and the threshold
    listElement.querySelectorAll('li').forEach(li => {
        const freq = parseInt(li.textContent.replace(' Hz', ''));
        const count = frequencyCounts[freq];
        const maxCount = Math.max(...Object.values(frequencyCounts));
        const hue = mapRange(count, 1, Math.max(aiMage.frequencyColorThreshold, maxCount), 120, 0); // Green to red hue range
        li.style.color = `hsl(${hue}, 60%, 50%)`;
    });
}

function getTemporalColor(frequency, volume, currentTime) {
    // Map the frequency to a base hue value between 0 and 360
    const baseHue = mapRange(frequency, 0, 22000, 0, 360);

    // Calculate a time factor between 0 and 1 based on the current time
    const timeFactor = mapRange(currentTime, 0, aiMage.audioBuffer.duration, 0, 1);

    // Calculate a volume factor between 0 and 1 based on the volume
    const volumeFactor = mapRange(volume, 0, 255, 0, 1);

    // Combine the base hue, time factor, and volume factor to get the final hue
    const hue = (baseHue + (timeFactor * 360) + (volumeFactor * 360)) % 360;

    // Map the volume to a saturation value between 50 and 100
    const saturation = mapRange(volume, 0, 255, 50, 100);

    // Map the current time to a lightness value between 25 and 75
    const lightness = mapRange(midLowVolume, 0, 255, 25, 90);

    // Return the color in the HSL format
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}





// Optimization of the psychedelic background using an off-screen canvas
const psychedelicBackgroundCanvas = {
    left: document.createElement('canvas'),
    right: document.createElement('canvas')
};

function drawPsychedelicBackground(ctx, channelData, width, height) {
    const offscreenCanvas = psychedelicBackgroundCanvas[ctx === aiMage.leftCtx ? 'left' : 'right'];
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Adjustable parameters
    const maxDotsPerRange = 50; // Maximum number of dots allowed per range
    const maxDotSize = 100; // Maximum size a dot can grow to
    const dotGrowthRate = 0.05; // Rate at which the dots grow based on amplitude
    const dotInterval = 5000; // Interval in milliseconds (10 seconds)

    // Initialize dots array if not already done
    if (!offscreenCtx.dots) {
        offscreenCtx.dots = [];
        offscreenCtx.lastDotUpdate = Date.now();
        offscreenCtx.startTime = Date.now();
    }

    // Clear the off-screen canvas
    offscreenCtx.clearRect(0, 0, width, height);

    // Calculate the elapsed time since the background started
    const elapsedTime = Date.now() - offscreenCtx.startTime;

    // Define the color ranges based on the Constellation visualization
    const frequencyRanges = [
        { name: 'bass', color: '#FF00FF', start: 0, end: 0.00909, threshold: 0.82 },
        { name: 'midLow', color: '#00FFFF', start: 0.00913, end: 0.03636, threshold: 0.75 },
        { name: 'mid', color: '#FFFF00', start: 0.03640, end: 0.09090, threshold: 0.7 },
        { name: 'midHigh', color: '#00FF00', start: 0.09095, end: 0.36363, threshold: 0.65 },
        { name: 'treble', color: '#FF8000', start: 0.36368, end: 1, threshold: 0.58 }
      ]

    // Check if it's time to add new dots
    const currentTime = Date.now();
    if (currentTime - offscreenCtx.lastDotUpdate >= dotInterval) {
        // Assign dots to frequency ranges
        for (let i = 0; i < frequencyRanges.length; i++) {
            const range = frequencyRanges[i];
            const rangeData = getFrequencyRangeData(channelData, range.start * channelData.length, range.end * channelData.length);
            const averageAmplitude = getAverageAmplitude(rangeData);

            // Add dots to the range if the maximum limit is not reached
            if (offscreenCtx.dots.filter(dot => dot.rangeIndex === i).length < maxDotsPerRange) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const dot = {
                    x: x,
                    y: y,
                    size: 1,
                    rangeIndex: i,
                    color: range.color,
                    lightness: 50, // Initialize lightness to a default value
                    saturation: 50 // Initialize saturation to a default value
                };
                offscreenCtx.dots.push(dot);
            }
        }

        // Update the last dot update timestamp
        offscreenCtx.lastDotUpdate = currentTime;
    }

    // Update and draw dots
    for (let i = 0; i < offscreenCtx.dots.length; i++) {
        const dot = offscreenCtx.dots[i];
        const range = frequencyRanges[dot.rangeIndex];
        const rangeData = getFrequencyRangeData(channelData, range.start * channelData.length, range.end * channelData.length);
        const averageAmplitude = getAverageAmplitude(rangeData);

        // Update dot size based on amplitude
        dot.size += averageAmplitude / 255 * dotGrowthRate;
        dot.size = Math.min(dot.size, maxDotSize);

        // Remove dot when reached maximum size
        if (dot.size >= maxDotSize) {
            offscreenCtx.dots.splice(i, 1);
            i--;
            continue;
        }


        // Calculate the lightness and saturation based on elapsed time
        const minLightness = mapRange(elapsedTime, 0, 30000, 30, 70);
        const maxLightness = mapRange(elapsedTime, 30000, 600000, 70, 100);
        const minSaturation = mapRange(elapsedTime, 0, 30000, 50, 100);
        const maxSaturation = mapRange(elapsedTime, 30000, 600000, 100, 100);

         // Calculate the lightness and saturation for the current dot
         const targetLightness = mapRange(averageAmplitude, 0, 255, minLightness, maxLightness);
         const targetSaturation = mapRange(averageAmplitude, 0, 255, minSaturation, maxSaturation);
 
         // Apply smoothing to the lightness and saturation values
         const smoothingFactor = 0.1; // Adjust this value to control the smoothing amount
         dot.lightness += (targetLightness - dot.lightness) * smoothingFactor;
         dot.saturation += (targetSaturation - dot.saturation) * smoothingFactor;
 
         // Update the dot color based on the range color and smoothed lightness/saturation
         const hsl = hexToHSL(dot.color);
         hsl.l = dot.lightness;
         hsl.s = dot.saturation;
         dot.color = hslToHex(hsl.h, hsl.s, hsl.l);

        // Set the global composite operation to 'multiply'
        offscreenCtx.globalCompositeOperation = 'multiply';

        // Draw the dot on the off-screen canvas
        offscreenCtx.beginPath();
        offscreenCtx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        offscreenCtx.fillStyle = dot.color;
        offscreenCtx.fill();

        // Reset the global composite operation
     //   offscreenCtx.globalCompositeOperation = 'source-atop';

    }

    // Draw the off-screen canvas onto the main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);
}

  function getBackgroundColor(frequencyData) {
    const overallVolume = getAverageVolume(frequencyData);
    const hue = mapRange(overallVolume, 0, 255, 120, 360);
    return `hsl(${hue}, 50%, 10%)`;
  }
  
  function getRippleColor(frequencyRangeIndex) {
    const hues = [0, 90, 180, 270, 360];
    const hue = hues[frequencyRangeIndex];
    return `hsl(${hue}, 100%, 50%)`;
  }
  
  function getAmplitudeFromTimeDomainData(timeDomainData) {
    const sumOfSquares = timeDomainData.reduce((sum, value) => sum + value * value, 0);
    const amplitude = Math.sqrt(sumOfSquares / timeDomainData.length);
    return amplitude;
  }
  
  function getAverageVolume(frequencyData) {
    const sum = frequencyData.reduce((acc, value) => acc + value, 0);
    return sum / frequencyData.length;
  }
 

function drawVisualization(frequencyRanges, channelData) {
    // Get the frequency data for the left and right channels
    getFrequencyData();
    getTimeDomainData();

    // Calculate average amplitude for left and right channels
    const leftAverage = calculateChannelAverage(aiMage.leftChannelData);
    const rightAverage = calculateChannelAverage(aiMage.rightChannelData);
    // Calculate panning value
    const panningValue = calculatePanning(leftAverage, rightAverage);
    // Map panning value to a range of 0 to 1
    const mappedPanning = mapRange(panningValue, -1, 1, 0, 1);
    const currentTime = aiMage.audioContext.currentTime - aiMage.startTime;

    // Check if the current time has reached or exceeded the song length
    if (currentTime >= aiMage.audioBuffer.duration) {
        stopAudio();
        return; // Exit the function to prevent further execution
    }

    // Update the current time display every second
    if (Math.floor(currentTime) !== Math.floor(aiMage.previousTime)) {
        displayCurrentTime(currentTime);
        aiMage.previousTime = currentTime;
    }

    // Check for exceeded frequencies for the left channel
    checkExceededFrequenciesLeft(aiMage.leftChannelData, aiMage.audioContext.sampleRate);

    // Check for exceeded frequencies for the right channel
    checkExceededFrequenciesRight(aiMage.rightChannelData, aiMage.audioContext.sampleRate);


   // Update panning indicator circle
   const panningCircle = document.getElementById('panningCircle');
   const panningIndicatorWidth = document.querySelector('.panning-indicator').offsetWidth;

   const leftVolume = calculateChannelAverage(aiMage.leftChannelData);
   const rightVolume = calculateChannelAverage(aiMage.rightChannelData);
   const totalVolume = leftVolume + rightVolume;

   const newPanningValue = calculatePanning(leftVolume, rightVolume);
   const mappedPanningValue = mapRange(newPanningValue, -1, 1, 2, 0); // Map panning value to the range of 0 to 2

   const circlePosition = (mappedPanningValue / 2) * panningIndicatorWidth; // Map the panning value to the circle position

   panningCircle.style.left = `${circlePosition}px`;
   // Color the circle based on the volume
   const volumeColor = getColorForFrequency(0, totalVolume, 'volume');
   panningCircle.style.backgroundColor = volumeColor;
    
    // Get the canvas attributes based on the selected visualization type
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    // Check if the canvas attributes are defined for the selected visualization type
    if (canvasAttributes) {
        // Apply the canvas dimensions
        aiMage.leftChannelCanvas.width = canvasAttributes.leftCanvasWidth;
        aiMage.leftChannelCanvas.height = canvasAttributes.leftCanvasHeight;
        aiMage.rightChannelCanvas.width = canvasAttributes.rightCanvasWidth;
        aiMage.rightChannelCanvas.height = canvasAttributes.rightCanvasHeight;

        // Apply the canvas rotations and transformations
        aiMage.leftChannelCanvas.style.transform = `${canvasAttributes.leftCanvasRotation} ${canvasAttributes.leftCanvasTransform}`;
        aiMage.rightChannelCanvas.style.transform = `${canvasAttributes.rightCanvasRotation} ${canvasAttributes.rightCanvasTransform}`;
    }

    // Check the state of the psychedelic background
    if (psychedelicBackgroundEnabled) {
        // Enable the psychedelic background
        enablePsychedelicBackground();
    } else {
        // Disable the psychedelic background
        disablePsychedelicBackground();
    }

    
     
    // Check the selected visualization type and call the corresponding function
    switch (aiMage.visualizationType) {
            case 'bars':
                drawBars(currentTime, mappedPanning);
                if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                    aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.bars.left.canvas.transferToImageBitmap());
                } else if (aiMage.leftCtx) {
                    aiMage.leftCtx.drawImage(offscreenCanvases.bars.left.canvas, 0, 0);
                }
                if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                    aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.bars.right.canvas.transferToImageBitmap());
                } else if (aiMage.rightCtx) {
                    aiMage.rightCtx.drawImage(offscreenCanvases.bars.right.canvas, 0, 0);
                }
            break;
            case 'heatMap':
                drawHeatMap(currentTime, mappedPanning);
                if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                    aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.heatMap.right.canvas.transferToImageBitmap());
                } else if (aiMage.rightCtx) {
                    aiMage.rightCtx.drawImage(offscreenCanvases.heatMap.right.canvas, 0, 0);
                }
                if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                    aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.heatMap.left.canvas.transferToImageBitmap());
                } else if (aiMage.leftCtx) {
                    aiMage.leftCtx.drawImage(offscreenCanvases.heatMap.left.canvas, 0, 0);
                }
            break;

            case 'frequencyConstellation':
                drawFrequencyConstellation(currentTime, mappedPanning);
                if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                    aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.frequencyConstellation.left.canvas.transferToImageBitmap());
                } else if (aiMage.leftCtx) {
                    aiMage.leftCtx.drawImage(offscreenCanvases.frequencyConstellation.left.canvas, 0, 0);
                }
                if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                    aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.frequencyConstellation.right.canvas.transferToImageBitmap());
                } else if (aiMage.rightCtx) {
                    aiMage.rightCtx.drawImage(offscreenCanvases.frequencyConstellation.right.canvas, 0, 0);
                }
            break;
            
            case 'particleFlow':
                drawParticleFlow(currentTime, mappedPanning);
                if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                    aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.particleFlow.left.canvas.transferToImageBitmap());
                } else if (aiMage.leftCtx) {
                    aiMage.leftCtx.drawImage(offscreenCanvases.particleFlow.left.canvas, 0, 0);
                }
                if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                    aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.particleFlow.right.canvas.transferToImageBitmap());
                } else if (aiMage.rightCtx) {
                    aiMage.rightCtx.drawImage(offscreenCanvases.particleFlow.right.canvas, 0, 0);
                }
            break;

            case 'frequencyPolygon':
            drawFrequencyPolygon(currentTime, mappedPanning);
            if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.frequencyPolygon.left.canvas.transferToImageBitmap());
            } else if (aiMage.leftCtx) {
                aiMage.leftCtx.drawImage(offscreenCanvases.frequencyPolygon.left.canvas, 0, 0);
            }
            if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.frequencyPolygon.right.canvas.transferToImageBitmap());
            } else if (aiMage.rightCtx) {
                aiMage.rightCtx.drawImage(offscreenCanvases.frequencyPolygon.right.canvas, 0, 0);
            }
            break;

            case 'overlayVisualizer':
                drawOverlayVisualizer(currentTime, mappedPanning);
                if (aiMage.leftCtx && aiMage.leftCtx.transferFromImageBitmap) {
                    aiMage.leftCtx.transferFromImageBitmap(offscreenCanvases.overlayVisualizer.left.canvas.transferToImageBitmap());
                } else if (aiMage.leftCtx) {
                    aiMage.leftCtx.drawImage(offscreenCanvases.overlayVisualizer.left.canvas, 0, 0);
                }
                if (aiMage.rightCtx && aiMage.rightCtx.transferFromImageBitmap) {
                    aiMage.rightCtx.transferFromImageBitmap(offscreenCanvases.overlayVisualizer.right.canvas.transferToImageBitmap());
                } else if (aiMage.rightCtx) {
                    aiMage.rightCtx.drawImage(offscreenCanvases.overlayVisualizer.right.canvas, 0, 0);
                }
            break;

        default:
            drawBars(currentTime);
        }
    
    // Request the next animation frame
    aiMage.animationFrameId = requestAnimationFrame(drawVisualization);
}
          

//// VISUALIZER FUNCTIONS /////////////////////////////////

///////////////////////////////////////////////////////////
function drawOverlayVisualizer(currentTime, mappedPanning) {
    createOffscreenCanvasContexts();
  
    const leftOffscreenCtx = offscreenCanvases.overlayVisualizer.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.overlayVisualizer.right.ctx;
  
    if (leftOffscreenCtx) {
      leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.overlayVisualizer.left.canvas.width, offscreenCanvases.overlayVisualizer.left.canvas.height);
    }
    if (rightOffscreenCtx) {
      rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.overlayVisualizer.right.canvas.width, offscreenCanvases.overlayVisualizer.right.canvas.height);
    }
  
    drawWaveformRibbon(currentTime, mappedPanning);
    drawFrequencyConstellation(currentTime, mappedPanning);
//    drawFrequencyKaleidoscope(currentTime, mappedPanning);
    drawFrequencyPolygon(currentTime, mappedPanning);
    drawFrequencySculpture(currentTime, mappedPanning);
  
    if (aiMage.leftCtx) {
      aiMage.leftCtx.clearRect(0, 0, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
      
      aiMage.leftCtx.globalCompositeOperation = 'screen';
      aiMage.leftCtx.drawImage(offscreenCanvases.frequencyConstellation.left.canvas, 0, 0);
      
      aiMage.leftCtx.drawImage(offscreenCanvases.frequencyPolygon.left.canvas, 0, 0);
      
    }
  
    if (aiMage.rightCtx) {
      aiMage.rightCtx.clearRect(0, 0, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);
      
      aiMage.rightCtx.globalCompositeOperation = 'screen';
      aiMage.rightCtx.drawImage(offscreenCanvases.frequencyConstellation.right.canvas, 0, 0);
      
      aiMage.rightCtx.drawImage(offscreenCanvases.frequencyPolygon.right.canvas, 0, 0);
      
    }
  }
  

////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
function drawFrequencyPolygon(currentTime, panningValue) {
    createOffscreenCanvasContexts();

    const leftOffscreenCtx = offscreenCanvases.frequencyPolygon.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.frequencyPolygon.right.ctx;

    if (leftOffscreenCtx) {
        leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.frequencyPolygon.left.canvas.width, offscreenCanvases.frequencyPolygon.left.canvas.height);
        drawFrequencyPolygonForChannel(leftOffscreenCtx, offscreenCanvases.frequencyPolygon.left.canvas, aiMage.leftChannelData, panningValue, currentTime, 'left');
    }
    if (rightOffscreenCtx) {
        rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.frequencyPolygon.right.canvas.width, offscreenCanvases.frequencyPolygon.right.canvas.height);
        drawFrequencyPolygonForChannel(rightOffscreenCtx, offscreenCanvases.frequencyPolygon.right.canvas, aiMage.rightChannelData, 1 - panningValue, currentTime, 'right');
    }
}

function drawFrequencyPolygonForChannel(ctx, canvas, channelData, panningValue, currentTime, channel) {
    if (ctx) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.9;
        const numVertices = 5; // Number of vertices in the polygon

        // Calculate frequency range averages
        const frequencyRangeAverages = [
            getFrequencyRangeAverage(channelData, 0, 200),
            getFrequencyRangeAverage(channelData, 201, 800),
            getFrequencyRangeAverage(channelData, 801, 2000),
            getFrequencyRangeAverage(channelData, 2001, 8000),
            getFrequencyRangeAverage(channelData, 8001, 22000)
        ];

        const bassRadius = mapRange(frequencyRangeAverages[0], 0, 255, 0, maxRadius * 0.8);
        const midLowRadius = mapRange(frequencyRangeAverages[1], 0, 255, 0, maxRadius * 0.8);
        const midRadius = mapRange(frequencyRangeAverages[2], 0, 255, 0, maxRadius * 0.9);
        const midHighRadius = mapRange(frequencyRangeAverages[3], 0, 255, 0, maxRadius * 0.9);
        const trebleRadius = mapRange(frequencyRangeAverages[4], 0, 255, 0, maxRadius * 0.9);

        const panningSkew = mapRange(panningValue, 0, 1, -Math.PI / 4, Math.PI / 4);
        const timeRotation = ((currentTime * 0.1) + totalVolume * 0.1) * smoothingFactor;

        const vertexAngles = Array.from({ length: numVertices }, (_, i) => (i * Math.PI * 2) / numVertices);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(timeRotation);
        ctx.transform(1, 0, Math.tan(panningSkew), 1, 0, 0);

        // Initialize smoothed radius values
        if (!ctx.smoothedBassRadius) {
            ctx.smoothedBassRadius = bassRadius;
            ctx.smoothedMidLowRadius = midLowRadius;
            ctx.smoothedMidRadius = midRadius;
            ctx.smoothedMidHighRadius = midHighRadius;
            ctx.smoothedTrebleRadius = trebleRadius;
        }

        // Update smoothed radius values
        ctx.smoothedBassRadius = aiMage.polygonSmoothingFactor * ctx.smoothedBassRadius + (1 - smoothingFactor) * bassRadius;
        ctx.smoothedMidLowRadius = aiMage.polygonSmoothingFactor * ctx.smoothedMidLowRadius + (1 - smoothingFactor) * midLowRadius;
        ctx.smoothedMidRadius = aiMage.polygonSmoothingFactor * ctx.smoothedMidRadius + (1 - smoothingFactor) * midRadius;
        ctx.smoothedMidHighRadius = aiMage.polygonSmoothingFactor * ctx.smoothedMidHighRadius + (1 - smoothingFactor) * midHighRadius;
        ctx.smoothedTrebleRadius = aiMage.polygonSmoothingFactor * ctx.smoothedTrebleRadius + (1 - smoothingFactor) * trebleRadius;

        // Draw the polygon using smoothed radius values
        ctx.beginPath();
        ctx.moveTo(ctx.smoothedBassRadius * Math.cos(vertexAngles[0]), ctx.smoothedBassRadius * Math.sin(vertexAngles[0]));
        ctx.lineTo(ctx.smoothedMidLowRadius * Math.cos(vertexAngles[1]), ctx.smoothedMidLowRadius * Math.sin(vertexAngles[1]));
        ctx.lineTo(ctx.smoothedMidRadius * Math.cos(vertexAngles[2]), ctx.smoothedMidRadius * Math.sin(vertexAngles[2]));
        ctx.lineTo(ctx.smoothedMidHighRadius * Math.cos(vertexAngles[3]), ctx.smoothedMidHighRadius * Math.sin(vertexAngles[3]));
        ctx.lineTo(ctx.smoothedTrebleRadius * Math.cos(vertexAngles[4]), ctx.smoothedTrebleRadius * Math.sin(vertexAngles[4]));
        ctx.closePath();

        // Calculate frequency range colors
        const frequencyRangeColors = [
            getColorForFrequency(0, frequencyRangeAverages[0], aiMage.colorMode, FREQUENCY_RANGES),
            getColorForFrequency(1, frequencyRangeAverages[1], aiMage.colorMode, FREQUENCY_RANGES),
            getColorForFrequency(2, frequencyRangeAverages[2], aiMage.colorMode, FREQUENCY_RANGES),
            getColorForFrequency(3, frequencyRangeAverages[3], aiMage.colorMode, FREQUENCY_RANGES),
            getColorForFrequency(4, frequencyRangeAverages[4], aiMage.colorMode, FREQUENCY_RANGES)
        ];

        // Apply color gradient using the pre-calculated colors
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        gradient.addColorStop(0, frequencyRangeColors[0]);
        gradient.addColorStop(0.2, frequencyRangeColors[1]);
        gradient.addColorStop(0.4, frequencyRangeColors[2]);
        gradient.addColorStop(0.6, frequencyRangeColors[3]);
        gradient.addColorStop(1, frequencyRangeColors[4]);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();

        ctx.restore();
    }
}

function getFrequencyRangeAverage(channelData, minFrequency, maxFrequency) {
    const sampleRate = aiMage.audioContext.sampleRate;
    const bufferLength = channelData.length;
    const frequencyBinSize = sampleRate / (bufferLength * 2);

    let sum = 0;
    let count = 0;

    for (let i = 0; i < bufferLength; i++) {
        const frequency = i * frequencyBinSize;
        if (frequency >= minFrequency && frequency <= maxFrequency) {
            sum += channelData[i];
            count++;
        }
    }

    return count > 0 ? sum / count : 0;
}


///////////////////////////////////////////////////////////

function drawParticleFlow(currentTime, panningValue) {
    createOffscreenCanvasContexts();

    const leftOffscreenCtx = offscreenCanvases.particleFlow.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.particleFlow.right.ctx;

    if (leftOffscreenCtx) {
        leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.particleFlow.left.canvas.width, offscreenCanvases.particleFlow.left.canvas.height);
    }
    if (rightOffscreenCtx) {
        rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.particleFlow.right.canvas.width, offscreenCanvases.particleFlow.right.canvas.height);
    }

    drawParticleFlowForChannel(leftOffscreenCtx, offscreenCanvases.particleFlow.left.canvas, aiMage.leftChannelData, panningValue);
    drawParticleFlowForChannel(rightOffscreenCtx, offscreenCanvases.particleFlow.right.canvas, aiMage.rightChannelData, 1 - panningValue);
}

function drawParticleFlowForChannel(ctx, canvas, channelData, panningValue) {
    const numFrequencyRanges = 5;
    const particlesPerRange = 30;
    const particleSpeed = 1;
    const minParticleSize = 1;
    const maxParticleSize = 10;
    const horizontalMovementRange = 2;
    const maxDelay = 100; // Maximum delay in frames

    // Initialize particles array if not already done
    if (!ctx.particles) {
        ctx.particles = [];
        for (let i = 0; i < numFrequencyRanges; i++) {
            for (let j = 0; j < particlesPerRange; j++) {
                ctx.particles.push({
                    x: Math.random() * canvas.width,
                    y: -Math.random() * canvas.height, // Start above the canvas
                    size: minParticleSize,
                    frequencyRangeIndex: i,
                    delay: Math.floor(Math.random() * maxDelay) // Random delay for each drip
                });
            }
        }
    }

    // Update and draw particles
    ctx.particles.forEach(particle => {
        // Decrement delay counter
        particle.delay--;

        // Skip drawing the particle if delay is still active
        if (particle.delay > 0) {
            return;
        }

        const frequencyRange = FREQUENCY_RANGES[particle.frequencyRangeIndex];
        const rangeData = getFrequencyRangeData(channelData, frequencyRange.min, frequencyRange.max);
        const averageAmplitude = getAverageAmplitude(rangeData);

        // Update particle size based on amplitude
        particle.size = mapRange(averageAmplitude, 0, 255, minParticleSize, maxParticleSize);

        // Update particle position
        const horizontalMovement = mapRange(averageAmplitude, 0, 255, 0, horizontalMovementRange);
        particle.x += 0 + horizontalMovement;
        particle.y += particleSpeed;

        // Reset particle position when it reaches the bottom
        if (particle.y > canvas.height) {
            particle.y = -Math.random() * canvas.height; // Start above the canvas
            particle.x = Math.random() * canvas.width;
            particle.delay = Math.floor(Math.random() * maxDelay); // Reset delay for the drip
        }

        // Wrap particle if it leaves the sides of the canvas
        if (particle.x > canvas.width) {
            particle.x = 0;
        } else if (particle.x < 0) {
            particle.x = canvas.width;
        }

        // Get particle color based on kaleidoscope color mode
        const color = getKaleidoscopeColor(particle.frequencyRangeIndex, averageAmplitude, aiMage.kaleidoscopeColorMode);

        // Draw the particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });
}


///////////////////////////////////////////

function drawFrequencyConstellation(currentTime, panningValue) {
    createOffscreenCanvasContexts();

    const leftOffscreenCtx = offscreenCanvases.frequencyConstellation.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.frequencyConstellation.right.ctx;

    if (leftOffscreenCtx) {
        leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.frequencyConstellation.left.canvas.width, offscreenCanvases.frequencyConstellation.left.canvas.height);
        drawFrequencyConstellationForChannel(leftOffscreenCtx, offscreenCanvases.frequencyConstellation.left.canvas, aiMage.leftChannelData, panningValue);
    }
    if (rightOffscreenCtx) {
        rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.frequencyConstellation.right.canvas.width, offscreenCanvases.frequencyConstellation.right.canvas.height);
        drawFrequencyConstellationForChannel(rightOffscreenCtx, offscreenCanvases.frequencyConstellation.right.canvas, aiMage.rightChannelData, 1 - panningValue);
    }
}

  function drawFrequencyConstellationForChannel(ctx, canvas, channelData, panningValue) {
    if (ctx) {
        const numStars = 200; // Adjust the number of stars
        const starSizeMin = 1;
        const starSizeMax = 10;
        const maxBrightness = 3;
        const minBrightness = 0.1;
        const movementSpeed = 0.2; // Adjust this value to control the speed of the stars
        const distanceThreshold = 100; // Adjust this value to set the desired distance threshold
        const maxConnections = 2; // Adjust the maximum number of connections per star
        const frequencyRanges = [
            { name: 'bass', color: '#FF00FF', start: 0, end: 0.00909, threshold: 0.5 }, // Colour the bass red
            { name: 'midLow', color: '#00FFFF', start: 0.00913, end: 0.03636, threshold: 0.7 }, // Colour the mid-low blue
            { name: 'mid', color: '#FFFF00', start: 0.03640, end: 0.09090, threshold: 0.75 }, // Colour the mid yellow
            { name: 'midHigh', color: '#00FF00', start: 0.09095, end: 0.36363, threshold: 0.75 }, // Colour the mid-high green
            { name: 'treble', color: '#FF8000', start: 0.36368, end: 1, threshold: 0.5 } // Colour the treble orange
          ]
  
     // Initialize the star positions if not already done
     if (!ctx.starPositions) {
        ctx.starPositions = Array.from({ length: numStars }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * movementSpeed + (totalVolume * 0.1), // Random x-velocity
            vy: (Math.random() - 0.5) * movementSpeed + (totalVolume * 0.1), // Random y-velocity
        }));
    }
  
    // Clear the canvas
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update star positions based on velocity
    ctx.starPositions.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;
    
        // Wrap stars around the canvas edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
  
    // Generate stars for each frequency range
    frequencyRanges.forEach((range, rangeIndex) => {
      const numRangeStars = Math.floor(numStars / frequencyRanges.length);
      const rangeData = getFrequencyRangeData(channelData, range.start * channelData.length, range.end * channelData.length);
      const averageAmplitude = getAverageAmplitude(rangeData);
  
      for (let i = rangeIndex * numRangeStars; i < (rangeIndex + 1) * numRangeStars; i++) {
        const star = ctx.starPositions[i];
        const starSize = mapRange(averageAmplitude, 0, 255, starSizeMin, starSizeMax);
  
        // Apply subtle movement based on panning value
        const movementRange = 10;
        const movementX = mapRange(panningValue, -1, 1, 0, movementRange);
        const movementY = mapRange(panningValue, -1, 1, 0, movementRange);
  
        // Draw the star
        ctx.beginPath();
        ctx.arc(star.x + movementX, star.y + movementY, starSize, 0, Math.PI * 2);

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = range.color;

        ctx.fillStyle = range.color;
        ctx.globalAlpha = mapRange(averageAmplitude, 0, 255, minBrightness, maxBrightness);
        ctx.fill();

        // Reset shadow properties
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    });
  
   // Connect stars within the same frequency range
        frequencyRanges.forEach((range, rangeIndex) => {
            const numRangeStars = Math.floor(numStars / frequencyRanges.length);
            const rangeStars = ctx.starPositions.slice(rangeIndex * numRangeStars, (rangeIndex + 1) * numRangeStars);
            const rangeData = getFrequencyRangeData(channelData, range.start * channelData.length, range.end * channelData.length);
            const averageAmplitude = getAverageAmplitude(rangeData);

            // Create an array to store the connection count for each star
            const starConnections = new Array(rangeStars.length).fill(0);

            for (let i = 0; i < rangeStars.length; i++) {
            if (starConnections[i] >= maxConnections) {
                continue; // Skip the star if it already has the maximum number of connections
            }

            const starA = rangeStars[i];

            // Randomly select stars to connect to
        for (let j = 0; j < rangeStars.length; j++) {
            if (i !== j && starConnections[j] < maxConnections ) {
            const starB = rangeStars[j];
        
            // Calculate the distance between starA and starB
            const distanceX = starB.x - starA.x;
            const distanceY = starB.y - starA.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
            // Only draw the connection if the distance is within the threshold
            if (distance <= distanceThreshold) {

                // Apply subtle movement based on panning value
                const movementRange = 10;
                const movementX = mapRange(panningValue, -1, 1, -movementRange, movementRange) ;
                const movementY = mapRange(panningValue, -1, 1, -movementRange, movementRange) ;

                // Calculate line properties based on frequency range data
                const lineThickness = mapRange(averageAmplitude, 0, 255, 0, 2);
                const lineOpacity = mapRange(averageAmplitude, 0, 255, 0.1, 0.8);
                const lineCurve = mapRange(averageAmplitude, 0, 255, 0, (2 * panningValue) + 0.2);

                // Apply line threshold based on frequency range data
                if (averageAmplitude >= range.threshold * 255) {
                    // Draw the connecting line with curve
                     // Set the global composite operation to 'multiply'
                //    ctx.globalCompositeOperation = 'multiply';
                    ctx.beginPath();
                    ctx.moveTo(starA.x + movementX, starA.y + movementY);
                    const midX = (starA.x + starB.x) / 2;
                    const midY = (starA.y + starB.y) / 2;
                    const controlX = midX + (starB.y - starA.y) * lineCurve;
                    const controlY = midY - (starB.x - starA.x) * lineCurve;
                    ctx.quadraticCurveTo(controlX, controlY, starB.x + movementX, starB.y + movementY);
                    ctx.strokeStyle = range.color;
                    ctx.globalAlpha = lineOpacity;
                    ctx.lineWidth = lineThickness;
                    ctx.stroke();

                    // Increment the connection count for both stars
                    starConnections[i]++;
                    starConnections[j]++;

                    

                    // Break the loop if both stars have reached the maximum number of connections
                    if (starConnections[i] >= maxConnections && starConnections[j] >= maxConnections) {
                    break;
                    }
                }
                }
                }
            }
        }
    });
}}
    
  // Helper function to map a value from one range to another
  function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
  
  // Helper function to get the average amplitude of a frequency range
  function getAverageAmplitude(rangeData) {
    const sum = rangeData.reduce((acc, val) => acc + val, 0);
    return sum / rangeData.length;
  }

    //// ///////////////////////////
      
    function getVolumeForFrequency(freq, rangeData, minFreq, maxFreq) {
        const range = maxFreq - minFreq + 1;
        const index = Math.floor((freq - minFreq) / range * rangeData.length);
        return rangeData[index] / 255;
    }

    const colorGradients = [
        ['#ff0000', '#00ff00'],
        ['#00ff00', '#0000ff'],
        ['#0000ff', '#ff00ff'],
        ['#ff00ff', '#ffff00'],
        ['#ffff00', '#ff0000']
    ];

/// BARS ////////////////////////////////////////////////////////////////////

// Function to draw the bars
function drawBars(currentTime,) {
    createOffscreenCanvasContexts();

    // draw on the offscreen canvases using leftOffscreenCtx and rightOffscreenCtx
    const leftOffscreenCtx = offscreenCanvases.bars.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.bars.right.ctx;

    if (leftOffscreenCtx) {
        leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.bars.left.canvas.width, offscreenCanvases.bars.left.canvas.height);
    }
    if (rightOffscreenCtx) {
        rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.bars.right.canvas.width, offscreenCanvases.bars.right.canvas.height);
    }

    

    // Smooth the frequency data for better visualization
    smoothFrequencyData(aiMage.leftChannelData);
    smoothFrequencyData(aiMage.rightChannelData);
 /*
    // Draw the grid for the left channel
    drawGrid(aiMage.leftCtx, aiMage.leftChannelCanvas, aiMage.frequencyLabels, 'left', aiMage.bufferLength);

    // Draw the frequency labels for the left channel
    drawFrequencyLabels(aiMage.leftCtx, aiMage.leftChannelCanvas, aiMage.frequencyLabels, 'left');

    // Draw the grid for the right channel
    drawGrid(aiMage.rightCtx, aiMage.rightChannelCanvas, aiMage.frequencyLabels, 'right', aiMage.bufferLength);

    // Draw the frequency labels for the right channel
    drawFrequencyLabels(aiMage.rightCtx, aiMage.rightChannelCanvas, aiMage.frequencyLabels, 'right');
 
   */

    // Draw the bars for the left channel
    drawLeftChannelBars(aiMage.leftChannelData, aiMage.leftFrequencyRanges);

    // Draw the bars for the right channel
    drawRightChannelBars(aiMage.rightChannelData, aiMage.rightFrequencyRanges);
    
}

// Function to draw the bars for the left channel
function drawLeftChannelBars(channelData, frequencyRanges) {
    const ctx = aiMage.leftCtx;
    const canvas = aiMage.leftChannelCanvas;
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // Save the current state

    // Apply transformations to the rendering context
    ctx.translate(canvas.height / 2, canvas.width / 2); // Translate to the center of the canvas
    ctx.scale(canvasAttributes.leftCanvasScaleX, canvasAttributes.leftCanvasScaleY); // Apply scale
    ctx.rotate(canvasAttributes.leftCanvasRotation); // Apply rotation
    ctx.translate((-canvas.height / 2) + 45, (-canvas.width / 4) - 78);
    ctx.save(); // Save the current state

    const sampleRate = 22000;
    const numBars = (canvas.height / channelData.length) * aiMage.analyserNode.fftSize;
    const barWidth = (canvas.height / numBars) * aiMage.maxBarHeightLeft;
    const maxBarHeight = 800; // Adjust this value to control the maximum height of the bars

    const minFreq = 0;
    const maxFreq = 22000; // Use the updated maxFreq value

    // Draw each bar
    for (let i = 0; i < numBars; i++) {
        const volume = channelData[i];
        const barHeight = (volume / 255) * maxBarHeight;
        const frequency = mapRange(i, 0, numBars - 1, minFreq, maxFreq);
        const color = getColorForFrequency(frequency, volume, aiMage.colorMode, FREQUENCY_RANGES);
        
        // Set the fill style
        ctx.fillStyle = color;

        // Draw the bar
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    
     }
/*        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
  */
   ctx.restore(); // Restore the previous state
}

// Function to draw the bars for the right channel
function drawRightChannelBars(channelData, frequencyRanges) {
    const ctx = aiMage.rightCtx;
    const canvas = aiMage.rightChannelCanvas;
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply transformations to the rendering context
    ctx.translate(canvas.height / 2, canvas.width / 2); // Translate to the center of the canvas
    ctx.rotate(canvasAttributes.rightCanvasRotation); // Apply rotation
    ctx.scale(canvasAttributes.rightCanvasScaleX, 1); // Apply X-axis scaling (flip)
    ctx.scale(1, canvasAttributes.rightCanvasScaleY); // Apply Y-axis scaling (flip)
    ctx.translate((-canvas.height / 2 ) + 45, (-canvas.width / 2) +42); // Translate back to the top-left corner
    ctx.save(); // Save the current state

    const sampleRate = 22000;
    const numBars = (canvas.width / channelData.length ) * aiMage.analyserNode.fftSize ;
    const barWidth = ( canvas.width /numBars ) *  aiMage.maxBarHeightRight;
    const maxBarHeight = 800; // Adjust this value to control the maximum height of the bars
    const minFreq = 0;
    const maxFreq = 22000; // Use the updated maxFreq value

    // Draw each bar
    for (let i = 0; i < numBars; i++) {
        const volume = channelData[i];
        const barHeight = (volume / 255) * maxBarHeight;
        const frequency = mapRange(i, 0, numBars - 1, minFreq, maxFreq);
        const color = getColorForFrequency(frequency, volume, aiMage.colorMode, FREQUENCY_RANGES);
        // Set the fill style
        ctx.fillStyle = color;

        // Draw the bar
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }

    ctx.restore(); // Restore the previous state
}


// HEATMAP VISUALIZATION

// Funtion to plots each frquency volume for each channel on left and right canvases
function drawHeatMap() {
    createOffscreenCanvasContexts();

    // draw on the offscreen canvases using leftOffscreenCtx and rightOffscreenCtx
    const leftOffscreenCtx = offscreenCanvases.heatMap.left.ctx;
    const rightOffscreenCtx = offscreenCanvases.heatMap.right.ctx;

    if (leftOffscreenCtx) {
        leftOffscreenCtx.clearRect(0, 0, offscreenCanvases.heatMap.left.canvas.width, offscreenCanvases.heatMap.left.canvas.height);
    }
    if (rightOffscreenCtx) {
        rightOffscreenCtx.clearRect(0, 0, offscreenCanvases.heatMap.right.canvas.width, offscreenCanvases.heatMap.right.canvas.height);
    }


    // Clear the canvases before drawing
    aiMage.leftCtx.clearRect(0, 0, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
    aiMage.rightCtx.clearRect(0, 0, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);

    const smoothingFactor = 0.8; // Adjust this value to control the smoothing level
    // Smooth the frequency data for better visualization
    smoothFrequencyData(aiMage.leftChannelData);
    smoothFrequencyData(aiMage.rightChannelData);

    // Draw the grid for the left channel
    drawGrid(aiMage.leftCtx, aiMage.leftChannelCanvas, aiMage.frequencyLabels, 'left');

    // Draw the grid for the right channel
    drawGrid(aiMage.rightCtx, aiMage.rightChannelCanvas, aiMage.frequencyLabels, 'right');

    // Draw the frequency labels for the left channel
    drawFrequencyLabels(aiMage.leftCtx, aiMage.leftChannelCanvas, aiMage.frequencyLabels, 'left');

    // Draw the frequency labels for the right channel
    drawFrequencyLabels(aiMage.rightCtx, aiMage.rightChannelCanvas, aiMage.frequencyLabels, 'right');
 

    // Draw the decibel axes for the left channel
    //   drawDecibelAxes(aiMage.leftCtx, aiMage.leftChannelCanvas, aiMage.analyserNode.minDecibels, aiMage.analyserNode.maxDecibels);

    // Draw the bars for the left channel
    drawLeftHeatMap(aiMage.leftChannelData, aiMage.leftFrequencyRanges);

                // Draw the decibel axes for the right channel
//    drawDecibelAxes(aiMage.rightCtx, aiMage.rightChannelCanvas, aiMage.analyserNode.minDecibels, aiMage.analyserNode.maxDecibels);

    // Draw the bars for the right channel
    drawRightHeatMap(aiMage.rightChannelData, aiMage.rightFrequencyRanges);
}

// Function to draw the heat map for the left channel


// Function to draw the heat map for the right channel
function drawLeftHeatMap(channelData, currentTime, panningValue, frequencyRanges) {
    const ctx = aiMage.leftCtx;
    const canvas = aiMage.leftChannelCanvas;
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    ctx.save(); // Save the current state

    // Apply transformations to the rendering context
    ctx.translate(canvas.width / 2, canvas.height / 2); // Translate to the center of the canvas
    ctx.rotate(canvasAttributes.leftCanvasRotation); // Apply rotation
    ctx.scale(canvasAttributes.leftCanvasScaleX, canvasAttributes.leftCanvasScaleY); // Apply scale
    ctx.translate(-canvas.width / 2.25, -canvas.height / 2.9 + 14); // Translate back to the top-left corner

    const sampleRate = 22000;
    const numPoints = channelData.length ;
    const maxPointWidth = aiMage.maxPointWidthLeft * canvas.width * 1.0;
    const maxPointHeight = canvas.height * 1; // Adjust the maximum point height to leave some space at the bottom
    const minFreq = 0;
    const maxFreq = 22000;
    const pointSize = 2; // Adjust the point size as needed
    
    // Draw each point
    for (let i = 0; i < numPoints; i++) {
        const volume = channelData[i];
        const pointHeight = (volume / 255) * maxPointHeight;
        const frequency = mapRange(i, 0, maxPointWidth - 1, minFreq, maxFreq);
        const x = mapRange(frequency, minFreq, maxFreq, 0, canvas.width);
        const y = canvas.height - pointHeight - (canvas.height * 0.1); // Adjust the y-position to shift the points upward
        const color = getColorForFrequency(frequency, volume, aiMage.colorMode, FREQUENCY_RANGES);

        // Set the fill style
        ctx.fillStyle = color;

        // Draw the point
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore(); // Restore the previous state
}

function drawRightHeatMap(channelData, currentTime, panningValue, frequencyRanges) {
    const ctx = aiMage.rightCtx;
    const canvas = aiMage.rightChannelCanvas;
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    ctx.save(); // Save the current state

    // Apply transformations to the rendering context
    ctx.translate(canvas.width / 2, canvas.height / 2); // Translate to the center of the canvas
    ctx.rotate(canvasAttributes.rightCanvasRotation); // Apply rotation
    ctx.scale(canvasAttributes.rightCanvasScaleX, canvasAttributes.rightCanvasScaleY); // Apply scale
    ctx.translate(-canvas.width / 2.25, -canvas.height / 2.9 + 14); // Translate back to the top-left corner

    const sampleRate = 22000;
    const numPoints = channelData.length ;
    const maxPointWidth = aiMage.maxPointWidthRight * canvas.width * 1.0;
    const maxPointHeight = canvas.height * 1; // Adjust the maximum point height to leave some space at the bottom
    const minFreq = 0;
    const maxFreq = 22000;
    const pointSize = 2 ; // Adjust the point size as needed

    // Draw each point
    for (let i = 0; i < numPoints; i++) {
        const volume = channelData[i];
        const pointHeight = (volume / 255) * maxPointHeight;
        const frequency = mapRange(i, 0, maxPointWidth - 1, minFreq, maxFreq);
        const x = mapRange(frequency, minFreq, maxFreq, 0, canvas.width);
        const y = canvas.height - pointHeight - (canvas.height * 0.1); // Adjust the y-position to shift the points upward
        const color = getColorForFrequency(frequency, volume, aiMage.colorMode, FREQUENCY_RANGES);
        
        // Set the fill style
        ctx.fillStyle = color;

        // Draw the point
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore(); // Restore the previous state
}

function drawDecibelAxes(ctx, canvas, minDecibels, maxDecibels) {
    const numTicks = 6;
    const tickSize = 10;
    const axisMargin = 50;

    // Draw the axis line
    ctx.beginPath();
    ctx.moveTo(axisMargin, canvas.height - axisMargin);
    ctx.lineTo(canvas.width - axisMargin, canvas.height - axisMargin);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw the ticks and labels
    for (let i = 0; i <= numTicks; i++) {
        const x = mapRange(i, 0, numTicks, axisMargin, canvas.width - axisMargin);
        const decibelRatio = i / numTicks;
        const decibels = minDecibels + (maxDecibels - minDecibels) * Math.pow(10, decibelRatio);

        // Draw the tick
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - axisMargin);
        ctx.lineTo(x, canvas.height - axisMargin + tickSize);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // Draw the label
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(decibels.toFixed(0) + ' dB', x, canvas.height - axisMargin + tickSize + 15);
    }
}

function drawAxes(ctx, canvas) {
    // Draw axis lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height); // Y axis line
    ctx.lineTo(canvas.width, canvas.height); // X axis line
    ctx.strokeStyle = 'white'; // Set the line color
    ctx.stroke();

    // Draw axis labels (if needed)
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white'; // Set the text color
    ctx.fillText('X', canvas.width - 20, canvas.height - 10); // X axis label
    ctx.save();
    ctx.translate(10, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Y', 0, 0); // Y axis label
    ctx.restore();
}

// File handling and initialization functions ////////


function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            if (aiMage.audioContext.decodeAudioData) {
                aiMage.audioContext.decodeAudioData(event.target.result, function(buffer) {
                    aiMage.audioBuffer = buffer;
                    initializeCanvases();
                    document.getElementById('analyzeButton').disabled = false;
                    document.getElementById('stopButton').disabled = false;
                    displayAudioFileName(file); // Call the function to display the file name

                    // Display the audio duration
                    displayAudioDuration(buffer.duration);

                    // Display the current time
                    displayCurrentTime();

                    // Hide the message element
                    const displayMessage = document.getElementById('displayMessage');
                    displayMessage.style.display = 'none';

                    // Create the audio source and connect it
                    aiMage.createAudioSource();

               //     aiMage.updateFrequencyZoom(1);
                    
                    // Display the canvas attributes
                    console.log('Canvas Attributes:', aiMage.canvasAttributes);
                    console.log('Left Canvas Transform:', aiMage.leftChannelCanvas.style.transform);
                    console.log('Right Canvas Transform:', aiMage.rightChannelCanvas.style.transform);
                

                    aiMage.analyzeAudio();
                }, function(error) {
                    console.error('Error decoding audio data:', error);
                });
            } else {
                console.error('Web Audio API is not supported in this browser.');
            }
        };

        reader.onerror = function(event) {
            console.error('Error reading file:', event.target.error);
        };

        reader.readAsArrayBuffer(file);
    } else {
        console.error('No file selected.');
    }
}

function initializeCanvases() {
    // Get the canvas elements
    aiMage.leftChannelCanvas = document.getElementById('leftChannelCanvas');
    aiMage.rightChannelCanvas = document.getElementById('rightChannelCanvas');

    // Get the canvas attributes based on the selected visualization type
    const canvasAttributes = visualizationCanvasAttributes[aiMage.visualizationType];

    // Set the canvas dimensions
    aiMage.leftChannelCanvas.width = window.innerWidth; // 45% of the window width
    aiMage.leftChannelCanvas.height = window.innerHeight; // 80% of the window height
    aiMage.rightChannelCanvas.width = window.innerWidth; // 45% of the window width
    aiMage.rightChannelCanvas.height = window.innerHeight; // 80% of the window height

    // Set the canvas rotations and transformations
    aiMage.leftChannelCanvas.style.transform = `${canvasAttributes.leftCanvasRotation} ${canvasAttributes.leftCanvasTransform}`;
    aiMage.rightChannelCanvas.style.transform = `${canvasAttributes.rightCanvasRotation} ${canvasAttributes.rightCanvasTransform}`;

    // Get the 2D rendering contexts for the canvases
    aiMage.leftCtx = aiMage.leftChannelCanvas.getContext('2d');
    aiMage.rightCtx = aiMage.rightChannelCanvas.getContext('2d');
}

function startAudioContext() {
    // Set up the Web Audio API context
    aiMage.setupAudioContext();
}

function pauseAudio() {
    if (aiMage.audioSource && aiMage.audioSource.buffer) {
        if (aiMage.isPaused) {
            // Resume the audio if it was paused
            aiMage.audioContext.resume();
            createNewAudioSource();
            aiMage.audioSource.start(0, aiMage.pausedTime);
            aiMage.isPaused = false;
            document.getElementById('pauseButton').textContent = 'Pause';
            document.getElementById('pauseIndicator').style.display = 'none'; // Hide the pause indicator
        } else {
            // Pause the audio if it was playing
            aiMage.pausedTime = aiMage.audioContext.currentTime - aiMage.startTime;
            aiMage.audioSource.stop(0);
            aiMage.audioContext.suspend();
            aiMage.isPaused = true;
            document.getElementById('pauseButton').textContent = 'Resume';
            document.getElementById('pauseIndicator').style.display = 'block'; // Show the pause indicator
            document.getElementById('pauseIndicator').style.color = 'red'; // Show the pause indicator in red
        }
    } else {
        // If the audio source is not available or has finished playing
        aiMage.analyzeAudio();
    }
}

function createNewAudioSource() {
    // Stop the previous audio source if it exists
    if (aiMage.audioSource) {
        aiMage.audioSource.stop(0);
        aiMage.audioSource.disconnect();
    }

    // Create a new audio source node
    aiMage.audioSource = aiMage.audioContext.createBufferSource();
    aiMage.audioSource.buffer = aiMage.audioBuffer;

    // Create a new channel splitter
    const channelSplitter = aiMage.audioContext.createChannelSplitter(2);

    // Connect the audio source to the channel splitter
    aiMage.audioSource.connect(channelSplitter);

    // Connect the left output of the splitter to the left analyser
    channelSplitter.connect(aiMage.leftAnalyser, 0, 0);

    // Connect the right output of the splitter to the right analyser
    channelSplitter.connect(aiMage.rightAnalyser, 1, 0);

    // Connect the audio source to the analyser node and the analyser node to the audio context destination
    aiMage.audioSource.connect(aiMage.analyserNode);
    aiMage.analyserNode.connect(aiMage.audioContext.destination);
}



function stopAudio() {
    if (aiMage.audioSource) {
        // Stop the audio source
        aiMage.audioSource.stop(0);

        // Cancel the animation frame
        cancelAnimationFrame(aiMage.animationFrameId);

        // Reset the animation frame ID
        aiMage.animationFrameId = null;

        // Hide the pause indicator
        document.getElementById('pauseIndicator').style.display = 'none';

        // Reset the exceeded frequencies arrays and map
        aiMage.exceededFrequencies = [];
        frequencyColorMap.clear();


        // Clear the canvases for all visualizers
        clearAllCanvases();

        // Reset the pause state
        aiMage.isPaused = false;

        // Reset the start time and previous time
        aiMage.startTime = 0;
        aiMage.previousTime = 0;

        // Reset the current time display
        resetCurrentTimeDisplay();

        // Disable the analyze button
        document.getElementById('analyzeButton').disabled = false;
    }
}

function clearAllCanvases() {
    // Clear the canvases for all visualizers
    if (aiMage.leftCtx) {
        aiMage.leftCtx.clearRect(0, 0, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
    }
    if (aiMage.rightCtx) {
        aiMage.rightCtx.clearRect(0, 0, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);
    }

    // Clear the offscreen canvases for all visualizers
    for (const visualizerType in offscreenCanvases) {
        const visualizer = offscreenCanvases[visualizerType];
        if (visualizer.left.ctx) {
            visualizer.left.ctx.clearRect(0, 0, visualizer.left.canvas.width, visualizer.left.canvas.height);
        }
        if (visualizer.right.ctx) {
            visualizer.right.ctx.clearRect(0, 0, visualizer.right.canvas.width, visualizer.right.canvas.height);
        }
    }
}

// Display functions/////

function displayAudioFileName(file) {
    const audioFileNameDisplay = document.getElementById('audioFileNameDisplay');
    const fileName = file.name;
    const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    audioFileNameDisplay.textContent = `${fileNameWithoutExtension}`;
}


// Function to display the audio duration
function displayAudioDuration(duration) {
    const audioDurationDisplay = document.getElementById('audioDurationDisplay');
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const formattedDuration = `${padZero(minutes)}:${padZero(seconds)}`;
    audioDurationDisplay.textContent = `Song Length: ${formattedDuration}`;
}

function padZero(value) {
    return value < 10 ? `0${value}` : value.toString();
}


// Function to check for frequencies exceeding the threshold
function checkExceededFrequenciesLeft(channelData, sampleRate) {
    const maxBarHeight = aiMage.leftChannelCanvas.height;
    const minFreq = 0;
    const maxFreq = 22000;
    const numBars = channelData.length;
    const decibelThreshold = -0.5;
    const exceededFrequencies = [];

    for (let i = 0; i < numBars; i++) {
        const volume = channelData[i];
        const decibels = volumeToDecibels(volume);
        const frequency = mapRange(i, 0, numBars - 1, minFreq, maxFreq);

        if (decibels >= decibelThreshold) {
            exceededFrequencies.push(Math.round(frequency));
            const roundedFrequency = Math.round(frequency);
            const count = frequencyColorMap.get(roundedFrequency) || 0;
            frequencyColorMap.set(roundedFrequency, count + 1);
        }
    }

    displayExceededFrequencies('left', exceededFrequencies);
}

function checkExceededFrequenciesRight(channelData, sampleRate) {
    const maxBarHeight = aiMage.rightChannelCanvas.height;
    const minFreq = 0;
    const maxFreq = 22000;
    const numBars = channelData.length;
    const decibelThreshold = -0.5;
    const exceededFrequencies = [];

    for (let i = 0; i < numBars; i++) {
        const volume = channelData[i];
        const decibels = volumeToDecibels(volume);
        const frequency = mapRange(i, 0, numBars - 1, minFreq, maxFreq);

        if (decibels >= decibelThreshold) {
            exceededFrequencies.push(Math.round(frequency));
            const roundedFrequency = Math.round(frequency);
            const count = frequencyColorMap.get(roundedFrequency) || 0;
            frequencyColorMap.set(roundedFrequency, count + 1);
        }
    }

    displayExceededFrequencies('right', exceededFrequencies);
}

// Function to update the exceededFrequencies array
function updateExceededFrequencies(newExceededFrequencies) {
    for (const freq of newExceededFrequencies) {
        if (!aiMage.exceededFrequencies.includes(freq)) {
            aiMage.exceededFrequencies.push(freq);
        }
    }
}

// Function to display the exceeded frequencies
function displayExceededFrequencies(channelSide, exceededFrequencies) {
    const listElement = document.getElementById(`exceededFrequencies${channelSide.charAt(0).toUpperCase() + channelSide.slice(1)}`);
    const existingFrequencies = Array.from(listElement.querySelectorAll('li')).map(li => parseInt(li.textContent.replace(' Hz', '')));

    // Sort the existing frequencies in ascending order
    existingFrequencies.sort((a, b) => a - b);

    // Sort the new frequencies in ascending order
    const sortedExceededFrequencies = exceededFrequencies.sort((a, b) => a - b);

    // Filter out the existing frequencies and create the new list items
    const newFrequencies = sortedExceededFrequencies.filter(freq => !existingFrequencies.includes(freq));
    const listItems = newFrequencies.map(freq => {
        const color = getExceededFrequencyColor(freq);
        return `<li style="color: ${color};">${freq} Hz</li>`;
    });

    // Sort the existing and new frequencies together
    const allFrequencies = [...existingFrequencies, ...newFrequencies];
    allFrequencies.sort((a, b) => a - b);

    // Create the new list with the sorted frequencies
    const sortedListItems = allFrequencies.map(freq => {
        const color = getExceededFrequencyColor(freq);
        return `<li style="color: ${color};">${freq} Hz</li>`;
    });

    // Update the list element with the sorted list items
    listElement.innerHTML = sortedListItems.join('');
}

// Time-domain data functions

function getTimeDomainData() {
    aiMage.leftAnalyser.getFloatTimeDomainData(aiMage.leftTimeDomainData);
    aiMage.rightAnalyser.getFloatTimeDomainData(aiMage.rightTimeDomainData);
}

let startTime = null;
let currentTimeInterval = null;
let lastUpdatedTime = 0;


function resetCurrentTimeDisplay() {
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    currentTimeDisplay.innerHTML = '00:00';
}

function displayCurrentTime(time) {
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedTime = `${padZero(minutes)}:${padZero(seconds)}`;
    currentTimeDisplay.innerHTML = ` ${formattedTime}`;
}

function calculateCurrentTime() {
    const sampleRate = aiMage.audioContext.sampleRate;
    const bufferLength = aiMage.bufferLength;
    const duration = aiMage.audioBuffer.duration;

    // Find the index of the maximum absolute value in the time-domain data
    const leftMaxIndex = findMaxAbsIndex(aiMage.leftTimeDomainData);
    const rightMaxIndex = findMaxAbsIndex(aiMage.rightTimeDomainData);

    // Calculate the current time based on the maximum index and duration
    const currentTimeLeft = (leftMaxIndex / bufferLength) * duration;
    const currentTimeRight = (rightMaxIndex / bufferLength) * duration;

    // Return the average of the left and right channel times in seconds
    return Math.floor((currentTimeLeft + currentTimeRight) / 2);
}

function findMaxAbsIndex(data) {
    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < data.length; i++) {
        const absValue = Math.abs(data[i]);
        if (absValue > maxValue) {
            maxValue = absValue;
            maxIndex = i;
        }
    }

    return maxIndex;
}

// Utility functions

function mapRange(value, fromMin, fromMax, toMin, toMax) {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}



//function to display message to upload audio file
function displayMessage() {
    const displayMessage = document.getElementById('displayMessage');
    messageToUploadisplayMessagedAudioFile.style.display = 'flex';
}

function enableButtons() {
    document.getElementById('analyzeButton').disabled = false;
    document.getElementById('pauseButton').disabled = false;
    document.getElementById('stopButton').disabled = false;
    document.getElementById('clearButton').disabled = false;
}

// Event listeners

document.getElementById('audioFileInput').addEventListener('change', handleFileSelect);
document.getElementById('analyzeButton').addEventListener('click', function () {
    aiMage.analyzeAudio();
});
document.getElementById('pauseButton').addEventListener('click', pauseAudio);
document.getElementById('stopButton').addEventListener('click', stopAudio);
document.getElementById('clearButton').addEventListener('click', clearAllCanvases);

const colorModeToggle = document.getElementById('colorModeToggle');
colorModeToggle.addEventListener('change', function() {
    aiMage.colorMode = this.value;
});

  
 // Frequency zoom slider event listeners
const frequencyZoomSlider = document.getElementById('frequencyZoomSlider');

frequencyZoomSlider.addEventListener('input', function() {
    const zoomValue = parseFloat(this.value);
    updateFrequencyZoom(zoomValue);
    document.getElementById('frequencyZoomValue').textContent = zoomValue.toFixed(2);
});

frequencyZoomSlider.addEventListener('change', function() {
    const zoomValue = parseFloat(this.value);
    updateFrequencyZoom(zoomValue);
});


// Set the initial color mode based on the selected option
aiMage.colorMode = colorModeToggle.options[colorModeToggle.selectedIndex].value;



     
// Code for handling the "Psychedelic Background" option
const psychedelicBackgroundButton = document.getElementById('psychedelicBackgroundButton');
let psychedelicBackgroundEnabled = false;
psychedelicBackgroundButton.addEventListener('click', function() {
    psychedelicBackgroundEnabled = !psychedelicBackgroundEnabled;
    if (psychedelicBackgroundEnabled) {
        enablePsychedelicBackground();
        this.classList.add('active');
    } else {
        disablePsychedelicBackground();
        this.classList.remove('active');
    }
});

// Function to enable the psychedelic background
function enablePsychedelicBackground() {
  // Code to enable the psychedelic background
  // Add the following lines within the drawVisualization function
  drawPsychedelicBackground(aiMage.leftCtx, aiMage.leftChannelData, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
  drawPsychedelicBackground(aiMage.rightCtx, aiMage.rightChannelData, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);
}

// Function to disable the psychedelic background
function disablePsychedelicBackground() {
  // Code to disable the psychedelic background
  // Add the following lines within the drawVisualization function
  aiMage.leftCtx.clearRect(0, 0, aiMage.leftChannelCanvas.width, aiMage.leftChannelCanvas.height);
  aiMage.rightCtx.clearRect(0, 0, aiMage.rightChannelCanvas.width, aiMage.rightChannelCanvas.height);
}

// Visualization type selection

const visualizationTypeSelect = document.getElementById('visualizationTypeSelect');

const barsOption = document.createElement('option');
barsOption.value = 'bars';
barsOption.textContent = 'Bars';
visualizationTypeSelect.appendChild(barsOption);

const heatMapOption = document.createElement('option');
heatMapOption.value = 'heatMap';
heatMapOption.textContent = 'Dots';
visualizationTypeSelect.appendChild(heatMapOption);

const frequencyConstellationOption = document.createElement('option');
frequencyConstellationOption.value = 'frequencyConstellation';
frequencyConstellationOption.textContent = 'Constellations';
visualizationTypeSelect.appendChild(frequencyConstellationOption);

/*
const particleFlowOption = document.createElement('option');
particleFlowOption.value = 'particleFlow';
particleFlowOption.textContent = 'Raindrops';
visualizationTypeSelect.appendChild(particleFlowOption);
*/

const frequencyPolygonOption = document.createElement('option');
frequencyPolygonOption.value = 'frequencyPolygon';
frequencyPolygonOption.textContent = 'Polygon';
visualizationTypeSelect.appendChild(frequencyPolygonOption);

/*
const overlayVisualizerOption = document.createElement('option');
overlayVisualizerOption.value = 'overlayVisualizer';
overlayVisualizerOption.textContent = 'Multi';
visualizationTypeSelect.appendChild(overlayVisualizerOption);
*/

visualizationTypeSelect.addEventListener('change', function () {
const selectedValue = this.value;
aiMage.visualizationType = selectedValue;
});

const fullscreenButton = document.getElementById('fullscreenButton');
const container = document.querySelector('.container');
const canvasContainer = document.querySelector('.canvas-container');

fullscreenButton.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    container.classList.toggle('fullscreen');
    
    if (container.classList.contains('fullscreen')) {
      fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
      canvasContainer.style.width = '100%';
      canvasContainer.style.height = '100vh';
      canvasContainer.style.top = '0';
      canvasContainer.style.left = '0';
      canvasContainer.style.border = 'none';
      
      fullscreenButton.style.top = '20px';
      fullscreenButton.style.right = '20px';
    } else {
      fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
      canvasContainer.style.width = '';
      canvasContainer.style.height = '';
      canvasContainer.style.top = '';
      canvasContainer.style.left = '';
      canvasContainer.style.border = '';
      
      fullscreenButton.style.top = '';
      fullscreenButton.style.right = '';
    }
  }

// Initialize the audio context
aiMage.setupAudioContext();


