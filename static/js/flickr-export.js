$(document).ready(function() {

	// The user account, gets replaced with real data in STEP 2
	var user = {};

	// Make that shit GLOBAL
	window.flickr = new Flickr(flickr_api_key);

	// State vars
	var page, max_pages, paused;
	var queue, archive;
	var count, total;

	// STEP 1: look up your user account by username
	// TODO: offer a findByEmail option
	$('#username').submit(function(e) {
		e.preventDefault();
		var username = $('#username-input').val();
		if (username == '') {
			$('#username .response').html('Please enter a user account.');
			return;
		}
		$('#username .response').html('Loading user account...');
		flickr.people.findByUsername(username, function(rsp) {
			if (rsp.stat && rsp.stat == 'ok' && rsp.user) {

				user = rsp.user;
				page = 1;
				max_pages = 0;
				paused = true;
				queue = [];
				count = 0;

				$('#change-user-link').html(user.username._content);
				$('#generate').removeClass('hidden');
				$('#username').addClass('hidden');
			} else if (rsp.message) {
				$('#username .response').html(rsp.message);
			} else {
				$('#username .response').html('Could not find that username.');
			}
		});
	});

	// STEP 2 generate a zip file
	$('#generate-btn').click(function(e) {
		e.preventDefault();
		paused = ! paused;
		if (paused) {
			$('#generate-btn').html('Restart →');
			update_progress('Paused');
		} else {
			$('#generate-btn').html('Pause');
			update_progress('Getting ready...');
			load_page();
		}
	});

	// STEP 3 continue to the next page
	$('#save-continue').click(function(e) {
		e.preventDefault();
		$('#save').addClass('hidden');
		$('#generate-btn').removeClass('hidden');
		$('#generate .response').removeClass('hidden');
		$('#generate .progress').removeClass('hidden');

		if (page == max_pages) {
			done();
		} else {
			delete archive.zip;
			page++;
			count = 0;
			load_page();
		}
	});

	$('#restart').click(function(e) {
		e.preventDefault();
		$('#done').addClass('hidden');
		$('#username').removeClass('hidden');
	});

	function done() {
		$('#generate, #save').addClass('hidden');
		$('#done').removeClass('hidden');
	}

	$('#change-user-link').click(function(e) {
		e.preventDefault();
		paused = true;
		$('#username .response').html('');
		$('#generate').addClass('hidden');
		$('#username').removeClass('hidden');
	});

	$('#save-link').click(function(e) {
		e.preventDefault();
		if (! $('#save-link').hasClass('clicked')) {
			$('#save-link').addClass('clicked');
			$('#save .response').html('Please wait, things are happening...');
			archive.zip.generateAsync({
				type: 'blob'
			}).then(function(content) {
				saveAs(content, archive.filename);
				$('#save-link').removeClass('clicked');
			});
		}
	});

	function update_progress(msg) {
		var progress = '';
		if (count > 0) {
			progress = 'page ' + page + ' of ' + max_pages;
			progress += ' / item ' + count + ' of ' + total;
		}
		$('#generate .response').html(msg);
		$('#generate .progress').html(progress);
	}

	function load_page() {

		if (queue.length > 0) {
			load_next();
			return;
		}

		update_progress('Loading page ' + page + '...');

		var username = user.username._content;
		archive = {
			zip: new JSZip(),
			filename: 'flickr_' + username + '_page' + page + '.zip'
		};

		flickr.photos.search({
			user_id: user.id,
			extras: 'description, license, date_upload, date_taken, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_o',
			content_type: 7,
			per_page: 500,
			page: page
		}, function(rsp) {
			max_pages = rsp.photos.pages;
			for (var i = 0; i < rsp.photos.photo.length; i++) {
				queue.push(rsp.photos.photo[i]);
			}
			total = queue.length;
			load_next();
		});
	}

	function load_next() {
		if (paused) {
			return;
		} else if (queue.length > 0) {

			var photo = queue.shift();
			count++;

			var upload_unix = parseInt(photo.dateupload) * 1000;
			var upload_date = new Date(upload_unix);
			var upload_json = upload_date.toJSON();
			var upload = upload_json.match(/^\d\d\d\d-\d\d-\d\d/);

			var image_folder = archive.zip.folder('images');
			var json_folder = archive.zip.folder('json');

			update_progress('Loading ' + photo.title + ' (' + upload[0] + ')');

			var type = 'application/octet-stream';
			var filename = photo.id;
			var json_filename = filename + '.json';

			if (photo.originalformat == 'jpg') {
				type = 'image/jpeg';
				filename += '.jpg';
			} else if (photo.originalformat == 'png') {
				type = 'image/png';
				filename += '.png';
			} else if (photo.originalformat == 'gif') {
				type = 'image/gif';
				filename += '.gif';
			}

			var json = JSON.stringify(photo, null, 4);
			var json_blob = new Blob([json], {
				type: 'application/json'
			});

			var xhr = new XMLHttpRequest();
			xhr.open('GET', photo.url_o);
			xhr.responseType = 'arraybuffer';

			xhr.onload = function() {
				if (this.status === 200) {
					var blob = new Blob([xhr.response], {
						type: type
					});
					image_folder.file(filename, blob);
					json_folder.file(json_filename, json_blob);
					load_next();
				}
			};
			xhr.send();
		} else {
			$('#save-link').html(archive.filename);
			$('#save .reponse').html('');
			$('#save').removeClass('hidden');
			$('#generate-btn').addClass('hidden');
			$('#generate .response').addClass('hidden');
			$('#generate .progress').addClass('hidden');
		}
	}

});
