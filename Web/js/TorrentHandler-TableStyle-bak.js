var requestPool = [];

$(document).ready(function () {
	showStatusText(false);
	initSites();
});

function initSites() {
	let siteBtnHolder = $("#siteBtnHolder");
	siteBtnHolder.empty();

	showProgress(true, "Getting list of sites")

	sendGet('sites', {}, 
		function (response) {
			showProgress(false);

			if (!response || response.length == 0) {
				showToast("Could not retrieve site details, please try after some time");
				return;
			}

			response.forEach(function(site, index) {
				let siteBtn = $("#siteBtn").clone(true);

				siteBtn.prop("id", "siteBtn" + site.id);
				siteBtn.html(site.name);

				siteBtn.on("click", function() {
					searchTorrents(site.id);
				});

				siteBtn.removeClass("d-none");

				siteBtnHolder.append(siteBtn);
			});

			showStatusText(true);
		},
		function (error) {
			showProgress(false);
			showToast("Could not retrieve site details, please try after some time");
			console.log(error);
		}
	);
}

function searchTorrents(siteId) {
	let torrentDataDiv = $("#torrentDataDiv");
	let tbody = torrentDataDiv.find("table > tbody")

	torrentDataDiv.addClass("d-none");
	tbody.html("");

	let searchKey = $('#searchInput').val();
	searchKey = searchKey.trim();
	if (!searchKey) {
		showToast("Search Query cannot be empty!")
		return;
	}

	let safeSearch = $("#safeSearchCB").prop("checked");

	showProgress(true, "Searching '" + searchKey + "' Torrents" + (safeSearch ? " safely" : ""));

	showStatusText(false);

	sendGet("sites/" + siteId + "/search/" + searchKey, {"safe": safeSearch, "page": 1}, 
		function (response) {
			showProgress(false);

			if (!response || response.length == 0) {
				showStatusText(true, "No Torrents Found");
				return;
			}

			let html = "";

			response.forEach(function(torrent, index) {
				let tr = 
						"<tr>" +
						"<td>" + torrent.name + "</td>" +
						"<td class='text-success'>" + torrent.seeders + "</td>" +
						"<td class='text-danger'>" + torrent.leechers + "</td>" +
						"<td class='text-info'>" + torrent.size + "</td>" +
						"<td class='text-warning'>" + getDate(torrent.date) + "</td>" +
						"<td class='text-primary'>" + torrent.uploader + "</td>" +
						"</tr>";

				html += tr;
			});

			$(".torrent-datatable").DataTable().destroy();
			tbody.html(html);
			$(".torrent-datatable").DataTable({
				order: [[1, 'asc']],
				searching: false,
				bPaginate: false,
				bLengthChange: false,
				bFilter: true,
				bInfo: false,
				bAutoWidth: false
			});

			torrentDataDiv.removeClass("d-none");
		},
		function (error) {
			showProgress(false);
			showToast("Could not retrieve torrents list, please try after some time");
			console.log(error);
		}
	);
}

function showProgress(show, text)
{
	let tProgress = $("#tProgress");
	let tProgressText = $("#tProgressText");

	tProgressText.html(text);

	if(show) tProgress.removeClass("d-none");
	else tProgress.addClass("d-none");
}

function showStatusText(show, text, reset) {
	let statusText = $("#statusText");

	if(text) statusText.html(text);

	if(show) statusText.removeClass("d-none");
	else statusText.addClass("d-none");
}

function getDate(dateInMillis) {
	let thatDate = moment.unix(dateInMillis).utc().startOf('day');
	let todayDate = moment().utc().startOf('day');
	let diff = moment.duration(todayDate.diff(thatDate))
	let diffDays = parseInt(diff.asDays());
	let diffWeeks = parseInt(diff.asWeeks());

	if(diffDays >= 1 && diffDays <= 6) return diffDays + (diffDays == 1 ? " days ago" : " days ago")

	if(diffWeeks >= 1 && diffWeeks <= 4) return diffWeeks + (diffWeeks == 1 ? " week ago" : " weeks ago")

	return thatDate.format("DD MMM YYYY")
}

function showToast(text) {
	$("#customToastText").html(text);
	$("#customToast").toast("show");
}

function sortTableRow(tableID, colIndex, type) {
	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
	table = document.getElementById(tableID);

	switching = true;
	dir = "asc";

	while (switching) {
		switching = false;
		rows = table.rows;

		for (i = 1; i < (rows.length - 1); i++) {
			shouldSwitch = false;

			x = rows[i].getElementsByTagName("TD")[colIndex];
			y = rows[i + 1].getElementsByTagName("TD")[colIndex];

			let ascCondition, descCondition;

			switch (type) {
				case "alphabetic":
					ascCondition = x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase();
					descCondition = x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase();
					break;

				case "numeric":
					ascCondition = Number(x.innerHTML.toLowerCase()) > Number(y.innerHTML.toLowerCase());
					descCondition = Number(x.innerHTML.toLowerCase()) < Number(y.innerHTML.toLowerCase());
					break;

				case "size":
					ascCondition = convertToBytes(x.innerHTML.toLowerCase()) > convertToBytes(y.innerHTML.toLowerCase());
					descCondition = convertToBytes(x.innerHTML.toLowerCase()) < convertToBytes(y.innerHTML.toLowerCase());
					break;
			}

			if (dir == "asc") {
				if (ascCondition) {
					shouldSwitch = true;
					break;
				}
			} else if (dir == "desc") {
				if (descCondition) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			switchcount++;

			let ths = $(table).find('th');

			ths.each
				(
					function (index) {
						$(this).html($(this).data('orightml'));
					}
				);

			let th = ths[colIndex];

			if (dir == "asc") {
				$(th).html($(th).data('orightml') + " ▲");
			}
			else if (dir == "desc") {
				$(th).html($(th).data('orightml') + " ▼");
			}

		} else {
			if (switchcount == 0 && dir == "asc") {
				dir = "desc";
				switching = true;
			}
		}
	}
}

function convertToBytes(sizeStr) {
	sizeSplit = sizeStr.split(" ");

	step = 1000.0;
	bytes = 1;

	sizeList = ['bytes', 'KB', 'MB', 'GB', 'TB'];

	for (let i = 0; i < sizeList.length; i++) {
		if (sizeList[i].toLowerCase() == sizeSplit[1].toLowerCase())
			break;

		bytes *= step;
	}

	return bytes * Number(sizeSplit[0]);
}

function populateTable(torrents, site) {
	let html = "";
	torrents.forEach
		(
			function (data, index) {
				html += "<tr onclick=\"selectTorrent('" + quoteEscaped(data.name) + "', '" + data.link + "', '" + site + "')\">" +
					"<td>" + (index + 1) + "</td>" +
					"<td class=\"blue-text\">" + data.name + "</td>" +
					"<td class=\"green-text\">" + data.seeds + "</td>" +
					"<td class=\"red-text\">" + data.leeches + "</td>" +
					"<td>" + data.size + "</td>" +
					"<td class=\"purple-text\">" + data.uploader + "</td>" +
					"</tr>";
			}
		);

	$('#' + site + ' > div > table > tbody').html(html);
	$('#' + site + ' > div > table').css('display', '');

	$('#' + site + ' > a').unbind('click');
	$('#' + site + ' > a').click
		(
			function () {
				toggle(site);
			}
		);

	$('#' + site + ' > a').css('display', 'inline-block');
}

function selectTorrent(name, link, site) {
	$('#loader, #torrentLoader').css('display', 'block');
	$('#torrentData').css('display', 'none');
	$('#torrentDataModal').modal('open');

	sendGet
		(
			'getTorrentData',
			{ 'link': link, 'site': site },
			function (response) {
				if (response == "Invalid Request") {
					$('#loader').css('display', 'none');
					$('#torrentDataModal').modal('close');
					M.toast({ html: 'Server received a invalid request, try again!', displayLength: 2000 });
					return;
				}

				populateModal(name, response);

				$('#loader').css('display', 'none');
				$('#torrentData').css('display', 'block');
			},
			function (error) {
				$('#loader').css('display', 'none');
				$('#torrentDataModal').modal('close');
				M.toast({ html: 'Error Occured, Check console for details', displayLength: 2000 });
				console.log(error);
			}
		);
}

function populateModal(name, data) {
	$('#tName').html(name);

	let html = "";
	data.files.forEach
		(
			function (file) {
				html += "<h6 class=\"blue-text\">" + file + "</h6>";
			}
		);

	$('#files').html(html);

	$('#oitBtn').unbind('click');
	$('#oitBtn').click
		(
			function () {
				window.open(data.magnet);
			}
		);

	$('#cplBtn').unbind('click');
	$('#cplBtn').click
		(
			function () {
				M.toast({ html: 'Magnet copied to clipboard!', displayLength: 2000 });
				copyToClipboard(data.magnet);
			}
		);
}

function sendGet(to, data, success, failed) {
	let request = $.ajax
		(
			{
				type: 'GET',
				contentType: 'application/json',
				url: 'http://192.168.191.141:50001/' + to,
				data: data,
				dataType: 'json',
				cache: false,
				timeout: 60000,
				success: success,
				error: failed
			}
		);
	requestPool.push(request);
}

function abortAllRequests() {
	requestPool.forEach
		(
			function (request) {
				request.abort();
			}
		);
	requestPool = [];
}

function toggle(site) {
	css = $('#' + site + ' > div > table').css('display');

	if (css == '' || css == 'table' || css == 'block') $('#' + site + ' > div > table').css('display', 'none');
	else if (css == 'none') $('#' + site + ' > div > table').css('display', '');
}

function quoteEscaped(str) {
	str = str.replace(/'/g, "\\'");
	str = str.replace(/"/g, '\\"');

	return str;
}

function copyToClipboard(value) {
	let temp = $("<input>");
	$("body").append(temp);
	temp.val(value).select();
	document.execCommand("copy");
	temp.remove();
}
