'use strict';

const bodySize = 0.4; // Kb
const requestHeaderSize = 0.55; // Kb
const responseHeaderSize = 2.29; // Kb

const observationStorageSize = 0.24; // Kb

const secondsPerDay = 86400;
const secondsPerMonth = 2630000;

const app = {
  init: function() {
    this.sensorStations = document.getElementById('number-sensor-stations');
    this.observationsFrequency = document.getElementById('observations-frequency');
    this.cloudFrequency = document.getElementById('cloud-frequency');
    this.goButton = document.getElementById('go-button');
    this.goButton.addEventListener('click', this.go.bind(this));
    this.form = document.querySelector('form');
    this.form.addEventListener('reset', this.onreset.bind(this));
    this.form.addEventListener('submit', function(e) { e.preventDefault(); });
    this.results = document.getElementById('results');
  },

  go: function() {
    // Requests per second sent to the cloud by all sensor stations.
    var cloudRps = this.sensorStations.value / this.cloudFrequency.value;

    // Number of requests a single station makes per day.
    var singleRequestsPerDay = secondsPerDay / this.cloudFrequency.value;
    // Number of requests per day done by all sensor stations.
    var requestsPerDay = singleRequestsPerDay * this.sensorStations.value;
    // Number of requests per month done by all sensor stations.
    var requestsPerMonth = requestsPerDay * 30;

    /** Bandwith requirement. **/

    // Number of observations done during the cloud refresh frequency.
    var observations = this.cloudFrequency.value / this.observationsFrequency.value;
    // Size of the requests sent to the cloud.
    var requestSize = (observations * bodySize) + requestHeaderSize;
    // Size of the responses coming from the cloud.
    var responseSize = (observations * bodySize) + responseHeaderSize;

    var kbInPerMonth = requestsPerMonth * requestSize;
    var kbOutPerMonth = requestsPerMonth * responseSize;

    var GbInPerMonth = kbInPerMonth / 1024 / 1024;
    var GbOutPerMonth = kbOutPerMonth / 1024 / 1024;

    /** Storage requirement **/
    var singleStoragePerDay = (singleRequestsPerDay * observations * observationStorageSize) / 1024; // MB
    var singleStoragePerMonth = singleStoragePerDay * 30;
    var storagePerDay = (singleStoragePerDay * this.sensorStations.value) / 1024; // GB
    var storagePerMonth = (singleStoragePerMonth * this.sensorStations.value) / 1024; // GB

    this.results.innerHTML =
      '<p>Requests per seconds: <b>' + cloudRps + '</b></p>' +
      '<p>Data In: <b>~' + GbInPerMonth + ' GB/month</b></p>' +
      '<p>Data Out: <b>~' + GbOutPerMonth + ' GB/month</b></p>' +
      '<p>Storage requirement per sensor station: ~' + singleStoragePerDay + ' MB/day' + ' == <b>' + singleStoragePerMonth + ' MB/month</b>' +
      '<p>Storage requirement for all sensor stations: ~' + storagePerDay + ' GB/day' + ' == <b>' + storagePerMonth + ' GB/month</b>';
    this.results.hidden = false;

    console.log('Gb In', GbInPerMonth);
    console.log('Gb Out', GbOutPerMonth);
  },

  onreset: function() {
    this.results.hidden = true;
    this.results.innerHTML = '';
  }
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  app.init();
});
