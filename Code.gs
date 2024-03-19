/*If this is broken, check out that acccess token. It expires every 60 days, which is a pain in the ass. Maybe we should learn to use OAUTH2 and not have that happen, but I don't know how to to that if I'm honest - Trevor*/

/* CHANGELOG
21 August 2023 - New API verison 17 & new token
01 March 2023 - Updated filtering to be customizable in the spreadsheet, which allows accounts running two clients ability to filter with a campaign prefix. 
21 December 2022 - Updated to API Version 14, & swapped to current access token. 
08 December 2022 - Script now filters by campaigns containing "SB | " to avoid issues with clients spending elsewhere. 
05 May 2022 - If script hasn't run today the top left box will be red.
April 2022 - When script initiates, all rows turn red and will be filled in white when the relevant line is updated. Eat fresh.  
31 March 2022 - Added "Toast" popup to view script is running. 
29 march 2022 - Changed code & url api call to always ask for start/end dates. 

*/

//CONFIGURATION
const ACCESS_TOKEN = "PLACE_TOKEN_HERE"
const SPREADSHEETURL = "https://docs.google.com/spreadsheets/d/1s82b5vWb0GIxXUgraNVhD10lXyTDCoVDc1SVTdGLHs4/edit";

//selects the spreadsheet & which sheet to use 
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheets()[0];

///set this to the first row of data. 
const STARTING_ROW = 4


/**
 * A description for Main.
 * @param {string} param1 - The first argument to this function
 */

function main() {
    let accountIdRange = sheet.getRange(STARTING_ROW, 1, sheet.getLastRow() - STARTING_ROW + 1).getValues();
    Logger.log(accountIdRange)
    let redRange = sheet.getRange(STARTING_ROW, 4, sheet.getLastRow() - STARTING_ROW + 1)
    redRange.setBackground("#f27474");
    for (i = 0; i < accountIdRange.length; i++) {
        let currentAccount = accountIdRange[i];
        let startDate = sheet.getRange(i + STARTING_ROW, 9).getValue();
        let endDate = sheet.getRange(i + STARTING_ROW, 10).getValue();
        let campaignPrefix = sheet.getRange(i + STARTING_ROW, 3).getValue();
        Logger.log(startDate);
        Logger.log(Utilities.formatDate(endDate, "Australia/Brisbane", 'yyyy-MM-dd'));
        
        convertedStartDate = Utilities.formatDate(startDate, "Australia/Brisbane", "yyyy-MM-dd");
        
        convertedEndDate = Utilities.formatDate(endDate, "Australia/Brisbane", "yyyy-MM-dd");
        Logger.log(campaignPrefix);
        fullResponse = getSpend(currentAccount, convertedStartDate, convertedEndDate, campaignPrefix);
        
        Logger.log(fullResponse)
        try {
          spendThisMonth = fullResponse.data[0].spend;
          accountName = fullResponse.data[0].account_name;
          Logger.log(spendThisMonth)
        }
        catch {
          spendThisMonth = "Error";
          accountName = "ERROR! Account hasn't spent during time period."
        }
        SpreadsheetApp.getActiveSpreadsheet().toast("🎉 Got Spend from " + accountName + "...", "Status");
        const range = sheet.getRange([i + STARTING_ROW], 4);
             
        range.clearContent();
        range.setValue(spendThisMonth).setNumberFormat("$0.00");
        range.setBackground("white");
        const rangeName = sheet.getRange([i + STARTING_ROW], 2);
        rangeName.clearContent();
        rangeName.setBackground("red");
        rangeName.setValue(accountName);
        rangeName.setBackground('white');
    
    }
    lastExecutionTime = new Date()
    sheet.getRange(1,1).setValue(lastExecutionTime);
}

function getSpend(ACCOUNT_ID, urlStartDate, urlEndDate, campaignPrefix) {
   const fbApiUrl = `https://graph.facebook.com/v19.0/act_${ACCOUNT_ID}/insights?time_range={'since':'${urlStartDate}','until':'${urlEndDate}'}&level=account&fields=account_name,spend&filtering=[{field:'campaign.name', operator: 'CONTAIN', value: '${campaignPrefix}'}]&access_token=${ACCESS_TOKEN}`;
    const encodedFacebookUrl = encodeURI(fbApiUrl);
    Logger.log(encodedFacebookUrl)
    const fetchRequest = UrlFetchApp.fetch(encodedFacebookUrl);
    const parsedResponse = JSON.parse(fetchRequest)
    return parsedResponse;
}

function onOpen() { 
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Facebook Budgets')
    .addItem('Get latest', 'main')
    .addToUi();
}



//checks when comment was last made & ads a last modified date stamp. 
/*
function onEdit(e) {

  var row = e.range.getRow();
  var col = e.range.getColumn();

  if(col == 14){
    e.source.getActiveSheet().getRange(row,15).setValue(new Date());
  }
}
*/

//TO BE WRITTTTEEENNN
//Function to get Last Month's spend and run some basic comparison to make sure to flag any weird anomolies (e.g. check with CSM if it's actually on a budget)
//TODO add in function for getting last month's spend
//TODO add built-in maths to check for weird month on month anomoly in spend and flag it in the budget sheet in Red. Send email?


/* function lastMonthSpend(ACCOUNT_ID) {
  const lastMonthUrl = "https://graph.facebook.com/v13.0/act_"+ ACCOUNT_ID.toString() + "/insights?date_preset=last_month&level=account&fields=spend&accesstoken=" + ACCESS_TOKEN;
  const encodedLastMonthUrl = encodeURI(lastMonthUrl)
  const fetchLastMonthSpent = UrlFetchApp.fetch(encodedLastMonthUrl);
  const parsedLastMonthResponse = JSON.parse(fetchLastMonthSpent);
  //TODO math here? Alternative use another function to loop through lines for this. 
  return parsedLastMonthResponse;
}
   */
