const fs = require('fs');
const request = require('request').defaults({ encoding: null });
const mkdirp = require('mkdirp');
const { dialog } = require('electron').remote;

var export_dir = null;
window.pick_export_dir = () => {
	let rsp = dialog.showOpenDialog({
		properties: ['openDirectory']
	});
	if (rsp.length > 0) {
		export_dir = rsp[0];
		return rsp[0];
	} else {
		return null;
	}
};

window.save_photo = (user, photo) => {

	return new Promise((resolve, reject) => {

		try {

			let username = user.username._content;

			let upload_unix = parseInt(photo.dateupload) * 1000;
			let upload_date = new Date(upload_unix);
			let upload_json = upload_date.toJSON();
			let upload_match = upload_json.match(/^(\d\d\d\d)-(\d\d)-(\d\d)/);

			let yyyy = upload_match[1];
			let mm = upload_match[2];
			let dd = upload_match[3];

			let dir = `${export_dir}/flickr_${username}/${yyyy}/${mm}/${dd}`;

			var filename = photo.id;
			var json_filename = filename + '.json';
			var json = JSON.stringify(photo, null, 4);

			if (photo.originalformat == 'jpg') {
				filename += '.jpg';
			} else if (photo.originalformat == 'png') {
				filename += '.png';
			} else if (photo.originalformat == 'gif') {
				filename += '.gif';
			}

			const path = `${dir}/${filename}`;
			const json_path = `${dir}/${json_filename}`;

			mkdirp(dir, (err) => {
				if (err) {
					console.log(err.stack);
					return reject(err);
				}
				request(photo.url_o, (err, rsp, body) => {
					if (err) {
						console.log(err.stack);
						return reject(err);
					}
					fs.writeFile(path, body, 'binary', (err) => {
						if (err) {
							return reject(err);
						}
						fs.writeFile(json_path, json, (err) => {
							if (err) {
								return reject(err);
							}
							resolve(path);
						});
					});
				});
			});

		} catch(err) {
			console.log(err.stack);
			reject(err);
		}
	});
};
