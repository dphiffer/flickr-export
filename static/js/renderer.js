const { dialog } = require('electron').remote;

window.pick_export_dir = () => {
	let dir = dialog.showOpenDialog({
		properties: ['openDirectory']
	});
	return dir;
};
