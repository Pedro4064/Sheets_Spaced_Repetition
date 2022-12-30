function get_todo_table() {

    const sheet = SpreadsheetApp.getActive();

    let todo_range = sheet.getRangeByName('todo_table');
    let todo_data = todo_range.getValues();
    let todo_colors = todo_range.getBackgrounds();

    return [todo_range, todo_data, todo_colors];

}

function update_todo_table() {

    // First get the todo range and data
    let [todo_range, todo_data, todo_colors] = get_todo_table();

    // Now get all the subject sheets and create a dictionary that holds the sheet object as value and name as key
    let sheets_lookup_table = {};
    let sheets = get_subject_sheets();

    // Make a lookup table and parse all subject sheets data and ranges
    const extract_subject_sheet_info = (sheet) => {
        let [data_range, data] = parse_subject_sheet(sheet);
        let sheet_dictionary = {
            'sheet': sheet,
            'rev entries': data,
            'data range': data_range
        }

        return sheet_dictionary;
    };

    sheets.forEach((sheet) => sheets_lookup_table[sheet.getName()] = extract_subject_sheet_info(sheet));

    // Iterate it and update the subject sheets, but before keep record of the lenght of the original entry array
    const original_todo_length = todo_data.length;                     // Keep the original todo length
    update_subjects_data(todo_data, todo_colors, sheets_lookup_table); // Update the subject data
    Object.values(sheets_lookup_table)                                 // Update the sheets
        .forEach((sheet) => update_rev_data_rage(sheet['data range'], sheet['rev entries']));

    // Iterate over all subject sheets and add any pending reviews to the todo table
    new_todo_data = update_todo_data(todo_data, sheets_lookup_table);

    // Clear current todo data and formatting and Update the named range and save data to google sheets
    todo_range.setValues(Array(original_todo_length).fill(['', '', '', '', '']));
    todo_range.setBackgrounds(Array(original_todo_length).fill(['', '', '', '', '']));

    new_todo_range = todo_range.offset(0, 0, new_todo_data.length);
    new_todo_range.setValues(new_todo_data);


    // Copy the old alternating color style and apply to new one
    let alternating_colors = todo_range.getBandings()[0];
    todo_range.getBandings()[0].remove();
    alternating_colors.copyTo(new_todo_range);


    SpreadsheetApp.getActive().setNamedRange('todo_table', new_todo_range);



}

const is_reviewd = (todo_entry) => {
    // First get the settings to know the possible review colors
    const config = get_spaced_repetition_configs();

    // Now check if the colors are any of the configured ones
    const color = todo_entry[1][4];
    return (color == config['Easy Review']['color'] ||
        color == config['Medium Review']['color'] ||
        color == config['Hard Review']['color']);
};

const filter_reviewd_todo_item = (todo_data) => {
    // First skip the headers and them filter 
    let filtered = todo_data.slice(1).filter((todo_entry) => is_done(todo_entry));
    return filtered;
};

const find_entry = (topic_name, topic_block, subject_sheet) => {
    const [entry] = subject_sheet['rev entries'].filter(
        (entry) => entry.name === topic_name && entry.block === topic_block);

    return entry;
};

const needs_review = (date) => {
    const today = new Date();
    const rev_date = new Date(date);

    const date_diff = rev_date.getTime() - today.getTime();
    return (date_diff <= 0);
};

const already_saved = (subject_name, topic_name, todo_entries) => {

    let already_in = false;
    for (const todo_entry of todo_entries) {
        if (todo_entry[1] === subject_name && todo_entry[3] === topic_name) {
            already_in = true;
            break;
        }
    }

    return already_in;
};

function update_subjects_data(todo_data, todo_colors, subject_sheets_dictionary) {
    // Create a zipper aux function to zip the data and colors 2D arrays to iterate them
    const zipper = (iter_1, iter_2) => iter_1.map((item, index) => [item, iter_2[index], index]);

    // Array to hold the reviewd data that needs to be updated on the subject sheets
    let reviewd_entries = [];

    // Iterate over all todo entries that are done, but skip the headers
    for (const todo_entry_data of zipper(todo_data.slice(1), todo_colors.slice(1))) {

        const current_entry_index = todo_entry_data[2]; // The index of the current entry

        if (is_reviewd(todo_entry_data)) {
            reviewd_entries.push(todo_entry_data);                         // Add the reviewd to the array to be saved later
            todo_data.splice(current_entry_index + 1, 1);                  // Remove one element at the current entry index
            todo_colors.splice(current_entry_index + 1, 1);                // Remove one element at the current entry index
        }

    }

    // Now we need to update the subject sheets
    for (const reviewd_entry_data of reviewd_entries) {
        const subject = reviewd_entry_data[0][1];
        const topic_name = reviewd_entry_data[0][3];
        const topic_block = reviewd_entry_data[0][2];
        const topic_color = reviewd_entry_data[1][4];
        const subject_sheet = subject_sheets_dictionary[subject];

        // Find the target entry and its last review 
        const target_entry = find_entry(topic_name, topic_block, subject_sheet);
        const last_rev_entry = last_rev(target_entry);

        // Update the colors
        last_rev_entry.color = topic_color;

    }

}

function update_todo_data(todo_data, subject_sheets_dictionary) {
    // First we need to iterate over all subjects sheets and save all topics with un-reviewd last rev entries
    let unreviewed_entries = [];

    // Iterate over all subject sheets
    for (const subject_sheet of Object.entries(subject_sheets_dictionary)) {
        const subject_name = subject_sheet[0];
        const subject_topic_entries = subject_sheet[1]['rev entries'];

        // Iterate all entries and keep track of topic entries that need to be reviewd
        for (const topic_entry of subject_topic_entries.slice(1)) {

            const last_review_entry = last_rev(topic_entry);
            if (!is_done(last_review_entry) && needs_review(last_review_entry.value)) {
                unreviewed_entries.push(['', subject_name, topic_entry['block'], topic_entry['name'], '']);
            }
        }
    }

    // Now before mergin the todo data to the unreviewd entries we need to filter their union
    const to_be_added = unreviewed_entries.filter((entry) => !already_saved(entry[1], entry[3], todo_data))

    // Now add the new entries, but keep todo_data last row as the last because is the summary formula
    let new_todo = todo_data.map((data) => data); // Make a deep copy of all elements in the array
    const last_row = new_todo.pop();              // Get the last row of the pivot ToDo table
    new_todo = new_todo.concat(to_be_added);      // Join both the old entries and the new ones in one array
    last_row[4] = new_todo.length - 1;            // Update the footer of the pivot table
    new_todo.push(last_row);                      // Append the footer back to the array

    return new_todo;

}
