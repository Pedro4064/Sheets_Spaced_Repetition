function get_spaced_repetition_configs() {

  // Spread sheets and ranges variables
  const spread_sheet = SpreadsheetApp.getActive();
  const confi_sheet  = spread_sheet.getSheetByName('Config');
  const configuration_table = spread_sheet.getRangeByName('Configurations');
  
  // Get raw info of all config settings
  let colors = configuration_table.getBackgrounds();
  let values = configuration_table.getValues();

  let settings = parse_config_entries(values, colors);
  
  Logger.log(values);
  Logger.log(colors);
  Logger.log(JSON.stringify(settings));
  
}

function parse_config_entries(values, colors){

  let configurations = {};

  for (let i = 0; i < values.length; i++){
    let entry_value = values[i];
    let entry_color = colors[i];

    configurations[entry_value[0]] = {
                                      'value': entry_value[1], 
                                      'description': entry_value[2],
                                      'color': entry_color[1]
                                      }
  }

  return configurations;

}

function get_subject_sheets(){
  
  const spread_sheet = SpreadsheetApp.getActive(); // The active recall spread sheet file
  const skip_list = ['Config', 'Overview'];        // List of the names of the sheets that are not subjects
  
  // Get all subject sheets
  let sheets = spread_sheet.getSheets().filter(sheet => !skip_list.includes(sheet.getName()));
  

  Logger.log(sheets);
}

