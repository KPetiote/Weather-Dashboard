// Today's Date using Moment
var todayDate = moment().format('L');

// Web API Key from OpenWeather API
var apiKey = "6173ab8c4ac062c85e154afa01ed5a8d";

// Array for past search History
var weatherSearchHistory = [];

// Function for current weather condition
function currentCondition(city){
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(cityWeatherResponse) {
        console.log(cityWeatherResponse);
        
        $("#weatherInformation").css("display", "block");
        $("#cityInformation").empty();
        
        var iconCode = cityWeatherResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        var currentCity = $(`
        <h2 id="currentCity">
            ${cityWeatherResponse.name} ${todayDate} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
        <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
    `);

    $("#cityInformation").append(currentCity);

    // Latitude and Longitude are needed UV Index
    var cityLat = cityWeatherResponse.coord.lat;
    var cityLon = cityWeatherResponse.coord.lon;
    var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}`;
    // Gets UV Index Informatinon
    $.ajax({
        url: uviQueryURL,
        method: "GET"
    }).then(function(uviResponse) {
        console.log(uviResponse);

        var uvIndex = uviResponse.value;
        var uvIndexP = $(`
            <p>UV Index: 
                <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `);

        $("#cityInformation").append(uvIndexP);

        futureCondition(cityLat, cityLon);
        
        if (uvIndex >= 0 && uvIndex <= 2) {
            $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            $("#uvIndexColor").css("background-color", "#FFF300");
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            $("#uvIndexColor").css("background-color", "#F18B00");
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
        } else {
            $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white"); 
        };  
    });
});
}

// function for future condition
function futureCondition(cityLat, cityLon) {

    // THEN I am presented with a 5-day forecast
    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function(futureResponse) {
        console.log(futureResponse);
        $("#fiveDayForecast").empty();
        
        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                humidity: futureResponse.daily[i].humidity
            };

            var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#fiveDayForecast").append(futureCard);
        }
    }); 
}

// add on click event listener 
$("#searchButton").click(function(event) {
    event.preventDefault();

    var city = $("#searchCity").val().trim();
    console.log(city);
    currentCondition(city);
    if (!weatherSearchHistory.includes(city)) {
        weatherSearchHistory.push(city);
        createHistoryButton(city);
    };
    
    localStorage.setItem("city", JSON.stringify(weatherSearchHistory));
    console.log(weatherSearchHistory);
});

function createHistoryButton(city) {
    var searchedCity = $(`
    <li class="list-group-item">${city}</li>
    `);
$("#weatherSearchHistory").append(searchedCity);
}
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
$(document).on("click", ".list-group-item", function() {
    var listCity = $(this).text();
    currentCondition(listCity);
});

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
        for (i = 0; i < searchHistoryArr.length; i++){
            createHistoryButton(searchHistoryArr[i])
        }
        weatherSearchHistory = searchHistoryArr;
    }
});
