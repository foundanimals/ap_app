(function($){
	var ap = $('#ap_container');
	var ap_content = $('#ap_content');

	var ap_detail = $('#pet_details');

	var ap_range_start = $('.range_start');
	var ap_range_end = $('.range_end');

	var total_locations = 0;
	var total_locations_counter = 0;

	var locations = [
		// ['Test City', 'http://api.adoptapet.com/search/pets_at_shelter?key=5c3490ed69801d9916ca93987e061154&shelter_id=72604&output=json'],
		['Culver City', 'http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json'],
		['Lakewood', 'http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json']
	];
	var locations_filtered = [];

	var complete_data = [];


	var initApp = function(){
		console.log('init apApp');

		ap.attr('class', '');

		total_locations = locations.length;
		console.log(''+ locations.length +' locations');

		for (var i=0; i < locations.length; i++){
			getData(locations[i][1], locations[i][0]);

			if (i + 1 == locations.length){
				console.log('loop complete');
			}
		}
	}

	var getData = function(location, location_title){
		$.ajax({
			type: 'post',
			url: 'getData.php',
			data: {data_url: location}
		}).done(function(data, textStatus, jqXHR){
			console.log(''+ location_title +' data received');
			parseData(data, location_title);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('proxy or service failure');
		});
	}

	var parseData = function(location_data, location_title){
		_parse_data = JSON.parse(location_data);

		if (_parse_data.pets){
			for (var i=0; i < _parse_data.pets.length; i++){
				_parse_data.pets[i].location = location_title;
				complete_data.push(_parse_data.pets[i]);
			}
		}
		else {
			console.log(''+ location_title +' no results');
		}

		total_locations_counter = total_locations_counter + 1;

		if (total_locations_counter == total_locations){
			console.log(complete_data);
			formatData();
		}
	}


	var formatData = function(){
		if (complete_data.length){
			total_count = complete_data.length;

			for (var i=0; i < complete_data.length; i++){
				pet_id = 'pet_id_'+ complete_data[i].pet_id +'';
				pet_url = complete_data[i].details_url;

				pet_location = complete_data[i].location;

				pet_name = complete_data[i].pet_name.split(' ')[0];
				pet_name = pet_name.split('-')[0];
				pet_name = pet_name.split('.')[0];
				pet_name = pet_name.split(',')[0];

				pet_age = complete_data[i].age;

				pet_photo = complete_data[i].results_photo_url;
				pet_photo_w = ''+ complete_data[i].results_photo_width +'px';
				pet_photo_h = ''+ complete_data[i].results_photo_height +'px';

				pet_sex = complete_data[i].sex;
				if (pet_sex == 'm'){
					pet_sex = 'Male'
				}
				else {
					pet_sex = 'Female'
				}

				cellFormat = '<div class="pet" id="'+ pet_id +'" data-pet-url="'+ pet_url +'"><div class="photo_wrapper"><img class="pet_photo" src="'+ pet_photo +'" style="width: '+ pet_photo_w +'; height: '+ pet_photo_h +';" /></div> <div class="pet_name">'+ pet_name +'</div> <div class="pet_info">'+ pet_sex +', <span>'+ pet_age +'</span></div> <div class="pet_city">'+ pet_location +'</div> </div>';

				ap_content.append(cellFormat);

				$('#'+ pet_id +'').click(function(){
					data_url = $(this).attr('data-pet-url');
					getDetails(data_url);
				});
			}
			
			ap_range_start.html(total_count);
			ap_range_end.html(total_count);
			ap.addClass('ready');
		}
		else {
			console.log('there is no data');
			ap_content.append('there is no data');
			ap.addClass('ready');
		}
	}


	var getDetails = function(url){
		$.ajax({
			type: 'post',
			url: 'getData.php',
			data: {data_url: url}
		}).done(function(data, textStatus, jqXHR){
			console.log(data);
			ap_detail.html(data);
			ap_detail.addClass('active');

			ap_detail.click(function(){
				$(this).attr('class', '');
			});
			//parseData(data, location_title);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('proxy or service failure');
		});
	}


	// init application
	initApp();

})(jQuery);
