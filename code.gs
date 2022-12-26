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
  

  let potato = parse_subject_sheet(sheets[0]);
  Logger.log(sheets[0].getDataRange());
  Logger.log(JSON.stringify(potato));
  Logger.log(sheets);
}

function parse_subject_sheet(subject_sheet){

  // Get the current data entries
  const data_range = subject_sheet.getDataRange();
  const original_values = data_range.getValues();
  const original_colors = data_range.getBackgrounds();
  

  let rev_entries = {};
  for (let i = 0; i < original_values.length; i++){
    
    let current_entry_values = original_values[i];
    let current_entry_color  = original_colors[i];

    rev_entries[current_entry_values[2]] = {
                                      'block': current_entry_values[1],
                                      'current state': current_entry_values[3],
                                      'revisions': parse_revisions_cells(current_entry_values, current_entry_color)
                                    };
  }

  return rev_entries;
}

function parse_revisions_cells(values, colors){

  let rev_values = values.slice(4); // Slice to keep only the revision cells values
  let rev_colors = colors.slice(4); // Slice to keep only the revision cells colors

  // Create a zipper function, to iterate over two arrays ate once
  let zipper = (iter_1, iter_2) => iter_1.map((item, index) => [item, iter_2[index]]);
  let zipped_data = zipper(rev_values, rev_colors);
  
  // Map over ziped values and populate objects
  let rev_cell    = zipped_data.map((data) => ( {'value': data[0], 'color': data[1]}));

  
  return rev_cell;

}

