const { ipcRenderer } = require('electron');
const remote = require("electron").remote;
var dialog = remote.dialog;
var fs = require('fs');

let StateData = {
    file_path: '',
    last_state: null
}


function showAlert(msg, speed=0.02) {
    var div = '<div class="floating" id="message">'+msg+'</div>';
    document.getElementById("container").innerHTML = div;
    var s = document.getElementById('message').style;
    s.opacity = 1;
    (function fade(){(s.opacity-=speed)<0?s.display="none":setTimeout(fade,40)})();
}


function set_caculator_state(des_file_data) {
    state = JSON.parse(des_file_data);
    try {
        calculator.setState(state);
    }
    catch(err) {
        calculator.setBlank();
    }
}


function saveText(text, file){
    fs.writeFileSync(file, text);
    showAlert('Saved successfully. ;)');
}

function setTitle() {
    if (StateData.file_path)
        document.title = "Desmos - " + StateData.file_path;
    else
        document.title = "Desmos - * Untitled";
    ipcRenderer.send('renderer-request', {msg: 'TitleChanged', data: StateData.file_path});
}

setInterval( function(){
    if (isSaved()) return;
    else if (StateData.file_path)
        document.title = "Desmos - * "+StateData.file_path;
}, 1000);


function newFile() {
    var canceled = !askSaveIfNeed();
    if (canceled) return;

    calculator.setBlank();
    StateData.file_path = '';
    setTitle();
}


function openFile(filePath=null, init=false) {

    if (!init) {
        if (canceled) return;
        var canceled = !askSaveIfNeed();
    }

    if (!filePath && init) { return; }
    if (!filePath) {
        filePaths = dialog.showOpenDialog({filters: [ {name: 'des', extensions: ['des'] }]});
        if (!filePaths) return;
        filePath = filePaths[0];
    }

    fs.readFile(filePath, (err, data) => {
        if(err){
            showAlert("Error on openning :( " + err.message);
            calculator.setBlank();
        }
        set_caculator_state(data);
        StateData.file_path = filePath;
        StateData.last_state = data;
        setTitle();
    });
}


function saveFile() {
    if(!StateData.file_path){
        const file = dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: "Desmos Files", extensions: ['des'] }]
        });
        if(file) StateData.file_path=file;
    }
    if(StateData.file_path){
        var state = calculator.getState();
        StateData.last_state = state;
        var state_content = JSON.stringify(state, null, 4);
        saveText(state_content, StateData.file_path);
        setTitle();
    }
}


function saveAsFile() {
    const file = dialog.showSaveDialog(remote.getCurrentWindow(), {
        filters: [
        { name: "Desmos Files", extensions: ['des'] }]
    });
    if(file) StateData.file_path=file;
    if(StateData.file_path){
        var state = calculator.getState();
        StateData.last_state = state;
        var state_content = JSON.stringify(state, null, 4);
        saveText(state_content, StateData.file_path);
        setTitle();
    }
}


function exportImage() {
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
            showAlert("Succesfully exported. ;)");
        });
    }); 
}


function isStateNull() {
    if (StateData.last_state == null && calculator.getState().expressions.list[0].latex === undefined)
        return true;
    else return false;
}


function isSaved() {
    if (isStateNull()) return true;
    if (StateData.file_path == "" || StateData.last_state == null)
        return false;
    else {
        if (JSON.stringify(calculator.getState().extensions) == JSON.stringify(StateData.last_state.extensions))
            return true;
        else
            return false;
    }
}


function askSaveIfNeed(){
    if(isSaved()) return true;
    const response = dialog.showMessageBox(remote.getCurrentWindow(), {
        message: 'Do you want to save the current document?',
        type: 'question',
        buttons: [ 'Yes', 'No', 'Cancel' ]
    });
    // Yes to save
    if (response == 0)
        saveFile();

    if (response == 2)
        return false;
    else
        return true;
}



function exitApp() {
    var exit = askSaveIfNeed();    
    if (exit) {
        showAlert('Exiting...', 0);
        setTimeout(()=>{
            ipcRenderer.sendSync('renderer-response', {msg: 'Exit'});
        }, 600);
    }
}


ipcRenderer.on('mainprocess-request', (event, arg) => {
    console.log(arg);
    switch (arg.msg) {
        case 'NewFile':     newFile();      break;
        case 'Init':        openFile(arg.data, true);     break;
        case 'OpenFile':    openFile();     break;
        case 'SaveFile':    saveFile();     break;
        case 'SaveAsFile':  saveAsFile();   break;
        case 'ExportImage': exportImage();  break;
        case 'Undo':        calculator.undo();      break;
        case 'Redo':        calculator.redo();      break;
        case 'Clear':       calculator.setBlank();  break;
        case 'Exitting':    exitApp();      break;
        default:            break;
    }
});


document.addEventListener("keydown", event => {
    switch (event.key) {
        case "Escape":
            if (remote.getCurrentWindow().isFullScreen()) {
                remote.getCurrentWindow().setFullScreen(false);
            } else {
                remote.getCurrentWindow().close();
            }
            break;
    }
});

ipcRenderer.send('renderer-request', {msg: 'ToInit'})


// document.ondragover = document.ondrop = (ev) => {
    // ev.preventDefault()
// }
  
// document.body.ondrop = (ev) => {
//     console.log(ev.dataTransfer.files[0].path)
//     ev.preventDefault()
// }
