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
    // responseCard: {
    //     contentType: "application/vnd.amazonaws.card.generic",
    //     genericAttachments: [
    //         {
    //             title:"card-title",
    //             subTitle:"card-sub-title",
    //             imageUrl:"https://www.google.com.br/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    //             attachmentLinkUrl:"https://www.google.com.br/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    //             buttons: [
    //                 {
    //                   "text": "Red",
    //                   "value": "red"
    //                 },
    //             ]
    //         }
    //     ]
    // }
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
  if (messageContent == null) {
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

function mockAllStatus() {
  return {
    'luminosity': (200 + Math.random() * 500.0).toFixed(1),
    'humidity': (20.0 + Math.random() * 70.0).toFixed(1),
    'opening': Math.random() < 0.5 ? 'on' : 'off',
    'presence': Math.random() < 0.5 ? 'on' : 'off',
    'relay1': Math.random() < 0.5 ? 'on' : 'off',
    'relay2': Math.random() < 0.5 ? 'on' : 'off',
    'temperature': (15.0 + Math.random() * 15.0).toFixed(1),
    'alarm': Math.random() < 0.5 ? 'on' : 'off',
  };
}

// --------------- Functions that control the bot's behavior -----------------------

const intentHandlers = {
  'AlarmStatus': alarmStatusHandler,
  'AllSensorStatus': allSensorStatusHandler,
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

    // Pass the price of the flowers back through session attributes to be used in various prompts defined on the bot model.
    const outputSessionAttributes = intentRequest.sessionAttributes || {};
    const mockedAllStatus = mockAllStatus();

    if (location) {
      outputSessionAttributes.Status = `This is the status for ${location}: ${JSON.stringify(mockedAllStatus)}`;
    }

    callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
    return;
  }

  const status = intentRequest.sessionAttributes.status;
//   console.log('status: ', status)
  // Order the flowers, and rely on the goodbye message of the bot to define the message to the end user.  In a real bot, this would likely involve a call to a backend service.
  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `This is the status for ${location}: ${JSON.stringify(status)}` }));
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