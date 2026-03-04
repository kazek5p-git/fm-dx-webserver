(() => {
    ////////////////////////////////////////////////////////////
    ///                                                      ///
    ///  PEAKMETER SCRIPT FOR FM-DX-WEBSERVER (V1.1a)        ///
    ///                                                      ///
    ///  by Highpoint                last update: 10.10.24   ///
    ///                                                      ///
    ///  https://github.com/Highpoint2000/PEAKMETER          ///
    ///                                                      ///
    ////////////////////////////////////////////////////////////

    let volumeSliderValue = 1.0; // Set the value 0.1-1.0 to reduce the input volume/sensitivity (default: 1.0)
    let volumeSliderEnable = true; // set to 'true' to activate the manual volume control (default: false)
    let ConsoleDebug = false; // set to 'true' to activate console information for debugging
    let minVolumeThreshold = 0.1; // Threshold for audio display activation
    let riseRate = 1.90; // Rate of increase (the higher, the faster)
    let amplificationFactor = 0.15; // Amplification facto
    let bassReductionFactor = -1; // Reduction of bass frequencies (in dB)
    let highPassCutoffFrequency = 1000; // Cutoff frequency for high-pass filter (in Hz)

    ////////////////////////////////////////////////////////////

    // Custom console log function
    function debugLog(...messages) {
        if (ConsoleDebug) {
            console.log(...messages);
        }
    }

    const plugin_version = 'V1.1a';
    let audioContext, analyser, dataArray, bassFilter, highPassFilter;
    let peakLevel = 1; // Track the highest signal level
    let peakLineVisible = false; // Flag to show the peak line
    let peakLineTimeout; // Timeout for resetting the peak line
    let audioDataReceived = true; // Simulate received audio data
    let signalCtx; // 2D context of the canvas
    let AudioSignalCanvas; // Canvas element
    let isConnected;

    document.addEventListener("DOMContentLoaded", function() {
        const volumeSlider = document.getElementById('volumeSlider');

        if (volumeSlider) {
            // Create the canvas element for the peak mete
            AudioSignalCanvas = document.createElement('canvas');
            AudioSignalCanvas.id = 'audio-meter-canvas';
            AudioSignalCanvas.style.imageRendering = "auto";
            AudioSignalCanvas.style.display = "inline-block";
            AudioSignalCanvas.style.cursor = "pointer";
            AudioSignalCanvas.title = `Plugin Version: ${plugin_version}`;
            AudioSignalCanvas.setAttribute('role', 'img');
            AudioSignalCanvas.setAttribute('aria-label', 'Peak meter showing current audio level');
			AudioSignalCanvas.style.position = 'relative'; // Use relative positioning
			AudioSignalCanvas.style.top = '-3px'; // Move 2 pixels up		

            // Set the canvas dimensions
            AudioSignalCanvas.width = volumeSlider.offsetWidth * 0.75;
            AudioSignalCanvas.height = 20;

            // Insert the canvas directly after the volume slide
            volumeSlider.parentNode.insertBefore(AudioSignalCanvas, volumeSlider.nextSibling);

            // Set the canvas reference and context after adding
            signalCtx = AudioSignalCanvas.getContext('2d');

            // Draw scale marks
            drawScaleMarks();

            // Set the volume slider value
            volumeSlider.value = volumeSliderValue;

            if (!volumeSliderEnable) {
                volumeSlider.disabled = true;
                volumeSlider.style.opacity = '0.25';
                volumeSlider.style.cursor = "default";
            }
        }

        // Check if the stream object is available
        checkStreamAndInit();

        setInterval(function() {
            if (!Stream) {
                checkStreamAndInit();
            }
        }, 1000);
    });

    function checkStreamAndInit() {
        if (typeof Stream !== 'undefined' && Stream && Stream.Fallback && Stream.Fallback.Player) {
            debugLog('Stream object and Fallback.Player are available.');
            initAudioMeter();
        } else {
            setTimeout(checkStreamAndInit, 500);
        }
    }

    function initAudioMeter() {
        debugLog("Initializing audio meter...");
        audioContext = Stream.Fallback.Audio;
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        bassFilter = audioContext.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.setValueAtTime(200, audioContext.currentTime);
        bassFilter.gain.setValueAtTime(bassReductionFactor, audioContext.currentTime);

        highPassFilter = audioContext.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.setValueAtTime(highPassCutoffFrequency, audioContext.currentTime);

        connectTo3LASPlayer();
    }

    function connectTo3LASPlayer() {
        if (Stream && Stream.Fallback && Stream.Fallback.Player) {
            const liveAudioPlayer = Stream.Fallback.Player;

            if (liveAudioPlayer.Amplification) {
                liveAudioPlayer.Amplification.connect(bassFilter);
                bassFilter.connect(highPassFilter);
                highPassFilter.connect(analyser);

                startSignalMeter();
                debugLog("Successfully connected to the LiveAudioPlayer.");
            } else {
                console.error("Amplification node not ready. Retrying...");
                setTimeout(connectTo3LASPlayer, 500);
            }
        } else {
            console.error("Stream, Fallback, or LiveAudioPlayer not initialized. Retrying...");
            setTimeout(connectTo3LASPlayer, 500);
        }
    }

    function startSignalMeter() {
        setInterval(updateSignalMeter, 75);
    }

    function updateSignalMeter() {
        if (!audioDataReceived) return;

        analyser.getByteFrequencyData(dataArray);

        let signalLevel = dataArray.reduce((a, b) => a + b) / dataArray.length;

        if (signalLevel < minVolumeThreshold) {
            signalLevel = 0;
        }

        signalLevel *= amplificationFactor;
        signalLevel = Math.pow(signalLevel, riseRate);
        signalLevel = Math.min(signalLevel, 255);

        if (signalLevel > peakLevel) {
            peakLevel = signalLevel;
            peakLineVisible = true;

            if (peakLineTimeout) {
                clearTimeout(peakLineTimeout);
            }

            peakLineTimeout = setTimeout(() => {
                peakLevel = 0;
                peakLineVisible = false;
            }, 1000);
        }

        const seventyPercentWidth = 0.7 * AudioSignalCanvas.width;
        const signalWidth = (signalLevel / 255) * AudioSignalCanvas.width;

        signalCtx.clearRect(0, 0, AudioSignalCanvas.width, AudioSignalCanvas.height);
        drawScaleMarks();

        signalCtx.fillStyle = '#08B818';
        signalCtx.fillRect(0, 0, Math.min(seventyPercentWidth, signalWidth), AudioSignalCanvas.height - 16);

        if (signalWidth > seventyPercentWidth) {
            signalCtx.fillStyle = '#FF0000';
            signalCtx.fillRect(seventyPercentWidth, 0, signalWidth - seventyPercentWidth, AudioSignalCanvas.height - 16);
        }

        if (peakLineVisible) {
            const peakX = (peakLevel / 255) * AudioSignalCanvas.width;
            signalCtx.strokeStyle = '#FFFF00';
            signalCtx.lineWidth = 2;
            signalCtx.beginPath();
            signalCtx.moveTo(peakX, 0);
            signalCtx.lineTo(peakX, AudioSignalCanvas.height - 16);
            signalCtx.stroke();
        }
    }

    function drawScaleMarks() {
        signalCtx.fillStyle = '#212223';
        signalCtx.fillRect(0, 0, AudioSignalCanvas.width, 5);

        const scaleValues = [10, 30, 50, 70, 100];
        const scalePositions = scaleValues.map(val => (val / 100) * AudioSignalCanvas.width);

        signalCtx.font = '8px Arial, sans-serif';
        signalCtx.fillStyle = '#FFFFFF';
        signalCtx.textAlign = 'center';

        scalePositions.forEach((pos, index) => {
            const adjustedPos = (index === 4) ? pos - 10 : pos;
            signalCtx.beginPath();
            signalCtx.moveTo(adjustedPos, 4);
            signalCtx.lineTo(adjustedPos, 6);
            signalCtx.strokeStyle = '#FFFFFF';
            signalCtx.lineWidth = 2;
            signalCtx.stroke();
            signalCtx.fillText(scaleValues[index], adjustedPos, 16);
        });
    }
})();
