// CORS Upload

$(function () {
	var file;

	$(':file').change(function () {
		file = this.files[0];
	});

	$(':button').click(function (event) {
		event.preventDefault();

		$('#progressbar').progressbar({
			value: 0,
			max: 100,
			enabled: true
		});

		$.ajax({
			url: 'sign',
			type: 'POST',
			global: true,
			data: {
				file: file.name
			}
		}).done(function (data) {
			var req = new XMLHttpRequest();

			req.upload.addEventListener('progress', function (e) {
				if (e.lengthComputable) {
					var value = (e.loaded / e.total) * 100;
					$('#progressbar').progressbar('value', value);
				}
			});

			req.upload.addEventListener('load', function () {
				$('#progressbar').progressbar('destroy');
				alert(file.name + ' uploaded');
			});

			req.upload.addEventListener('error', function () {
				$('#progressbar').progressbar('destroy');
				alert(file.name + ' failed to upload');
			});

			req.open('PUT', data.url, true);
			req.setRequestHeader('accept', 'application/json');
			req.setRequestHeader('access-control-allow-origin', '*');
			req.setRequestHeader('content-type', data.content_type);
			req.send(file);
		}).fail(function () {
			alert('failed to create signature for ' + file.name);
		});
	});
});
