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

  return settings;
  
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
  

  return sheets;
}

function parse_subject_sheet(subject_sheet){

  // Get the current data entries
  const data_range = subject_sheet.getDataRange();
  const original_values = data_range.getValues();
  const original_colors = data_range.getBackgrounds();
  

  let rev_entries = [];
  for (let i = 0; i < original_values.length; i++){
    
    let current_entry_values = original_values[i];
    let current_entry_color  = original_colors[i];

    rev_entries.push({
                      'name': current_entry_values[2],
                      'block': current_entry_values[1],
                      'current state': current_entry_values[3],
                      'revisions': parse_revisions_cells(current_entry_values, current_entry_color)
                    });
  }

  return [data_range, rev_entries];
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

function update_revision_tables(){

  // Get all subject sheets and iterate over them
  let subject_sheets = get_subject_sheets();
  Logger.log(typeof(subject_sheets[0]));

  subject_sheets.forEach((subject_sheet) => {

    Logger.log(typeof(subject_sheet));
  
    let [data_range, rev_entries] = parse_subject_sheet(subject_sheet); // Get all information on the sheet
    determine_next_rev_dates(rev_entries);                              // Determine all the next rev dates
    update_rev_data_rage(data_range, rev_entries);                      // Update all the entries on the sheet


  });
  

}

function update_rev_data_rage(data_range, rev_entries){

}

function determine_next_rev_dates(topic_entries){

  // Get the number of dates on the configs
  const configs = get_spaced_repetition_configs();

  topic_entries.forEach((entry) => {

    // If last review is done, calculate the date of the next
    if(is_done(last_rev(entry))){
      
      next_rev(entry, configs); // Calculate and add the next repetition to the topic entry
    
    }

  });

}

const is_done = (last_rev) => {

  return (last_rev.color != '#ffffff');

};

const last_rev = (topic_entry) => {
  // Logger.log(topic_entry['revisions'].filter((entry) => entry.value !== ''));
  Logger.log(topic_entry['revisions'].filter((entry) => entry.value !== '').slice(-1));
  let [last] = topic_entry['revisions'].filter((entry) => entry.value !== '').slice(-1);
  return last;
};

const was_easy = (rev_entry, configs) =>{
  
  return (rev_entry.color == configs['Easy Review']['color']);
    
};

const was_medium = (rev_entry, configs) => {

  return (rev_entry.color == configs['Medium Review']);
};

const was_hard = (rev_entry, configs) => {

  return (rev_entry.color == configs['Hard Review']);
};

const update_topic_entry = (topic_entry, configs,  easy_next_state, medium_next_state, hard_next_state) => {
  
  if(was_easy(last_rev(topic_entry), configs)){

    // Update the topic entry state and append the next date
    easy_next_state(topic_entry);

  }

  else if (was_medium(last_rev(topic_entry), configs)){

    // Update the topic entry state and append the next date
    medium_next_state(topic_entry);

  }

  else if (was_hard(last_rev(topic_entry), configs)){

    // Update the topic entry state and append the next date
    hard_next_state(topic_entry);

  }

};

const increment_days = (topic_entry, number_of_days) => {
  const last_review_session = last_rev(topic_entry);

};

const s0 = (topic_entry, configs) =>{
  
  const easy_next_state_logic   = (topic_entry) => {
    topic_entry['current state'] = 'S2';
    topic_entry['revisions'].push({
                                    'color': '#ffffff',
                                    'value': increment_days(topic_entry, configs['Easy Review']['value'])
                                  });
  };
  
  const medium_next_state_logic = (topic_entry) => {
    topic_entry['current state'] = 'S1';
  };
  const hard_next_state_logic   = (topic_entry) => {
    topic_entry['current state'] = 'S0';
  };

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);

};

const s1 = (topic_entry, configs) =>{
  
  const easy_next_state_logic   = (topic_entry) => {};
  const medium_next_state_logic = (topic_entry) => {};
  const hard_next_state_logic   = (topic_entry) => {};

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);

};

const s2 = (topic_entry, configs) =>{
  
  const easy_next_state_logic   = (topic_entry) => {};
  const medium_next_state_logic = (topic_entry) => {};
  const hard_next_state_logic   = (topic_entry) => {};

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);
  
};

const s3 = (topic_entry, configs) =>{

  const easy_next_state_logic   = (topic_entry) => {};
  const medium_next_state_logic = (topic_entry) => {};
  const hard_next_state_logic   = (topic_entry) => {};

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);

};

const s4 = (topic_entry, configs) =>{

  const easy_next_state_logic   = (topic_entry) => {};
  const medium_next_state_logic = (topic_entry) => {};
  const hard_next_state_logic   = (topic_entry) => {};

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);

};

const s5 = (topic_entry, configs) =>{

  const easy_next_state_logic   = (topic_entry) => {};
  const medium_next_state_logic = (topic_entry) => {};
  const hard_next_state_logic   = (topic_entry) => {};

  update_topic_entry(topic_entry, configs, easy_next_state_logic, medium_next_state_logic, hard_next_state_logic);

};

function next_rev(topic_entry, configs){
  
  // Lookup table for the function to call, so it can go to the next state
  const calculation_lookup_table = {
                        'S0': () => s0(topic_entry, configs), 
                        'S2': () => s2(topic_entry, configs),
                        'S1': () => s1(topic_entry, configs), 
                        'S3': () => s3(topic_entry, configs),
                        'S4': () => s4(topic_entry, configs),
                        'S5': () => s5(topic_entry, configs)
                        };
  
  calculation_lookup_table[topic_entry['current state']]();

}

