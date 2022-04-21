Module.register('MMM-MQTTAlert', {
  // Default module config
  defaults: {
    removeMessage: 'EMPTY',
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
        const alertId = makeId(payload.id);

        if ( payload.id === 'ALL' && payload.message === this.config.removeMessage ) {
          this.removeAlerts();
        } else if (payload.message === this.config.removeMessage) {
          this.removeAlert(alertId);
        } else if (payload.message !== this.config.removeMessage) {
          this.makeAlerts(alertId, payload.message);
        }
      }
    }
  },

  removeAlerts: function (id) {
    [...document.querySelectorAll('.mmm-mqttalert__message')].forEach(el => {
      el.remove();
    })

    this.alerts = {};
    this.updateDom();
  },

  removeAlert: function (id) {
    const el = document.querySelector(`#${id}`);
    if (el !== null) el.remove();
    if (this.alerts.hasOwnProperty(id)) delete this.alerts[id];
    this.updateDom();
  },

  makeAlerts: function (id, value) {
    this.alerts[id] = value;
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
