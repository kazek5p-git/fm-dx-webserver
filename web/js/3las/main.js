let Stream;
let shouldReconnect = true;
let newVolumeGlobal = 1;
let playbackToggleInProgress = false;

function syncPlayButtonState(isPlaying) {
    const $playbutton = $('.playbutton');
    $playbutton.attr('aria-pressed', isPlaying ? 'true' : 'false');
    $playbutton.attr('aria-label', isPlaying ? 'Stop playback' : 'Start playback');
    const $icons = $playbutton.find('.fa-solid');
    if (isPlaying) {
        $icons.removeClass('fa-play').addClass('fa-stop');
    } else {
        $icons.removeClass('fa-stop').addClass('fa-play');
    }
}

function Init(_ev) {
    $(".playbutton").off('click').on('click', OnPlayButtonClick);  // Ensure only one event handler is attached
    $("#volumeSlider").off("input").on("input", updateVolume);  // Ensure only one event handler is attached
    syncPlayButtonState(false);
}

function createStream() {
    try {
        // Hard guard against parallel stream instances.
        if (Stream) {
            Stream.Stop();
            Stream = null;
        }
        const settings = new _3LAS_Settings();
        Stream = new _3LAS(null, settings);
        Stream.Volume = $('#volumeSlider').val();
        Stream.ConnectivityCallback = OnConnectivityCallback;
    } catch (error) {
        console.error("Initialization Error: ", error);
    }
}

function destroyStream() {
    if (Stream) {
        Stream.Stop();
        Stream = null;
    }
}

function OnConnectivityCallback(isConnected) {
    console.log("Connectivity changed:", isConnected);
    if (Stream) {
        Stream.Volume = $('#volumeSlider').val();
    } else {
        console.warn("Stream is not initialized.");
    }
}


function OnPlayButtonClick(_ev) {
    if (playbackToggleInProgress) {
        return;
    }
    playbackToggleInProgress = true;

    const $playbutton = $('.playbutton');
    const isAppleiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    try {
        if (Stream) {
            console.log("Stopping stream...");
            shouldReconnect = false;
            destroyStream();
            syncPlayButtonState(false);
            if (isAppleiOS && 'audioSession' in navigator) {
                navigator.audioSession.type = "none";
            }
        } else {
            console.log("Starting stream...");
            shouldReconnect = true;
            createStream();
            if (Stream) {
                Stream.Start();
                syncPlayButtonState(true);
            }
            if (isAppleiOS && 'audioSession' in navigator) {
                navigator.audioSession.type = "playback";
            }
        }
    } catch (error) {
        console.error("Playback toggle failed:", error);
        destroyStream();
        syncPlayButtonState(false);
    }

    $playbutton.addClass('bg-gray').prop('disabled', true);
    setTimeout(() => {
        $playbutton.removeClass('bg-gray').prop('disabled', false);
        playbackToggleInProgress = false;
    }, 3000);
}

function updateVolume() {
    if (Stream) {
        const newVolume = $(this).val();
        newVolumeGlobal = newVolume;
        console.log("Volume updated to:", newVolume);
        Stream.Volume = newVolume;
    } else {
        console.warn("Stream is not initialized.");
    }
}

$(document).ready(Init);
