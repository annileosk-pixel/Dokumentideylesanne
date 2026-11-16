// Minimalistlik SCORM 1.2 API wrapper
var API = null;
var findAPITries = 0;

function findAPI(win) {
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    if (findAPITries > 500) {
      return null;
    }
    win = win.parent;
  }
  return win.API;
}

function getAPI() {
  if (API != null) return API;
  API = findAPI(window);
  if (API == null && window.opener != null) {
    API = findAPI(window.opener);
  }
  return API;
}

var scormInitialized = false;

function scormInit() {
  var api = getAPI();
  if (api == null) {
    console.warn("SCORM API-t ei leitud. Töötan lokaalses režiimis (LMS-i andmed ei salvestu).");
    return false;
  }
  var result = api.LMSInitialize("");
  scormInitialized = (result === "true" || result === true);
  if (scormInitialized) {
    api.LMSSetValue("cmi.core.lesson_status", "incomplete");
    api.LMSCommit("");
  }
  return scormInitialized;
}

function scormSetScore(scoreRaw, scoreMax, passed) {
  var api = getAPI();
  if (api == null || !scormInitialized) return;
  api.LMSSetValue("cmi.core.score.raw", String(scoreRaw));
  api.LMSSetValue("cmi.core.score.min", "0");
  api.LMSSetValue("cmi.core.score.max", String(scoreMax));
  api.LMSSetValue("cmi.core.lesson_status", passed ? "passed" : "failed");
  api.LMSCommit("");
}

function scormFinish() {
  var api = getAPI();
  if (api == null || !scormInitialized) return;
  api.LMSFinish("");
}

window.addEventListener("beforeunload", function () {
  scormFinish();
});
