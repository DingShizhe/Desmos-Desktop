// var remote = require('electron').remote;
var dialog = remote.dialog;
var fs = require('fs');

function set_caculator_state(des_file_data) {
    state = JSON.parse(des_file_data);
    try {
        calculator.setState(state);
    }
    catch(err) {
        calculator.setBlank();
    }
}

dialog.showOpenDialog({filters: [ {name: 'des', extensions: ['des'] }]},
    (fileNames) => {
    if (fileNames === undefined){
        console.log("You didn't open the file.");
        return;
    }
    fileName = fileNames[0];
    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.readFile(fileName, (err, data) => {
        if(err){
            alert("An error ocurred openning the file. :( "+ err.message);
            calculator.setBlank();
        }
        set_caculator_state(data);
    });
}); 
