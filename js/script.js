/* === Header Content === */
window.addEventListener('scroll', function () {
    var header = document.querySelector('header');
    var scrollPosition = window.scrollY;

    header.style.transition = 'background-color 0.3s';

    if (scrollPosition > 50) {
        if (darkModeBtn.checked) {
            header.classList.add('bg-dark-subtle');
            header.classList.remove('bg-light-subtle');
        } else {
            header.classList.add('bg-light-subtle');
            header.classList.remove('bg-dark-subtle');
        }
    } else {
        header.classList.remove('bg-light-subtle', 'bg-dark-subtle');
    }
});

// Dark Mode
var darkModeBtn = document.getElementById('darkModeToggle');
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.toggle('dark-mode');
    darkModeBtn.checked = true;
}
darkModeBtn.addEventListener('change', function (e) {
    document.body.classList.toggle('dark-mode', this.checked);
    localStorage.setItem('darkMode', this.checked);
});

// Search Input
var search = document.getElementById('searchInput');
search.addEventListener('input', function (e) {
    if (search.value.length >= 3) {
        getCityWeather(search.value);
    } else if (search.value.trim() === '') { //to auto revert to local city info if search is empty
        getLocalCity();
    }
});

/* === Main Content === */
// API
var apiURL = 'https://api.weatherapi.com/v1';
var apiKey = 'fd76922f0b534faf95435643252106';
var endpoints = {
    realtime: '/current.json', //for: temp_c, feelslike_c, condition:text, condition:icon, wind_kph, wind_dir, pressure_mb, humidity, uv
    forecast: '/forecast.json', //for: time of the day and for hourly forecast,  date for the day and next 3 days, avgtemp_c for 3 days, condition:icon for 3 days, sunrise of the day, sunset of the day, wind_degree & wind_kph for hourly forecast
}
// for displaying local country weather, time and date
var city = document.getElementById('cityName');
var time = document.getElementById('cityTime');
var date = document.getElementById('cityDate');

var temp = document.getElementById('temp');
var feels = document.getElementById('feelsLike');
var weatherConditionStat = document.getElementById('weatherConditionName');
var weatherConditionImg = document.getElementById('weatherConditionImg');
var humidity = document.getElementById('humidityValue');
var windspeed = document.getElementById('windSpeedValue');
var pressure = document.getElementById('pressureValue');
var uv = document.getElementById('uvValue');
var rise = document.getElementById('sunriseTime');
var set = document.getElementById('sunsetTime');

var forecastTable = document.getElementById('forecastTableBody');
var hourlyForecast = document.getElementById('hourlyForecast');


async function getLocalCity() {
    try {
        var response = await fetch(`${apiURL}${endpoints.forecast}?key=${apiKey}&q=auto:ip&days=4`);
        var data = await response.json()

        updateWeather(data);
    } catch (err) {
        console.log(err);
    }
}

// for displaying searched city
async function getCityWeather(cityName) {
    try {
        var response = await fetch(`${apiURL}${endpoints.forecast}?key=${apiKey}&q=${cityName}&days=4`);
        var data = await response.json();

        updateWeather(data);
    } catch (err) {
        console.log(err);
    }
}

function updateWeather(data) {
    var countryName = `${data.location.country}, ${data.location.name}`;
    var countryTime = data.location.localtime.slice(11, 16);
    var countryDate = data.location.localtime.slice(0, 10);

    var tempValue = Math.round(data.current.temp_c);
    var feelsValue = Math.round(data.current.feelslike_c);
    var humidityValue = data.current.humidity;
    var pressureValue = data.current.pressure_mb;
    var windspeedValue = Math.round(data.current.wind_kph);
    var uvValue = Math.round(data.current.uv);
    var weatherCondition = data.current.condition.text;
    var weatherConditionIcon = data.current.condition.icon;
    var forecastData = data.forecast.forecastday;
    var sunrise = forecastData[0].astro.sunrise;
    var sunset = forecastData[0].astro.sunset;

    city.innerText = countryName;
    startLiveClock(data.location.localtime);
    date.innerText = countryDate;
    temp.innerText = `${tempValue}C`;
    feels.innerText = `${feelsValue}C`;
    humidity.innerText = `${humidityValue}%`;
    pressure.innerText = `${pressureValue}mb`;
    windspeed.innerText = `${windspeedValue}Kph`;
    weatherConditionStat.innerText = weatherCondition;
    weatherConditionImg.src = `https:${weatherConditionIcon}`;
    uv.innerText = uvValue
    rise.innerText = sunrise;
    set.innerText = sunset;

    forecastTable.innerHTML = '';
    hourlyForecast.innerHTML = '';

    for (var i = 1; i < 4; i++) {
        var forecastDay = forecastData[i];
        var forecastDate = forecastDay.date;
        var avgTemp = Math.round(forecastDay.day.avgtemp_c);
        var icon = `https:${forecastDay.day.condition.icon}`;

        var tr = `<tr>
                        <td><img src="${icon}" alt="weather condition icon"></td>
                        <td class="fw-bold fs-4 text-white">${avgTemp}C</td>
                        <td class="fw-bold fs-5 text-capitalize text-white">${forecastDate}</td>
                    </tr>`;
        forecastTable.innerHTML += tr;
    }

    var hoursForecast = data.forecast.forecastday[0].hour;
    for (var i = 0; i < hoursForecast.length; i += 5) {
        var hour = hoursForecast[i];
        var hourlyTime = hour.time.slice(11, 16);
        var hourlyTemp = Math.round(hour.temp_c);
        var icon = `https:${hour.condition.icon}`;
        var windSpeed = Math.round(hour.wind_kph);
        var windDegree = hour.wind_degree;
        var isNight = hour.is_day === 0 ? 'night' : '';

        var item = `<div class="col-8 col-sm-6 col-md-3 col-lg-2 hourlyForecastCard">
                            <div class="inner hourlyForecastItem ${isNight} rounded-5 p-2">
                                <p class="forecastTime fw-medium fs-4">${hourlyTime}</p>
                                <img src="${icon}" class="forecastConditionImg" alt="weather condition">
                                <p class="forecastTemp fw-bold fs-5">${hourlyTemp}C</p>
                                <i class="h h-arrow-up" style="transform: rotate(${windDegree}deg)"></i>
                                <p class="forecastWindSpeed fw-bold fs-6">${windSpeed}Kph</p>
                            </div>
                        </div>`;
        hourlyForecast.innerHTML += item;

    }

}


// for live time update
function updateTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // convert to 12-hour format
    var formatTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

    time.innerText = formatTime;
}

var clockInterval;

function startLiveClock(timeForm) {
    if (clockInterval) clearInterval(clockInterval);

    var timeUpdate = new Date(timeForm.replace(" ", "T"));

    updateTime(timeUpdate);

    // to update time every minute
    clockInterval = setInterval(function () {
        timeUpdate.setMinutes(timeUpdate.getMinutes() + 1);
        updateTime(timeUpdate);
    }, 60000);
}

getLocalCity()