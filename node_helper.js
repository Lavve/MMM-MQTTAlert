const mqtt = require('mqtt');
const NodeHelper = require('node_helper');
const { makeId } = require('./MMM-MQTTAlert_utils');

module.exports = NodeHelper.create({
  start: function () {
    console.log(`${this.name}: Starting node helper`);
  },

  startClient: function (config) {
    const that = this;
    const options = {};
    const mqttProtocol = config.mqttServer.address.match(/^mqtts?:\/\//);
    const server = (mqttProtocol ? '' : 'mqtt://') + config.mqttServer.address;

    console.log(`${this.name}: Starting client for ${server}`);

    options.username = config.mqttServer.username ? config.mqttServer.username : null;
    options.password = config.mqttServer.password ? config.mqttServer.password : null;

    that.client = mqtt.connect(server, options);

    that.client.on('error', (error) => {
      console.log(`${that.name}: Error - ${String(error)}`);
    });

    that.client.on('reconnect', () => {
      that.status = 'reconnecting';
    });

    that.client.on('offline', () => {
      console.log(`${that.name}: Client disconnected to ${server}`);
    });

    that.client.on('connect', () => {
      that.client.subscribe(config.topics, () => {});
      console.log(`${that.name}: Client connected to ${server}`);
    });

    that.client.on('message', (topic, payload) => {
      console.log(`${that.name}: Message on ${topic}: ${payload.toString()}`);
      const isOff = payload
        .toString()
        .trim()
        .slice(0, -Math.abs(config.removeMessage.length)) === config.removeMessage;
      const message = isOff
        ? payload.toString().trim().slice(0, -Math.abs(config.removeMessage.length))
        : payload.toString().trim();

      if (config.topics.includes(topic) && message !== '') {
        that.sendSocketNotification('MQTT_ALERT', {
          topic: topic,
          id: makeId(message),
          isoff: isOff,
          message: message,
          time: Date.now(),
        });
      }
    });
  },

  socketNotificationReceived: function (notification, config) {
    console.log(`${this.name}: Notification from ${notification}`);

    if (notification === 'MQTTALERT_CONFIG') {
      clearTimeout(this.startTimeout);
      this.startTimeout = setTimeout(() => {
        this.startClient(config);
      }, 1800);
    }
  }
});
