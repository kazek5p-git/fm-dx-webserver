/**
 * WEATHER PLUGIN FOR FM-DX WEBSERVER
 * Author: NoobishSVK
 * Used API: https://open-meteo.com/
 * Icons: OpenWeatherMap
 */

const weatherData = {
	"0": {
		"day": {
			"description": "Sunny",
			"image": "http://openweathermap.org/img/wn/01d@2x.png"
		},
		"night": {
			"description": "Clear",
			"image": "http://openweathermap.org/img/wn/01n@2x.png"
		}
	},
	"1": {
		"day": {
			"description": "Mainly Sunny",
			"image": "http://openweathermap.org/img/wn/01d@2x.png"
		},
		"night": {
			"description": "Mainly Clear",
			"image": "http://openweathermap.org/img/wn/01n@2x.png"
		}
	},
	"2": {
		"day": {
			"description": "Partly Cloudy",
			"image": "http://openweathermap.org/img/wn/02d@2x.png"
		},
		"night": {
			"description": "Partly Cloudy",
			"image": "http://openweathermap.org/img/wn/02n@2x.png"
		}
	},
	"3": {
		"day": {
			"description": "Cloudy",
			"image": "http://openweathermap.org/img/wn/03d@2x.png"
		},
		"night": {
			"description": "Cloudy",
			"image": "http://openweathermap.org/img/wn/03n@2x.png"
		}
	},
	"45": {
		"day": {
			"description": "Foggy",
			"image": "http://openweathermap.org/img/wn/50d@2x.png"
		},
		"night": {
			"description": "Foggy",
			"image": "http://openweathermap.org/img/wn/50n@2x.png"
		}
	},
	"48": {
		"day": {
			"description": "Rime Fog",
			"image": "http://openweathermap.org/img/wn/50d@2x.png"
		},
		"night": {
			"description": "Rime Fog",
			"image": "http://openweathermap.org/img/wn/50n@2x.png"
		}
	},
	"51": {
		"day": {
			"description": "Light Drizzle",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Light Drizzle",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"53": {
		"day": {
			"description": "Drizzle",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Drizzle",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"55": {
		"day": {
			"description": "Heavy Drizzle",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Heavy Drizzle",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"56": {
		"day": {
			"description": "Light Freezing Drizzle",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Light Freezing Drizzle",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"57": {
		"day": {
			"description": "Freezing Drizzle",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Freezing Drizzle",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"61": {
		"day": {
			"description": "Light Rain",
			"image": "http://openweathermap.org/img/wn/10d@2x.png"
		},
		"night": {
			"description": "Light Rain",
			"image": "http://openweathermap.org/img/wn/10n@2x.png"
		}
	},
	"63": {
		"day": {
			"description": "Rain",
			"image": "http://openweathermap.org/img/wn/10d@2x.png"
		},
		"night": {
			"description": "Rain",
			"image": "http://openweathermap.org/img/wn/10n@2x.png"
		}
	},
	"65": {
		"day": {
			"description": "Heavy Rain",
			"image": "http://openweathermap.org/img/wn/10d@2x.png"
		},
		"night": {
			"description": "Heavy Rain",
			"image": "http://openweathermap.org/img/wn/10n@2x.png"
		}
	},
	"66": {
		"day": {
			"description": "Light Freezing Rain",
			"image": "http://openweathermap.org/img/wn/10d@2x.png"
		},
		"night": {
			"description": "Light Freezing Rain",
			"image": "http://openweathermap.org/img/wn/10n@2x.png"
		}
	},
	"67": {
		"day": {
			"description": "Freezing Rain",
			"image": "http://openweathermap.org/img/wn/10d@2x.png"
		},
		"night": {
			"description": "Freezing Rain",
			"image": "http://openweathermap.org/img/wn/10n@2x.png"
		}
	},
	"71": {
		"day": {
			"description": "Light Snow",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
		},
		"night": {
			"description": "Light Snow",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"73": {
		"day": {
			"description": "Snow",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
			},
		"night": {
			"description": "Snow",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"75": {
		"day": {
			"description": "Heavy Snow",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
		},
		"night": {
			"description": "Heavy Snow",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"77": {
		"day": {
			"description": "Snow Grains",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
		},
		"night": {
			"description": "Snow Grains",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"80": {
		"day": {
			"description": "Light Showers",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Light Showers",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"81": {
		"day": {
			"description": "Showers",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Showers",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"82": {
		"day": {
			"description": "Heavy Showers",
			"image": "http://openweathermap.org/img/wn/09d@2x.png"
		},
		"night": {
			"description": "Heavy Showers",
			"image": "http://openweathermap.org/img/wn/09n@2x.png"
		}
	},
	"85": {
		"day": {
			"description": "Light Snow Showers",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
		},
		"night": {
			"description": "Light Snow Showers",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"86": {
		"day": {
			"description": "Snow Showers",
			"image": "http://openweathermap.org/img/wn/13d@2x.png"
		},
		"night": {
			"description": "Snow Showers",
			"image": "http://openweathermap.org/img/wn/13n@2x.png"
		}
	},
	"95": {
		"day": {
			"description": "Thunderstorm",
			"image": "http://openweathermap.org/img/wn/11d@2x.png"
		},
		"night": {
			"description": "Thunderstorm",
			"image": "http://openweathermap.org/img/wn/11n@2x.png"
		}
	},
	"96": {
		"day": {
			"description": "Light Thunderstorms With Hail",
			"image": "http://openweathermap.org/img/wn/11d@2x.png"
		},
		"night": {
			"description": "Light Thunderstorms With Hail",
			"image": "http://openweathermap.org/img/wn/11n@2x.png"
		}
	},
	"99": {
		"day": {
			"description": "Thunderstorm With Hail",
			"image": "http://openweathermap.org/img/wn/11d@2x.png"
		},
		"night": {
			"description": "Thunderstorm With Hail",
			"image": "http://openweathermap.org/img/wn/11n@2x.png"
		}
	}
};

$( document ).ready(function() {
    getWeatherData();
});

function getWeatherRequestUrl() {
    const latRaw = localStorage.getItem('qthLatitude');
    const lonRaw = localStorage.getItem('qthLongitude');
    const lat = parseFloat(latRaw);
    const lon = parseFloat(lonRaw);

    // Skip weather requests until QTH coordinates are available.
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    const imperialUnits = localStorage.getItem('imperialUnits') === 'true';
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m${imperialUnits ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : ''}`;
}

function getWeatherData() {
    const requestUrl = getWeatherRequestUrl();
    if (!requestUrl) {
        console.info('Weather plugin: missing qthLatitude/qthLongitude, skipping weather request.');
        document.getElementById('weather-plugin')?.remove();
        return;
    }

    $.ajax({
        url: requestUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            //console.log(data); // For demonstration purposes, logging the data to console
            initializeWeatherData(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
}

function initializeWeatherData(data) {
    document.getElementById('weather-plugin')?.remove();

    const windDirection = degreesToDirection(data.current.wind_direction_10m);
    const isDayNumeric = parseInt(data.current.is_day, 10);
    const weatherCode = String(data.current.weather_code);
    const weatherInfo = weatherData[weatherCode];
    const weatherDescription = weatherInfo
        ? weatherInfo[isDayNumeric === 1 ? 'day' : 'night'].description
        : 'Unknown weather';

	let tooltipContent = `<table class='text-left'>
                <tr>
                    <td class='text-bold' style='padding-right: 20px;'>Pressure:</td>
                    <td>${data.current.pressure_msl} ${data.current_units.pressure_msl} <span class='text-gray text-small'>(${data.current.relative_humidity_2m}% humidity)</span></td>
                </tr>
                <tr>
                    <td class='text-bold'>Wind:</td>
                    <td>${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m} <span class='text-gray text-small'>(${windDirection})</span></td>
                </tr>
            </table>`;
	let $serverInfoContainer = $('.dashboard-panel .panel-100-real .dashboard-panel-plugin-content');
	let weatherPanel = $(`
        <div id="weather-plugin" class="flex-container flex-center tooltip hide-phone hover-brighten br-15" style="height: 48px;padding-right: 10px;" data-tooltip="${tooltipContent}" data-tooltip-placement="bottom" role="status" aria-live="polite" aria-label="Weather now: ${weatherDescription}, ${data.current.temperature_2m}${data.current_units.temperature_2m}">
            <img id="weatherImage" src="" alt="${weatherDescription}" width="48px" height="48px">
            <span class="color-4 m-0" style="font-size: 32px;padding-bottom:2px;font-weight: 100;">${data.current.temperature_2m}${data.current_units.temperature_2m}</span><br>
        </div>
    `);

    $serverInfoContainer.prepend(weatherPanel);
	setTimeout(function() {
		initTooltips(weatherPanel);
	}, 1000);

	if ($(window).width() < 768) {
		$serverInfoContainer.attr('style', 'text-align: center !important; padding: 0 !important; width: 100% !important;margin-bottom: 0 !important');
    }

    // Determine if it's day or night
    function getImageUrl(weatherCode) {
        // Convert isDay to a number for comparison
        const isDayNumeric = parseInt(data.current.is_day); 
    
        if (weatherCode in weatherData) {
            const timeOfDay = isDayNumeric === 1 ? 'day' : 'night'; // Determine the time of day
            if (timeOfDay in weatherData[weatherCode]) {
                return weatherData[weatherCode][timeOfDay].image;
            }
        }
    }
    

    // Get the image URL
    const imageUrl = getImageUrl(data.current.weather_code);

    // Set the image source
    $('#weatherImage').attr('src', imageUrl);
}


function degreesToDirection(degrees) {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West', 'North'];
    const index = Math.round((degrees % 360) / 45);
    return directions[index];
}

function scheduleNextUpdate() {
    const now = new Date();
    const minutes = now.getMinutes();
    const initialDelay = (15 - (minutes % 15)) * 60 * 1000;

    setTimeout(() => {
        getWeatherData();
        setInterval(getWeatherData, 15 * 60 * 1000);
    }, initialDelay);
}

scheduleNextUpdate();
