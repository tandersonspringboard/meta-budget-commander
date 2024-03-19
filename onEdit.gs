// If you're going to re-use this snippet, you'lll need to set up a trigger. 
// If you make changes to the layout of the spreadsheet (adjust columns) you'll need to update this. 
// 
//checks when comment was last made & adds a last modified date stamp. 
function onEdit(e) {

  var row = e.range.getRow();
  var col = e.range.getColumn();

  if(col == 15){
    e.source.getActiveSheet().getRange(row,16).setValue(new Date());
  }
}
