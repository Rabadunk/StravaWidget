const axios = require('axios');
const D3Node = require('d3-node');
require('dotenv').config();
const auth_link = "https://www.strava.com/oauth/token";

let buildChart = async (activities) => {
    const d3n = new D3Node({styles:".count {font: bold 40px sans-serif;}.main {font: bold 30px Tahoma; fill: #fc4c02;}"});

    let total_runs_count = activities.all_run_totals.count;
    let total_distance =  parseInt(activities.all_run_totals.distance/1000);
    let hours = parseInt(activities.all_run_totals.moving_time/3600);
    let minutes = parseInt((activities.all_run_totals.moving_time/3600 - hours)*60);


    let svgChart = d3n.createSVG(500, 120);
    svgChart.append('text').text('STRAVA').attr('class', 'main').attr('x', 10).attr('y', 30).attr("font-family", "Tahoma");
    svgChart.append('text').text('Runs').attr('class', 'title').attr('x', 10).attr('y', 60).attr("font-family", "Arial, Helvetica, sans-serif");
    svgChart.append('text').text(`${total_runs_count}`).attr('class', 'count').attr('x', 10).attr('y', 110);
    svgChart.append('text').text('Distance').attr('class', 'title').attr('x', 120).attr('y', 60).attr("font-family", "Arial, Helvetica, sans-serif");
    svgChart.append('text').text(`${total_distance} km`).attr('class', 'count').attr('x', 120).attr('y', 110);
    svgChart.append('text').text('Time').attr('class', 'title').attr('x', 310).attr('y', 60).attr("font-family", "Arial, Helvetica, sans-serif");;
    svgChart.append('text').text(`${hours}h ${minutes}m`).attr('class', 'count').attr('x', 310).attr('y', 110);

    return d3n.svgString();
}

let getActivites = async (res) => {

    const instance = axios.create({
        baseURL: "https://www.strava.com/oauth/token",
        timeout: 1000,
        headers: {'Authorization': 'Bearer '+res.access_token}
      
    });

    const { data: response } = await instance.get(`https://www.strava.com/api/v3/athletes/${process.env.STRAVA_USER_ID}/stats`);
    return response;
}

let getRefreshToken = async () => {

    const { data: response } = await axios.post(auth_link, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'},
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: process.env.STRAVA_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        });

    return response;
}

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    let refreshToken = await getRefreshToken();
    let activities = await getActivites(refreshToken);
    let chart = await buildChart(activities);
    console.log(chart);
    res.status(200).send(chart);
};