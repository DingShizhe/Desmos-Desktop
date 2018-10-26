// var remote = require('electron').remote;
var dialog = remote.dialog;
var fs = require('fs');

var state = calculator.getState();
var state_content = JSON.stringify(state, null, 4);

dialog.showSaveDialog({filters: [ {name: 'des', extensions: ['des'] }]},
    (fileName) => {
    if (fileName === undefined){
        console.log("You didn't save the file.");
        return;
    }

    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.writeFile(fileName, state_content, (err) => {
        if(err){
            alert("An error ocurred saving the file. :( "+ err.message);
        }
        alert("Succesfully saved. ;)");
    });
}); 
