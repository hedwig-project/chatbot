'use strict';

// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message,
    },
  };
}

function close(sessionAttributes, fulfillmentState, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
    },
  };
}

function closeWithImage(sessionAttributes, fulfillmentState, imageUrl) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message: {
        contentType: 'PlainText',
        content: 'Here it is!',
      },
      responseCard: getResponseCard('Your home', imageUrl),
    },
  };
}

function delegate(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Delegate',
      slots,
    },
  };
}

function getResponseCard(title, imageUrl) {
  return {
    contentType: 'application/vnd.amazonaws.card.generic',
    genericAttachments: [
      {
        title: 'Your home',
        imageUrl,
        attachmentLinkUrl: imageUrl,
      },
    ],
    version: '1',
  };
}

// ---------------- Helper Functions --------------------------------------------------

function parseLocalDate(date) {
  /**
   * Construct a date object in the local timezone by parsing the input date string, assuming a YYYY-MM-DD format.
   * Note that the Date(dateString) constructor is explicitly avoided as it may implicitly assume a UTC timezone.
   */
  const dateComponents = date.split(/\-/);
  return new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2]);
}

function isValidDate(date) {
  try {
    return !(isNaN(parseLocalDate(date).getTime()));
  } catch (err) {
    return false;
  }
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent === null) {
    return {
      isValid,
      violatedSlot,
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
  };
}

function validateLocation(location) {
  const locationTypes = ['bedroom', 'dining room', 'garage', 'kitchen', 'laundry', 'living room'];

  if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
    return buildValidationResult(false, 'location', `We do not have a ${location}. Would you like to try a different location? The most popular location people ask for is the bedroom!`);
  }

  return buildValidationResult(true, null, null);
}

function validateLocationAndRelay(location, relay) {
  const locationTypes = ['bedroom', 'dining room', 'garage', 'kitchen', 'laundry', 'living room'];
  if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
    return buildValidationResult(false, 'location', `We do not have a ${location}. Would you like to try a different location? The most popular location people ask for is the bedroom!`);
  }

  const relayTypes = ['coffee machine', 'coffeemaker', 'air purifier', 'light', 'humidifier', 'heater', 'air conditioner'];
  if (relay && relayTypes.indexOf(relay.toLowerCase()) === -1) {
    return buildValidationResult(false, 'relay', `We do not have a ${relay}. Would you like to try a different device? The most popular device people ask for is the light!`);
  }

  return buildValidationResult(true, null, null);
}

function validateLocationAndState(location, state) {
  const locationTypes = ['bedroom', 'dining room', 'garage', 'kitchen', 'laundry', 'living room'];
  if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
    return buildValidationResult(false, 'location', `We do not have a ${location}. Would you like to try a different location? The most popular location people ask for is the bedroom!`);
  }

  const stateTypes = ['on', 'off'];
  if (state && stateTypes.indexOf(state.toLowerCase()) === -1) {
    return buildValidationResult(false, 'state', `${state} is not a valid command. You can turn it on or off.`);
  }

  return buildValidationResult(true, null, null);
}

function validateLocationAndRelayAndStatus(location, relay, status) {
  const locationTypes = ['bedroom', 'dining room', 'garage', 'kitchen', 'laundry', 'living room'];
  if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
    return buildValidationResult(false, 'location', `We do not have a ${location}. Would you like to try a different location? The most popular location people ask for is the bedroom!`);
  }

  const relayTypes = ['coffee machine', 'coffeemaker', 'air purifier', 'light', 'humidifier', 'heater', 'air conditioner'];
  if (relay && relayTypes.indexOf(relay.toLowerCase()) === -1) {
    return buildValidationResult(false, 'relay', `We do not have a ${relay}. Would you like to try a different device? The most popular device people ask for is the light!`);
  }

  const statusTypes = ['on', 'off'];
  if (status && statusTypes.indexOf(status.toLowerCase()) === -1) {
    return buildValidationResult(false, 'status', `${status} is not a valid command. You can turn it on or off.`);
  }

  return buildValidationResult(true, null, null);
}

function validateLocationAndRelayAndSensor(location, relay, sensor) {
  const locationTypes = ['bedroom', 'dining room', 'garage', 'kitchen', 'laundry', 'living room'];
  if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
    return buildValidationResult(false, 'location', `We do not have a ${location}. Would you like to try a different location? The most popular location people ask for is the bedroom!`);
  }

  const relayTypes = ['coffee machine', 'coffeemaker', 'air purifier', 'light', 'humidifier', 'heater', 'air conditioner'];
  if (relay && relayTypes.indexOf(relay.toLowerCase()) === -1) {
    return buildValidationResult(false, 'relay', `We do not have a ${relay}. Would you like to try a different device? The most popular device people ask for is the light!`);
  }

  const sensorTypes = ['presence', 'opening', 'none'];
  if (sensor && sensorTypes.indexOf(sensor.toLowerCase()) === -1) {
    return buildValidationResult(false, 'sensor', `We do not have a ${sensor} sensor. We currently support opening or presence sensors!`);
  }

  return buildValidationResult(true, null, null);
}

function mockAllStatus() {
  return {
    'luminosity': (200 + Math.random() * 500.0).toFixed(1),
    'humidity': (20.0 + Math.random() * 70.0).toFixed(1),
    'opening': Math.random() < 0.5 ? 'open' : 'closed',
    'presence': Math.random() < 0.5 ? true : false,
    'relay': Math.random() < 0.5 ? 'on' : 'off',
    'temperature': (15.0 + Math.random() * 15.0).toFixed(1),
    'alarm': Math.random() < 0.5 ? 'on' : 'off',
  };
}

function mockPicture(location) {
  const locationPictures = {
    'bedroom': 'https://i.pinimg.com/736x/02/f5/7a/02f57a648ee803312085cf3676a6f79b--blogger-bedroom-bedroom-inspo.jpg',
    'dining room': 'https://images2.roomstogo.com/is/image/roomstogo/dr_rm_hillcreek_black_6_chrs_~Hill-Creek-Black-5-Pc-Rectangle-Dining-Room.jpeg?$pdp_gallery_945$',
    'garage': 'http://naplesclosets.com/wp-content/uploads/2017/06/Car-garage-GettyImages-528098460-58a1fba93df78c475869ff29.jpg',
    'kitchen': 'http://www.ikea.com/gb/en/images/rooms/ikea-contemporary-prep-station-for-whatever%E2%80%99s-in-season__1364309677390-s5.jpg',
    'laundry': 'https://i.pinimg.com/736x/38/c1/d0/38c1d069530cb91b93fa24f83c5abf10.jpg',
    'living room': 'https://images2.roomstogo.com/is/image/roomstogo/lr_rm_bellingham_gray~Cindy-Crawford-Home-Bellingham-Gray-7-Pc-Living-Room.jpeg?$pdp_gallery_945$'
  };
  return locationPictures[location];
}

// --------------- Functions that control the bot's behavior -----------------------

const intentHandlers = {
  'AlarmStatus': alarmStatusHandler,
  'AllSensorStatus': allSensorStatusHandler,
  'HumiditySensorStatus': humiditySensorStatus,
  'OpeningSensorStatus': openingSensorStatus,
  'PresenceSensorStatus': presenceSensorStatus,
  'RelayStatus': relayStatus,
  'SetAlarm': setAlarm,
  'SetAutoRelay': setAutoRelay,
  'TakePicture': takePicture,
  'TemperatureSensorStatus': temperatureSensorStatus,
  'ToggleRelay': toggleRelay,
}

function alarmStatusHandler(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);

    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  const statusMock = mockAllStatus();
  callback(close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: `The ${location} alarm is ${statusMock.alarm}.` }));
  return;
}

function allSensorStatusHandler(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `This is the status for ${location}: ${JSON.stringify(mockAllStatus())}` }));
}

function humiditySensorStatus(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} air humidity is ${mockAllStatus().humidity}%.` }));
}

function openingSensorStatus(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `It is ${mockAllStatus().opening}.` }));
}

function presenceSensorStatus(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `There is ${mockAllStatus().presence ? 'someone/something' : 'no one'} in ${location}.` }));
}

function relayStatus(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const relay = intentRequest.currentIntent.slots.relay;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocationAndRelay(location, relay);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} ${relay} is ${mockAllStatus().relay}.` }));
}

function setAlarm(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const state = intentRequest.currentIntent.slots.state;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocationAndState(location, state);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} alarm was turned ${state}.` }));
}

function setAutoRelay(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const relay = intentRequest.currentIntent.slots.relay;
  const sensor = intentRequest.currentIntent.slots.sensor;
  const startTime = intentRequest.currentIntent.slots.startTime;
  const endTime = intentRequest.currentIntent.slots.endTime;
  const autoKeepOn = intentRequest.currentIntent.slots.autoKeepOn;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocationAndRelayAndSensor(location, relay, sensor);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  let sensorString = ''
  if (sensor != 'none') {
    sensorString = `when the ${sensor} is triggered`
  }
  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} ${relay} will be turned on ${sensorString}` +
  `, between ${startTime} and ${endTime}, and will remain on for ${autoKeepOn} minutes.` }));
}

function takePicture(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  intentRequest.sessionAttributes.appContext = JSON.stringify({
    responseCard: getResponseCard('Your home', mockPicture(location.toLowerCase())),
  });

  callback(closeWithImage(intentRequest.sessionAttributes, 'Fulfilled', mockPicture(location)));
}

function temperatureSensorStatus(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocation(location);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} temperature is ${mockAllStatus().temperature}ºC.` }));
}

function toggleRelay(intentRequest, callback) {
  const location = intentRequest.currentIntent.slots.location;
  const relay = intentRequest.currentIntent.slots.relay;
  const status = intentRequest.currentIntent.slots.status;
  const source = intentRequest.invocationSource;

  if (source === 'DialogCodeHook') {
    const slots = intentRequest.currentIntent.slots;

    const validationResult = validateLocationAndRelayAndStatus(location, relay, status);
    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
      return;
    }

    const outputSessionAttributes = intentRequest.sessionAttributes || {};

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `The ${location} ${relay} was turned ${status}.` }));
}

// --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatch(intentRequest, callback) {
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

  const intentName = intentRequest.currentIntent.name;

  // Dispatch to your skill's intent handlers
  if (intentHandlers[intentName]) {
    return intentHandlers[intentName](intentRequest, callback);
  }

  throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
  try {
    // By default, treat the user request as coming from the America/Sao_Paulo time zone.
    process.env.TZ = 'America/Sao_Paulo';
    console.log(`event.bot.name=${event.bot.name}`);

    dispatch(event, (response) => callback(null, response));
  } catch (err) {
    callback(err);
  }
};
