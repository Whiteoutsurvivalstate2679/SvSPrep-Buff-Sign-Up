const SHEET_ID = "YOUR_SHEET_ID";
const SHEET_NAME = "bookings";

function doGet(e){
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  let out = {};

  data.slice(1).forEach(r=>{
    const [day, slot, pseudo, id, alliance, ts] = r;
    if(day === e.parameter.day){
      out[slot] = {pseudo,id,alliance,ts};
    }
  });

  return json(out);
}

function doPost(e){
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);

  // simple anti double booking
  const data = sheet.getDataRange().getValues();

  for(let i=1;i<data.length;i++){
    if(data[i][0] === body.day && data[i][1] === body.slot){
      return json({success:false,error:"Slot déjà pris"});
    }
  }

  sheet.appendRow([
    body.day,
    body.slot,
    body.pseudo,
    body.playerId,
    body.alliance,
    body.ts
  ]);

  return json({success:true});
}

function json(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
