/* eslint-disable  func-names */
/* eslint-disable  no-console */

/* A question and answer is very roughly 6 seconds */

const Alexa = require('ask-sdk-core');
const QUESTIONS = require('./questions');
const WRONGINTERJECTIONS = [
    "No!",
    "Sorry.",
    "Remember, the goal is to get the answer wrong.",
    '<say-as interpret-as="interjection">aw!</say-as>',
    '<say-as interpret-as="interjection">blah!</say-as>',
    '<say-as interpret-as="interjection">blast!</say-as>',
    '<say-as interpret-as="interjection">darn!</say-as>'
];
const BACKTOSTART = [
    'Back to the start!',
    'Back to question 1.',
    'We start over.',
    'We start again.'
];
const RIGHTINTERJECTIONS = [
    '<say-as interpret-as="interjection">ace!</say-as>',
    '<say-as interpret-as="interjection">awesome!</say-as>',
    '<say-as interpret-as="interjection">bingo!</say-as>'
];

const SCORE_TO_WIN = 9;

/********************************************************************** 
    Helpers and data 
***********************************************************************/

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function getSessionQuestions(count) {
  var qids = [...Array(QUESTIONS.length).keys()];
  shuffle(qids);
  qids = qids.slice(qids.length - count);
  return qids;
}

/********************************************************************** 
    Core AMAZON Intents
***********************************************************************/

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'I will ask you a series of trivia questions, each with two answers. ' +
      'You must tell me the wrong answer. If you correctly ' +
      'give me the wrong answer, we go on to the next question. If you don\'t, we start again ' +
      'from the beginning. You have 90 ' +
      'seconds to get as far as you can. Good luck! Now, say start to play Wrong Answer!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = "Thanks for playing Wrong Answer! <audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01.mp3'/> Goodbye!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput
    .responseBuilder
    .speak("<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01.mp3'/>")
    .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Please say that again?')
      .reprompt('Please say that again?')
      .getResponse();
  },
};

/********************************************************************** 
    Startup
***********************************************************************/

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText =  "<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_bridge_02.mp3'/> " +
      'Welcome to Wrong Answer, the trivia quiz where you have to get the ' +
      'answers wrong! You can ask me to explain the rules, or say start to play.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const StartIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StartIntent';
  },
  handle(handlerInput) {
    console.log("StartIntentHandler running");
    var qids = getSessionQuestions(SCORE_TO_WIN);
    handlerInput.attributesManager.setSessionAttributes({q: 0, qids: qids});
    const attrs = handlerInput.attributesManager.getSessionAttributes();
    attrs.timestamp = new Date().getTime();
    attrs.warning60 = false;
    attrs.warning30 = false;
    var q1 = 'Question 1. ' + QUESTIONS[attrs.qids[attrs.q]][0];
    const speechText = "Let's play Wrong Answer! " +
    "<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_bridge_02.mp3'/> " + q1;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(q1)
      .getResponse();
  },
};

const RulesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RulesIntent';
  },
  handle(handlerInput) {
    const attrs = handlerInput.attributesManager.getSessionAttributes();
    const speechText = 'I will ask you a series of trivia questions, each with two answers. ' +
      'You must tell me the wrong answer. If you correctly ' +
      'give me the wrong answer, we go on to the next question. If you don\'t, we start again ' +
      'from the beginning. You have 90 ' +
      'seconds to get as far as you can. Good luck! Now, say start to play Wrong Answer!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};


/********************************************************************** 
    Question handlers
***********************************************************************/
const NUMWORDS = ["zero", "one", "two", "three", "four", "five", "six", 
    "seven", "eight", "nine", "ten", "eleven", "twelve", 
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", 
    "eighteen", "nineteen"];
const TENWORDS = ["", "ten", "twenty", "thirty", "forty", "fifty", 
"sixty", "seventy", "eighty", "ninety"];
function numword(n) {
    if (n < 20) return NUMWORDS[n];
    var tens = Math.floor(n/10);
    return TENWORDS[tens] + NUMWORDS[n % 10];
}

function getTimeLeft(attrs) {
    var timeSpent = Math.floor(((new Date().getTime()) - attrs.timestamp) / 1000);
    var timeLeft = 90 - timeSpent;
    return timeLeft;
}
function getTimeWarning(attrs) {
    var timeLeft = getTimeLeft(attrs);
    if (timeLeft < 60 && !attrs.warning60) {
        attrs.warning60 = true;
        return "60 seconds left! ";
    }
    if (timeLeft < 30 && !attrs.warning30) {
        attrs.warning30 = true;
        return "30 seconds left! ";
    }
    return "";
}

function checkTimeLeft(attrs, handlerInput, speechText) {
    if (getTimeLeft(attrs) < 0) {
        var qto = attrs.q + 1;
        var rank = "ok.";
        if (qto > SCORE_TO_WIN / 2) rank = "not bad!";
        if (qto > (3 * SCORE_TO_WIN / 4)) rank = "pretty good!";
        attrs.q = 9999; // so nothing matches
        var s = speechText + " And... time is up! " +
          "You got to question " + qto + " which is " + rank + " " +
          "<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01.mp3'/> " +
          "You can say start to play again, or stop to stop playing Wrong Answer.";
        return handlerInput.responseBuilder
                .speak(s)
                .reprompt("You can say start to play again, or stop to stop playing Wrong Answer.")
                .getResponse();
    }
}

function random(list) { return list[Math.floor(Math.random() * list.length)]; }

function makeQuestionHandlers() {
    var qh = [];
    for (var i=0; i<QUESTIONS.length; i++) {
        (function(i) {
            /* session.q is the index of the current question being 
               asked, so the second question asked is 1 (it's 0-based).
               myQid is the qid of the current question being asked, 
               so if qids is [5,6,7] and session.q is 1, then myQid is 6.
               We can handle this if myQid is equal to i. */
            var hdlAnswerCorrectSoWrong = {
                canHandle(handlerInput) {
                    const isIR = handlerInput.requestEnvelope.request.type === 'IntentRequest';
                    const isCallingUsRight = handlerInput.requestEnvelope.request.intent.name === 'Q' + numword(i) + 'RightIntent';
                    if (!isIR || !isCallingUsRight) { return false; }
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    const myQid = attrs.qids[attrs.q];
                    const isThisQ = myQid === i;
                    return isThisQ;
                },
                handle(handlerInput) {
                    /* If we're here, we know they answered this question and got it wrong */
                    /* here, myQid is i */
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    var speechText = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_01.mp3'/> " +
                      random(WRONGINTERJECTIONS) + " " + random(BACKTOSTART) + " ";
                    attrs.q = 0;

                    var ctl = checkTimeLeft(attrs, handlerInput, speechText);
                    if (ctl) return ctl;
                    speechText += getTimeWarning(attrs);

                    var newQuestion = QUESTIONS[attrs.qids[attrs.q]][0];
                    speechText += newQuestion;

                    if (attrs.warning30) {
                        speechText = '<speak><prosody rate="x-fast">' + speechText + '</prosody></speak>';
                    } else if (attrs.warning60) {
                        speechText = '<speak><prosody rate="fast">' + speechText + '</prosody></speak>';
                    }

                    return handlerInput.responseBuilder
                        .speak(speechText)
                        .reprompt(newQuestion)
                        .getResponse();
                },
            };

            var hdlAnswerIncorrectSoRight = {
                canHandle(handlerInput) {
                    const isIR = handlerInput.requestEnvelope.request.type === 'IntentRequest';
                    const isCallingUsWrong = handlerInput.requestEnvelope.request.intent.name === 'Q' + numword(i) + 'WrongIntent';
                    if (!isIR || !isCallingUsWrong) { return false; }
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    const myQid = attrs.qids[attrs.q];
                    const isThisQ = myQid === i;
                    return isThisQ;
                },
                handle(handlerInput) {
                    /* If we're here, we know they answered this question and got it right */
                    /* here, myQid is i */
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    var speechText = " <audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01.mp3'/> " + 
                    random(RIGHTINTERJECTIONS) + " ";

                    var ctl = checkTimeLeft(attrs, handlerInput, speechText);
                    if (ctl) return ctl;
                    speechText += getTimeWarning(attrs);

                    attrs.q += 1;
                    if (attrs.q >= attrs.qids.length) {
                        return handlerInput.responseBuilder
                                .speak(speechText + "That's all the questions done! You win! " +
                                  "<audio src='https://s3.amazonaws.com/ask-soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01.mp3'/>" +
                                  "You can say start to play again, or stop to stop playing Wrong Answer.")
                                .reprompt("You can say start to play again, or stop to stop playing Wrong Answer.")
                                .getResponse();
                    }

                    var newQuestion = QUESTIONS[attrs.qids[attrs.q]][0];
                    speechText += newQuestion;

                    return handlerInput.responseBuilder
                        .speak(speechText)
                        .reprompt(newQuestion)
                        .getResponse();
                },
            }

            var OutOfTimeHandler = {
                canHandle(handlerInput) {
                    const isIR = handlerInput.requestEnvelope.request.type === 'IntentRequest';
                    const isAnswerAttempt = handlerInput.requestEnvelope.request.intent.name.match(/^Q.*(Right|Wrong)Intent$/);
                    if (!isIR || !isAnswerAttempt) { return false; }
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    return attrs.q == 9999;
                },
                handle(handlerInput) {
                    /* If we're here, they're out of time! */
                    const attrs = handlerInput.attributesManager.getSessionAttributes();
                    var speechText = "Your game is over. " +
                      "You can say start to try playing again, or stop to stop playing Wrong Answer. Maybe you'll win this time!";
                    return handlerInput.responseBuilder
                            .speak(speechText)
                            .reprompt("You can say start to try playing again, or stop to stop playing Wrong Answer.")
                            .getResponse();
                },
            };

            qh.push(hdlAnswerCorrectSoWrong);
            qh.push(hdlAnswerIncorrectSoRight);
            qh.push(OutOfTimeHandler);
        })(i);
    }
    return qh;
}

const skillBuilder = Alexa.SkillBuilders.custom();
var handlers = [LaunchRequestHandler,
    StartIntentHandler,
    RulesIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler];
handlers = handlers.concat(makeQuestionHandlers())

exports.handler = skillBuilder
  .addRequestHandlers.apply(skillBuilder, handlers)
  .addErrorHandlers(ErrorHandler)
  .lambda();
