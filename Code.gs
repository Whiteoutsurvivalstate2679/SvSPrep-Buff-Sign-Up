const SHEET_ID = "YOUR_SHEET_ID";
const PASSWORD = "icewatch2679";

function doGet(e) {
  const action = e.parameter.action;
  const day = e.parameter.day;

  if (action === "get") {
    return getBookings(day);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.password && data.password !== PASSWORD) {
    return json({ ok: false, message: "Unauthorized" });
  }

  if (data.action === "book") {
    return bookSlot(data);
  }

  if (data.action === "delete") {
    return deleteSlot(data);
  }
}

/* GET BOOKINGS */
function getBookings(day) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(day);
  const values = sheet.getDataRange().getValues();

  const bookings = {};
  for (let i = 1; i < values.length; i++) {
    const [slot, pseudo, id, alliance, ts] = values[i];
    bookings[slot] = { pseudo, id, alliance, ts };
  }

  return json({
    slots: getSlots(day),
    bookings
  });
}

/* BOOK SLOT (SECURE SERVER SIDE) */
function bookSlot(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(data.day);

    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.slot) {
        return json({ ok: false, message: "Slot already taken" });
      }
    }

    sheet.appendRow([
      data.slot,
      data.pseudo,
      data.playerId,
      data.alliance,
      new Date()
    ]);

    return json({ ok: true, message: "Booking confirmed" });

  } finally {
    lock.releaseLock();
  }
}

/* UTIL */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
