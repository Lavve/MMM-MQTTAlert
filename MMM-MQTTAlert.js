Module.register('MMM-MQTTAlert', {
  // Default module config
  defaults: {
    removeAllMessage: 'REMOVEALL',
    fontSize: '2rem',
    mqttServer: {},
  },

  start: function () {
    Log.info(`Starting module: ${this.name}`);
    this.alerts = {};
    this.openMqttConnection();
  },

  getStyles: function () {
    return [this.file(`${this.name}.css`)];
  },

  getScripts: function () {
    return [this.file(`${this.name}_utils.js`)];
  },

  openMqttConnection: function () {
    this.sendSocketNotification('MQTTALERT_CONFIG', this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'MQTT_ALERT' && payload !== null) {
      Log.info('Received message: ', payload);

      if (this.config.topics.includes(payload.topic)) {
        if (payload.message === this.config.removeAllMessage) {
          this.removeAlerts();
        } else {
          this.toggleAlert(payload);
        }
      }
    }
  },

  removeAlerts: function (id) {
    [...document.querySelectorAll('.mmm-mqttalert__message')].forEach(el => {
      el.remove();
    });
    this.alerts = {};
    this.updateDom();
  },

  toggleAlert: function (payload) {
    if (this.alerts.hasOwnProperty(payload.id)) {
      const el = document.querySelector(`#${payload.id}`);
      if (el !== null) el.remove();
      delete this.alerts[payload.id];
    } else {
      this.alerts[payload.id] = payload.message;
    }
    this.updateDom();
  },

  getDom: function () {
    const wrapper = document.createElement('div');
    wrapper.className = `${this.name.toLowerCase()}-wrapper`;
    const alerts = Object.keys(this.alerts);

    if (alerts.length) {
      alerts.forEach((id) => {
        const msgEl = document.createElement('div');
        msgEl.id = id;
        msgEl.classList.add(
          `${this.name.toLowerCase()}__message`,
          'thin',
          'bright',
          'pre-line',
          );
        msgEl.style.fontSize = makeFontSize(this.config.fontSize);
        msgEl.innerHTML = this.alerts[id];

        wrapper.appendChild(msgEl);
      });
    }
    
    return wrapper;
  }
});
