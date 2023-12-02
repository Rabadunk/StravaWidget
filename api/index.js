const axios = require('axios');
const D3Node = require('d3-node');
require('dotenv').config();
const auth_link = "https://www.strava.com/oauth/token";

async function buildChart() {
    const d3n = new D3Node({styles:'.blah{fill:#fddb53;}.bar:hover{fill:#a9a9a9;opacity: 0.6;cursor:pointer;}.bar {fill:#fddb53;animation: load 2.5s;}.title{font-family:helvetica;font-size:13px;}.label{font-family:helvetica;font-size:8px;}@keyframes load { from{y: 120px; fill:orange;}}'});
    let svgChart = d3n.createSVG(460, 170);
    svgChart.append('text').text('Cases by DHB').attr('class', 'title').attr('x', 176).attr('y', 20);

    return d3n.svgString();
}

let getActivites = async (res) => {

    const instance = axios.create({
        baseURL: "https://www.strava.com/oauth/token",
        timeout: 1000,
        headers: {'Authorization': 'Bearer '+res.access_token}
      
    });

    instance.get(`https://www.strava.com/api/v3/athletes/${process.env.STRAVA_USER_ID}/stats`)
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.log(error);
    });
}

function getRefreshToken(){
        
    axios.post(auth_link, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'},
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: process.env.STRAVA_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
        .then(function (response) {
            getActivites(response.data);
        })
        .catch(function (error) {
            console.log(error.data);
        });
}

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');

    let chart = await buildChart();
    res.status(200).send(chart);
};