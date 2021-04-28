var allData = new Array();
var detaultData = [{ "age": "10 to 14", "depression": 0 }, { "age": "15 to 19", "depression": 0 }, { "age": "20 to 24", "depression": 0 },
    { "age": "25 to 29", "depression": 0 }, { "age": "30 to 34", "depression": 0 }, { "age": "50 to 69", "depression": 0 }, { "age": "70+", "depression": 0 },
    { "age": "All Ages", "depression": 0 }
]
        
var prevalenceData = detaultData;
var currentCode;
var currentYear = document.getElementById('year-select').value;
// var colors = d3.scale.category10();
var colors = d3.scale.linear().domain([1,10])
    .range(["white", "red"])

var chartWidth = 300, chartHeight = 300;

function drawChart(data) {
    var list = document.getElementById("chart");
    if (list.childElementCount > 0) list.removeChild(list.childNodes[0]);
    var available = document.getElementById("dataAvailable");
    if (available.childElementCount > 0) available.removeChild(available.childNodes[0]);
    available.setAttribute("style", "display: none;");

    // Chart Size Setup
    var margin = { top: 35, right: 0, bottom: 50, left: 40 };

    var width = chartWidth - margin.left - margin.right;
    var height = chartHeight - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scales
    var x = d3.scale.ordinal()
        .domain(data.map(function (d) { return d['age']; }))
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .domain([0, 20])
        .range([height, 0]);

    // Axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Title
    chart.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + 40)
        .text("Age Group");

    // Y axis label:
    chart.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -margin.top)
        .text("Prevalence of depression(%)")

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span style='color:white'>" + d.depression + "</span>";
        })
    
   
    // Bars
    var bar = chart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d['age']); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0)
        .attr("fill", function (d) { return colors(d['depression']) })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    
    bar.transition()
        .duration(1500)
        .ease("elastic")
        .attr("y", function (d) { return y(d['depression']); })
        .attr("height", function (d) { return height - y(d['depression']); })

    //Tooltip
    bar.call(tip);
}

function makeChartVal(arr, data) {
    arr.push({ "age": "10 to 14", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 10 to 14 (Percent)'] },
        { "age": "15 to 19", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 15 to 19 (Percent)'] },
        { "age": "20 to 24", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 20 to 24 (Percent)'] },
        { "age": "25 to 29", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 25 to 29 (Percent)'] },
        { "age": "30 to 34", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 30 to 34 (Percent)'] },
        { "age": "50 to 69", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 50-69 years (Percent)'] },
        { "age": "70+", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: 70+ years (Percent)'] },
        { "age": "All Ages", "depression": data['Prevalence - Depressive disorders - Sex: Both - Age: All Ages (Percent)'] });
}

function makeColor(percentage) {
    if (percentage >= 0 && percentage < 2) {
        return colors(0);
    }
    else if (percentage >= 2 && percentage < 4) {
        return colors(3.3);
    }
    else if (percentage >= 4 && percentage < 6) {
        return colors(6.6);
    }
    else if (percentage >= 6) {
        return colors(10);
    }
}

function setCountries(arr, year) {
   for (var i = 0; i < arr.length; i++) {
        if (arr[i].Year == year) {
            var percentage = arr[i]["Prevalence - Depressive disorders - Sex: Both - Age: All Ages (Percent)"];
            var selectedGeo = {};
            selectedGeo[arr[i].Code] = makeColor(percentage);
            map.updateChoropleth(selectedGeo);
        }
    }
}

function setChart(code) {
    prevalenceData = [];
    var flag = 0;
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].Year == currentYear && allData[i].Code == code) {
            makeChartVal(prevalenceData, allData[i]);
            drawChart(prevalenceData);
            flag = 1;
        }
    }
    if (flag == 0) {
        prevalenceData = detaultData;
        drawChart(prevalenceData);
        var available = document.getElementById("dataAvailable");
        available.setAttribute("style", "display: block;");
        var noInfo = document.createElement("p");
        var info = document.createTextNode("No data available");
        noInfo.appendChild(info);
        available.appendChild(noInfo);
    }
}

function setCountryName(name) {
    var val = document.getElementById('country');
    while (val.childNodes.length > 2) {
        val.removeChild(val.lastChild);
    }
    var country = document.createElement("p");
    var text = document.createTextNode(name);
    country.appendChild(text);
    val.appendChild(country);
    currentCountry = name;
}

var map = new Datamap({
    element: document.getElementById("worldmap"),
    projection: 'mercator',
    fills: {
        defaultFill: "#808080",
    },
    height: 900,
    done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
            setCountryName(geography.properties.name);
            setChart(geography.id);
            currentCode = geography.id;
        });
    },
})

map.svg.call(d3.behavior.zoom().on('zoom', function () {
     map.svg.selectAll('g').attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')')
}));

d3.csv("data/prevalence-of-depression-by-age.csv", function (data) {
    setCountries(data, currentYear);
    for (var i = 0; i < data.length; i++) {
        allData.push(data[i]);
    }
    drawChart(prevalenceData);
});

function redraw(year, code) {
    prevalenceData = [];
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].Year == year && allData[i].Code == code) {
            makeChartVal(prevalenceData, allData[i]);
            drawChart(prevalenceData);
        }
    }
}

$( function() {
    $("#year-select").change(function (event) {
        year = event.target.value;
        setCountries(allData, year);
        redraw(year, currentCode);
    })
});