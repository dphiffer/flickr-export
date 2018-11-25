const {app, BrowserWindow} = require('electron');
//const server = require('./server');

let main;

app.on('ready', () => {

	// See: https://gist.github.com/maximilian-lindsey/a446a7ee87838a62099d/
	//server();

	main = new BrowserWindow({
		width: 800,
		height: 600
	});

	main.loadFile('static/index.html');

	// Open the DevTools.
	main.webContents.openDevTools();

	// Emitted when the window is closed.
	main.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function() {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (main === null) {
		create_window();
	}
});

/*app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
	event.preventDefault();
	callback(true);
});*/
