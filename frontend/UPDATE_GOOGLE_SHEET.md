# FINAL FIX: Google Sheet Code

The error happens because the code is cut off at the end.

**PLEASE COPY FROM THE FIRST LINE TO THE LAST LINE BELOW:**

```javascript
var SHEET_NAME = "Sheet1";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(SHEET_NAME);

    var email = e.parameter.email;
    var sport = e.parameter.sport; 
    var timestamp = e.parameter.timestamp;

    sheet.appendRow([email, sport, timestamp]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err })).setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}
```

### 👆 IMPORTANT 👆
Make sure you copy the final `}` at the very bottom!
