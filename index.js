'use strict';

 /**
  * This sample demonstrates an implementation of the Lex Code Hook Interface
  * in order to serve a sample bot which manages orders for flowers.
  * Bot, Intent, and Slot models which are compatible with this sample can be found in the Lex Console
  * as part of the 'OrderFlowers' template.
  *
  * For instructions on how to set up and test this bot, as well as additional samples,
  *  visit the Lex Getting Started documentation.
  */


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
    const locationTypes = ['bedroom', 'kitchen'];
    if (location && locationTypes.indexOf(location.toLowerCase()) === -1) {
        return buildValidationResult(false, 'location', `We do not have ${location}, would you like a different location?  The most popular location asked for is bedroom`);
    }
    return buildValidationResult(true, null, null);
}

function mockAllStatus() {
    return {
      'luminosity': '500',
      'humidity': '20%',
      'opening': 'off',
      'presence': 'on',
      'relay1': 'off',
      'relay2': 'on',
      'temperature': '25o',
      'alarm': 'off'
    }
}

 // --------------- Functions that control the bot's behavior -----------------------
 const intentHandlers = {
   'AllSensorStatus': allSensorStatusHandler
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
      const mockedAllStatus = mockAllStatus()
      if (location) {
          outputSessionAttributes.Status = `1This is the status for ${location}: ${JSON.stringify(mockedAllStatus)}`;
      }
      callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
      return;
  }

  // Order the flowers, and rely on the goodbye message of the bot to define the message to the end user.  In a real bot, this would likely involve a call to a backend service.
  callback(close(intentRequest.sessionAttributes, 'Fulfilled',
  { contentType: 'PlainText', content: `Not sure why this executes` }));
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

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        /*
        if (event.bot.name !== 'OrderFlowers') {
             callback('Invalid Bot Name');
        }
        */
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
