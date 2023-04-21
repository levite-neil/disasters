//URLs for data
const url = "https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations";
const test = 'https://levite-neil.github.io/disasters/femaData/disaster_data.json'



let map = L.map("map", {
    center: [39.83, -99.09],
    zoom: 5
});

let choroData = geoData;
let disasters2016 = Object.values(annual['2016']);
let disasters2017 = Object.values(annual['2017']);
let disasters2018 = Object.values(annual['2018']);
let disasters2019 = Object.values(annual['2019']);
let disasters2020 = Object.values(annual['2020']);
let disasters2021 = Object.values(annual['2021']);
let disasters2022 = Object.values(annual['2022']);
let disasters2023 = Object.values(annual['2023']);
let disObj = {'2016':disasters2016, '2017':disasters2016, '2018':disasters2016, '2019':disasters2016};

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



const stateArray = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

let stateObj = {};

// Functions to update map
function getColor(d) {
    return d > 5  ? '#800026' :
           d > 4  ? '#BD0026' :
           d > 3  ? '#E31A1C' :
           d > 2  ? '#FC4E2A' :
           d > 1  ? '#FD8D3C' :
           d > 0  ? '#FEB24C' :
           d = 0  ? '#FED976' :
                    '#FFEDA0';
};

function init(){
    //Get the references to the input elements
      //Creating the selectable items
  let dropdown = d3.select("#selState");



  for (let i = 0; i < stateArray.length; i++) {
      dropdown.append("option").text(stateArray[i]).property("value",stateArray[i])
  };

  //Using d3 to query the url
  d3.json(test).then(response => {
    let disasters = response;

  };

};


d3.select("#selYear").on("change", yearChange);
function yearChange() {
    document.getElementById('selDisaster').innerText = null;
    let selection = d3.select("#selYear");
    let year = selection.property('value');
    //updatePie(year);
    
    return(year);    
};
d3.select("#selState").on("change", stateChange);
function stateChange() {
    let selection = d3.select("#selState");
    let state = selection.property('value');
    //updatePlot(state);
    return(state);
  }

//   //Creating the selectable items
//   let select = document.getElementById("selState");
//   for (let i = 0; i < stateArray.length; i++) {
//       let option = stateArray[i];
//       let element = document.createElement("option");
//       element.textContent = option;
//       element.value = option;
//       select.appendChild(element);
//   }

//   for (i = 0; i < stateArray.length; i++) {
//       stateObj[stateArray[i]] = [];
//   }

// D3 call & function
d3.json(test).then(response => {
    let disasters = response;

    // let select = document.getElementById("selState");
    // for (let i = 0; i < stateArray.length; i++) {
    //     let option = stateArray[i];
    //     let element = document.createElement("option");
    //     element.textContent = option;
    //     element.value = option;
    //     select.appendChild(element);
    // }

    // for (i = 0; i < stateArray.length; i++) {
    //     stateObj[stateArray[i]] = [];
    // }

    // d3.select("#selYear").on("change", yearChange);
    // function yearChange() {
    //     document.getElementById('selDisaster').innerText = null;
    //     let selection = d3.select("#selYear");
    //     let year = selection.property('value');
    //     updatePie(year);
    //     return(year);    
    // };


    function updateMap(disasterObj, disaster) {
        let disasterSet = disasterObj;
        let geoData = choroData;
        for (i = 0; i < disasterSet.length; i++) {
                if (disasterSet[i].stateName === geoData.features[i].properties.name) {
                    geoData.features[i].properties = disasterSet[i];
                }
            }
        console.log(geoData);

        let style = {
            fillColor: getColor(geoData.features.properties[disaster]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: .7
            };
        L.geoJson(geoData,style).addTo(map);
    };
     
    d3.select("#selDisaster").on("change", updateDisaster);
    function updateDisaster() {
                let dropdownMenu = d3.select("#selDisaster");
                let disasterType = dropdownMenu.property("value");
                
                year = yearChange();
                updateMap(disObj[year], disasterType);
                return(disasterType);
    };

    function updatePie() {
        let disasterCounts = {};
        let data = [];
        for (let i = 0; i < disasters.length; i++) {
            if (disasters[i].incidentBeginDate.includes(yearChange())) {
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
                text: `Disasters Breakdown for ${yearChange()}`
            }
        });
        
    }



    // Update the scatterplot for state
    
    // function stateChange() {
    //     let selection = d3.select("#selState");
    //     state = selection.property('value');
    //     updatePlot(state);
    //   }

    //d3.select("#selState").on("change", stateChange);

    function updatePlot(state) {
        let yearlyCounts = {'2016':0,'2017':0,'2018':0,'2019':0,'2020':0,'2021':0,'2022':0,'2023':0};
        console.log(state);
        
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
  ;
    updatePlot(stateChange())
    updatePie();
    //updatePlot('AL');
    // updateMap(disObj['2016'],'Fire');
});
//updatePie(2016);
//updatePlot('AL');
//updateMap(disObj['2016'],'Fire');