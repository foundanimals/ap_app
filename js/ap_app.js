(function($){
	var ap = $('#ap_container');
	var ap_content = $('#ap_content');

	var ap_details = $('#pet_details');
	var ap_details_close = $('#pet_details_close');
	var ap_details_content = $('#pet_details_content');
	var ap_details_name = $('.pet_details_name > span');
	var ap_details_color = $('.pet_details_color > span');
	var ap_details_species = $('.pet_details_species > span');
	var ap_details_age = $('.pet_details_age > span');
	var ap_details_sex = $('.pet_details_sex > span');
	var ap_details_size = $('.pet_details_size > span');
	var ap_details_hair = $('.pet_details_hair > span');
	var ap_details_primary = $('.pet_details_primary > span');
	var ap_details_primary_pure = $('.pet_details_pure > span');
	var ap_details_secondary = $('.pet_details_secondary > span');
	var ap_details_special_needs = $('.pet_details_special_needs > span');
	var ap_details_city = $('.pet_details_city > span');
	var ap_details_photos = $('.pet_details_photos');

	var ap_range_start = $('.range_start');
	var ap_range_end = $('.range_end');

	var total_locations = 0;
	var total_locations_counter = 0;

	var filter_count = 0;

	var locations = [
		// ['Test City', 'http://api.adoptapet.com/search/pets_at_shelter?key=5c3490ed69801d9916ca93987e061154&shelter_id=72604&output=json'],
		['Culver City', 'http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json'],
		['Lakewood', 'http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json']
	];

	var complete_data = [];

	var filter_set = [];
	filter_set.location = [];
	filter_set.species = [];
	filter_set.sex = [];
	filter_set.age = [];
	filter_set.color = [];
	filter_set.breed = [];
	filter_set.magic = ['sdfsdfsdf', 'sdfsdfsdf'];


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
			
			createFilters();
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
			data = JSON.parse(data);
			console.log(data);

			ap_details_name.html(data['pet']['pet_name']);
			ap_details_color.html(data['pet']['color']);
			ap_details_species.html(data['pet']['species']);
			ap_details_age.html(data['pet']['age']);
			ap_details_sex.html(data['pet']['sex']);
			ap_details_size.html(data['pet']['size']);
			ap_details_hair.html(data['pet']['hair_length']);
			ap_details_primary.html(data['pet']['primary_breed']);
			ap_details_primary_pure.html(data['pet']['purebred']);
			ap_details_secondary.html(data['pet']['secondary_breed']);
			ap_details_special_needs.html(data['pet']['special_needs']);
			ap_details_city.html(data['pet']['addr_city']);


			if (data['pet']['images']){
				ap_details_photos.html('');
				for (var i=0; i < data['pet']['images'].length; i++){
					ap_details_photos.append('<img src="'+ data['pet']['images'][i]['original_url'] +'" />');
				}

				for (var i=0; i < data['pet']['images'].length; i++){
					ap_details_photos.append('<img src="'+ data['pet']['images'][i]['thumbnail_url'] +'" />');
				}
			}
			else {
				ap_details_photos.html('');
			}


			$('#pet_details_content div').each(function(){
				span = $(this).find('span').html();
				if (span == 0 || span == null){
					$(this).addClass('no-value');
				}
				else {
					$(this).removeClass('no-value');
				}
			});


			ap.addClass('details_active');

			ap_details_close.click(function(){
				ap.removeClass('details_active');
			});
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('proxy or service failure');
		});
	}

	var createFilters = function(){

		for (var i=0; i < complete_data.length; i++){
			url = complete_data[i].details_url;

			$.ajax({
				type: 'post',
				url: 'getData.php',
				data: {data_url: url}
			}).done(function(data, textStatus, jqXHR){
				data = JSON.parse(data);
				
				filter_set.location.push(data['pet']['addr_city']);
				filter_set.species.push(data['pet']['species']);
				filter_set.sex.push(data['pet']['sex']);
				filter_set.age.push(data['pet']['age']);
				filter_set.color.push(data['pet']['color']);
				filter_set.breed.push(data['pet']['primary_breed']);

				filter_count = filter_count + 1;

				if (filter_count == complete_data.length){
					_test = _.uniq(filter_set.color, false);
					console.log(_test);
				}

			}).fail(function(jqXHR, textStatus, errorThrown){
				console.log('proxy or service failure');
			});

		}

		
		
		//console.log(filter_set);
		//formatData();
	}

	// init application
	initApp();

})(jQuery);
