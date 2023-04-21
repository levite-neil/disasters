let map = L.map("map", {
    center: [39.83, -99.09],
    zoom: 5
});

const choroData = geoData;
let disasters2016 = Object.values(annual['2016']);
let disasters2017 = Object.values(annual['2017']);
let disasters2018 = Object.values(annual['2018']);
let disasters2019 = Object.values(annual['2019']);
let disasters2020 = Object.values(annual['2020']);
let disasters2021 = Object.values(annual['2021']);
let disasters2022 = Object.values(annual['2022']);
let disasters2023 = Object.values(annual['2023']);
let disObj = {'2016':disasters2016, '2017':disasters2017, '2018':disasters2018, '2019':disasters2019,'2020':disasters2020,'2021':disasters2021,'2022':disasters2022,'2023':disasters2023};

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const url = "https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations";
const test = 'https://levite-neil.github.io/disasters/femaData/disaster_data.json'

const stateArray = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

let stateObj = {};

// Functions to update map
function getColor(d) {
    return d > 6  ? '#800026' :
           d > 5  ? '#BD0026' :
           d > 4  ? '#E31A1C' :
           d > 3  ? '#FC4E2A' :
           d > 2  ? '#FD8D3C' :
           d > 1  ? '#FEB24C' :
           d > 0  ? '#FED976' :
                    '#FFEDA0';
};

// D3 call & function
d3.json(test).then(response => {
    let disasters = response;

    let select = document.getElementById("selState");
    for (let i = 0; i < stateArray.length; i++) {
        let option = stateArray[i];
        let element = document.createElement("option");
        element.textContent = option;
        element.value = option;
        select.appendChild(element);
    }

    for (i = 0; i < stateArray.length; i++) {
        stateObj[stateArray[i]] = [];
    }

    d3.select("#selYear").on("change", yearChange);
    function yearChange() {
        document.getElementById('selDisaster').innerText = null;
        let selection = d3.select("#selYear");
        year = selection.property('value');
        updatePie(year);
        return(year);    
    };


    function updateMap(disasterObj, disaster) {
        let disasterSet = disasterObj;
        let geoData = choroData;
        for (i = 0; i < disasterSet.length; i++) {
            for (j = 0; j < geoData['features'].length; j++) {
                if (disasterSet[i].stateName === geoData.features[j].properties.name) {
                    geoData.features[j].properties.density = disasterSet[i][disaster];
                }
                
        }}
            
        

        function style(feature) {
                return {
                fillColor: getColor(feature.properties.density),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: .7
                };}
        L.geoJson(geoData,{style:style}).addTo(map);
    };

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6, 7],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + '<br>';
    }

    return div;
};
legend.addTo(map);
    
    


    d3.select("#selDisaster").on("change", updateDisaster);
    function updateDisaster() {
                let dropdownMenu = d3.select("#selDisaster");
                let disasterType = dropdownMenu.property("value");
                
                year = yearChange();
                updateMap(disObj[year], disasterType);
                return(disasterType);
    };

    function updatePie(year) {
        let disasterCounts = {};
        let data = [];
        for (let i = 0; i < disasters.length; i++) {
            if (disasters[i].incidentBeginDate.includes(year)) {
                let disType = disasters[i].incidentType;
                if (disType in disasterCounts) {
                    disasterCounts[disType] ++;
                }
                else{
                    disasterCounts[disType] = 1;
                }
            }
        }
        let counter = 1
        for (key in disasterCounts) {
            let dataObj = {name:key, value:disasterCounts[key],colorValue:counter};
            counter ++;
            data.push(dataObj);


            let select = document.getElementById("selDisaster");
            let option = key;
            let element = document.createElement("option");
            element.textContent = option;
            element.value = option;
            select.appendChild(element);

        }

        Highcharts.chart('pie', {
            colorAxis: {
                minColor: '#FFFFFF',
                maxColor: Highcharts.getOptions().colors[0]
            },
            series: [{
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                clip: false,
                data:data
            }],
            title: {
                text: `Disasters Breakdown for ${year}`
            }
        });
        
    }



    // Update the scatterplot for state
    
    function stateChange() {
        let selection = d3.select("#selState");
        state = selection.property('value');
        updatePlot(state);
      }

    d3.select("#selState").on("change", stateChange);
    function updatePlot(state) {
        let yearlyCounts = {'2016':0,'2017':0,'2018':0,'2019':0,'2020':0,'2021':0,'2022':0,'2023':0};
        
        for (let i = 0; i < disasters.length; i++) {

            let year = disasters[i].incidentBeginDate.slice(0,4);
            if (year > 2015) {
            if (disasters[i].stateCode === state) {
                yearlyCounts[year] ++;
            }}
        }
        let trace = [{
            x: Object.keys(yearlyCounts),
            y: Object.values(yearlyCounts),
            type: 'scatter'
        }]
        var layout = {
            xaxis: {
              autotick: false,
              ticks: 'outside',
              tick0: 2016,
              dtick: 1,
              ticklen: 5,
              tickwidth: 2,
              tickcolor: '#000'
            },
            title: {
                text: `Yearly Disasters for ${state}`
            }
        };
        Plotly.newPlot('plot',trace,layout);
    }
    updatePie(2016);
    updatePlot('AL');
    // updateMap(disObj['2016'],'Fire');
});