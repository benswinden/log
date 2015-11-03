

// =========
// Variables
// =========

var defaultMaxNumberOfHours = 12;      // Max number of hours to display on the y axis of the graph by default
var currentmaxNumberOfHours;

daysInMonths = [31,28,31,30,31,30,31,31,30,31,30,31];

var databaseEntries;

// Date
var currentDate = new Date();
var today = currentDate.getDate();
var currentMonth = currentDate.getMonth(); // 0 index, 0 = january
var todaysDateIndex;

var currentMode = 0; // 0 : Weekly   1 : Last Days

// *******
$(document).ready(function(){

    retrieveData();
});
// *******

function toggleMode() {


}

// Retrieve data from the database, when complete, initialize the page
function retrieveData() {

    // Retrieve data
    $.post("/retrievenohtml", function(data){

        // Callback
        if( data != null) {
            console.log("Data returned | Entries: " + data.length);
            databaseEntries = data;

            initialize();
        }
    });
}

// Initialize all the different components of the page individually
function initialize() {

    initializeChart();
    initializeInfoDisplay();
}

// Chart - Weekly
function initializeChart() {

    // Get the desired dates to pull data from
    var dates = getDatesWeekly();
    // var dates = getDatesLastDays(7);

    var times = getHoursWorked(dates);

    // Set the title
    // $(".chart-title").text("Work per day : Last " + dates.length + " days");

    var finalData = {
        labels: dates,
        datasets: [
            {
                label: "Dataset",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: times
            }
        ]
    };

    // Set up the default value applied to all Chart.js charts
    setChartDefaults();
    // Get context with jQuery - using jQuery's .get() method.
    var ctx = $("#canvas").get(0).getContext("2d");
    // This will get the first returned node in the jQuery collection.

    var chart = new Chart(ctx).Line(finalData, {

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - Whether the line is curved between points
        bezierCurve : false,

        //Number - Tension of the bezier curve between points
        bezierCurveTension : 0.4,

        //Boolean - Whether to show a dot for each point
        pointDot : true,

        //Number - Radius of each point dot in pixels
        pointDotRadius : 4,

        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth : 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius : 20,

        //Boolean - Whether to show a stroke for datasets
        datasetStroke : true,

        //Number - Pixel width of dataset stroke
        datasetStrokeWidth : 2,

        //Boolean - Whether to fill the dataset with a colour
        datasetFill : true,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    });

    chart.datasets[0].points[todaysDateIndex].fillColor ="#00E68A";
    chart.update();
}

// Text info
function initializeInfoDisplay() {

    var dates = getDatesWeekly();
    var times = getHoursWorked(dates);

    // title
    //$(".info-display-title").text("Info : Last " + dates.length + " days");

    var hoursThisWeek = 0;

    for (var i = 0; i < times.length; i++) {
        hoursThisWeek += times[i];
    }

    $('.info-display').append("<p>Total Hours: " + hoursThisWeek + " </p>");
}


// =========
// Utilities
// =========

// Give the day to start at, number of days works backward from the start day, returns an array of labels that indicate the day number and an array of hours worked that day
function getHoursWorked(dates) {

    currentmaxNumberOfHours = defaultMaxNumberOfHours;  // Reset this value for using with charts

    var times = [];

    // Loop for seven days, including today
    for (var i = 0; i < dates.length; i++) {

        times.push(0);

        // Turn the date into integers, check for leading zeroes
        var month = parseInt(dates[i].substring(0,2));
        var day = parseInt(dates[i].substring(3,5));

        // Loop through our data, getting all hours worked for the current day
        for (var j = 0; j < databaseEntries.length; j++) {

            if (databaseEntries[j].date.substring(5,7) == month && databaseEntries[j].date.substring(8,10) == day) {

                times[times.length - 1] += databaseEntries[j].endtime - databaseEntries[j].starttime;
            }
        }

        // If we have worked more than the set max number of hours to display on the y axis, increase that number
        if (times[times.length - 1] > currentmaxNumberOfHours) currentmaxNumberOfHours = times[times.length - 1];
    }

    return times;

}

// Get the date numbers in a given set: From a weekly period, monday - sunday
function getDatesWeekly() {

    // Init labels with the correct days
    var currentDayOfTheWeek = currentDate.getDay();
    var dates = [];

    // getDay returns 0: Sunday, 6: Saturday. We want sunday to be 6
    if (currentDayOfTheWeek == 0) currentDayOfTheWeek = 6;
    else currentDayOfTheWeek -= 1;

    // Add days before current day
    for (var i = 0; i < currentDayOfTheWeek; i++) {

        var month = currentMonth;
        var day = today - (currentDayOfTheWeek - i);

        // If we have to move the day back to the end of the last month
        if (day < 1) {
            month = currentMonth - 1;
            if (month == -1) month = 11;
            day = daysInMonths[month] + day;
        }

        if (day < 10) { day = '0' + day }
        month += 1; if (month < 10) { month = '0' + month }
        var date = month + "." + day;
        dates.push(date)
    }
    // Add days including today and days after
    for (var j = 0; j < 7 - currentDayOfTheWeek; j++) {

        var month = currentMonth;
        var day = today + j;

        // If we have to move the day forward to the start of the next month
        if (day > daysInMonths[currentMonth]) {

            var month = currentMonth + 1;
            if (month > 11) month = 0;

            day = day - daysInMonths[currentMonth];
        }

        if (day < 10) { day = '0' + day }
        month += 1; if (month < 10) { month = '0' + month }
        var date = month + "." + day;
        dates.push(date)
    }

    todaysDateIndex = currentDayOfTheWeek;
    return dates;
}

function getDatesLastDays(numberOfDays) {

    var dates = [];

    // Loop for seven days, including today
    for (var i = 0; i < numberOfDays; i++) {

        var month = currentMonth;
        var day = today - ((numberOfDays - 1) - i);

        // If we have to move the day back to the end of the last month
        if (day < 1) {
            month = currentMonth - 1;
            if (month == -1) month = 11;
            day = daysInMonths[month] + day;
        }

        // Format with leading zeroes and push the day and month together
        if (day < 10) { day = '0' + day }
        month += 1; if (month < 10) { month = '0' + month }
        var date = month + "." + day;
        dates.push(date)
    }

    todaysDateIndex = dates.length - 1;
    return dates;
}

// Global defaults for Chart.js charts
function setChartDefaults() {

    Chart.defaults.global = {
        // Boolean - Whether to animate the chart
        animation: true,

        // Number - Number of animation steps
        animationSteps: 60,

        // String - Animation easing effect
        // Possible effects are:
        // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
        //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
        //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
        //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
        //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
        //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
        //  easeOutElastic, easeInCubic]
        animationEasing: "easeOutQuart",

        // Boolean - If we should show the scale at all
        showScale: true,

        // Boolean - If we want to override with a hard coded scale
        scaleOverride: true,

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: currentmaxNumberOfHours,
        // Number - The value jump in the hard coded scale
        scaleStepWidth: 1,
        // Number - The scale starting value
        scaleStartValue: 0,

        // String - Colour of the scale line
        scaleLineColor: "rgba(0,0,0,.1)",

        // Number - Pixel width of the scale line
        scaleLineWidth: 1,

        // Boolean - Whether to show labels on the scale
        scaleShowLabels: true,

        // Interpolated JS string - can access value
        scaleLabel: "<%=value%>",

        // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
        scaleIntegersOnly: true,

        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: false,

        // String - Scale label font declaration for the scale label
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Scale label font size in pixels
        scaleFontSize: 12,

        // String - Scale label font weight style
        scaleFontStyle: "normal",

        // String - Scale label font colour
        scaleFontColor: "#666",

        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: false,

        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,

        // Boolean - Determines whether to draw tooltips on the canvas or not
        showTooltips: true,

        // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
        customTooltips: false,

        // Array - Array of string names to attach tooltip events
        tooltipEvents: ["mousemove", "touchstart", "touchmove"],

        // String - Tooltip background colour
        tooltipFillColor: "rgba(0,0,0,0.8)",

        // String - Tooltip label font declaration for the scale label
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip label font size in pixels
        tooltipFontSize: 14,

        // String - Tooltip font weight style
        tooltipFontStyle: "normal",

        // String - Tooltip label font colour
        tooltipFontColor: "#fff",

        // String - Tooltip title font declaration for the scale label
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip title font size in pixels
        tooltipTitleFontSize: 14,

        // String - Tooltip title font weight style
        tooltipTitleFontStyle: "bold",

        // String - Tooltip title font colour
        tooltipTitleFontColor: "#fff",

        // Number - pixel width of padding around tooltip text
        tooltipYPadding: 6,

        // Number - pixel width of padding around tooltip text
        tooltipXPadding: 6,

        // Number - Size of the caret on the tooltip
        tooltipCaretSize: 8,

        // Number - Pixel radius of the tooltip border
        tooltipCornerRadius: 6,

        // Number - Pixel offset from point x to tooltip edge
        tooltipXOffset: 10,

        // String - Template string for single tooltips
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

        // String - Template string for multiple tooltips
        multiTooltipTemplate: "<%= value %>",

        // Function - Will fire on animation progression.
        onAnimationProgress: function(){},

        // Function - Will fire on animation completion.
        onAnimationComplete: function(){}
    }
}
