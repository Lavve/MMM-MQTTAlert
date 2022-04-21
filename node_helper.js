const mqtt = require('mqtt');
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
  start: function () {
    console.log(`${this.name}: Starting node helper`);
  },

  socketNotificationReceived: function (notification, config) {
    console.log(`${this.name}: Notification from ${notification}`);

    if (notification === 'MQTTALERT_CONFIG') {
      const that = this;
      const options = {};
      const mqttProtocol = config.mqttServer.address.match(/^mqtts?:\/\//);
      const server = (mqttProtocol ? '' : 'mqtt://') + config.mqttServer.address;

      if (config.mqttServer.user)
        options.username = config.mqttServer.user;
      if (config.mqttServer.password)
        options.password = config.mqttServer.password;

      that.client = mqtt.connect(server, options);

      that.client.on('error', (error) => {
        console.log(`${that.name}: Error - ${String(error)}`);
      });

      that.client.on('reconnect', () => {
        that.status = 'reconnecting';
      });

      that.client.on('offline', () => {
        console.log(`${that.name}: Client has gone offline from broker`);
      });

      that.client.on('connect', () => {
        that.client.subscribe(config.topics, () => {});
        console.log(`${that.name}: Connected to ${server}`);
      });

      that.client.on('message', (topic, payload) => {
        console.log(`${that.name}: Message on ${topic}`);

        if (config.topics.includes(topic)) {
          const value = payload.toString();
          const [id, message] = value.split('|');

          that.sendSocketNotification('MQTT_ALERT', {
            topic: topic,
            id: id,
            message: message,
            time: Date.now(),
          });
        }
      });
    }
  }
});
