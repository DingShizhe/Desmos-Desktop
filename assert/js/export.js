// var remote = require('electron').remote;
var dialog = remote.dialog;
var fs = require('fs');

var image = calculator.screenshot({
    width: remote.width,
    height: remote.height,
    targetPixelRatio: 2
});

var image_data = image.replace(/^data:image\/png;base64,/, "");

dialog.showSaveDialog({filters: [ {name: 'png', extensions: ['png'] }]},
    (fileName) => {
    if (fileName === undefined){
        console.log("You didn't open the file.");
        return;
    }

    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.writeFile(fileName, image_data, 'base64', (err) => {
        if(err){
            alert("An error ocurred creating the file. :( "+ err.message)
        }
        alert("Succesfully exported. ;)");
    });
}); 
