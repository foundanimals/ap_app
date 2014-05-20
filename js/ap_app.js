(function($){
	var ap = $('#ap_container');
	var ap_content = $('#ap_content');

	var ap_modal = $('#ap_modal');
	var ap_modal_close = $('#ap_modal_close');
	var ap_modal_content = $('#ap_modal_content');
	var ap_modal_name = $('.pet_details_name > span');
	var ap_modal_color = $('.pet_details_color > span');
	var ap_modal_species = $('.pet_details_species > span');
	var ap_modal_age = $('.pet_details_age > span');
	var ap_modal_sex = $('.pet_details_sex > span');
	var ap_modal_size = $('.pet_details_size > span');
	var ap_modal_hair = $('.pet_details_hair > span');
	var ap_modal_primary = $('.pet_details_primary > span');
	var ap_modal_primary_pure = $('.pet_details_pure > span');
	var ap_modal_secondary = $('.pet_details_secondary > span');
	var ap_modal_special_needs = $('.pet_details_special_needs > span');
	var ap_modal_city = $('.pet_details_city > span');
	var ap_modal_photos = $('.pet_details_photos');

	var ap_range_start = $('.range_start');
	var ap_range_end = $('.range_end');

	var total_locations = 0;
	var total_locations_counter = 0;

	var filter_count = 0;

	var locations = [
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=5c3490ed69801d9916ca93987e061154&shelter_id=72604&output=json'],
		
		['http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json&start_number=1&end_number=5'],
		['http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json&start_number=1&end_number=5']
		
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json'],
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json']
	];

	var complete_data = [];
	var _complete_data = [];

	var filter_set = [];
	filter_set.location = [];
	filter_set.species = [];
	filter_set.sex = [];
	filter_set.age = [];
	filter_set.color = [];
	filter_set.breed = [];

	var filter_by = [];
	//filter_by.color = ["White", "Red", "Black"];
	filter_by.color = [];

	var total_pets = 0;
	var total_pets_i = 0;


	var initApp = function(){
		ap.attr('class', '');

		console.log('init apApp');
		console.log('apApp: '+ locations.length +' locations');

		if (locations.length){
			for (var i = 0; i < locations.length; i++){
				getData(locations[i][0]);
			}

			console.log('apApp: init complete');
		}
		else {
			console.log('apApp: no locations or program error');
		}
	}


	var getData = function(url){
		$.ajax({
			type: 'post',
			url: 'getData.php',
			data: {data_url: url}
		}).done(function(data, textStatus, jqXHR){
			console.log('getData: data received');
			getDetails(data);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('getData: proxy or service failure');
		});
	}


	var getDetails = function(data){
		data = JSON.parse(data);
		total_pets = total_pets + data.returned_pets;

		console.log('getDetails: '+ total_pets +'');
		//console.log(data);

		if (data.pets){
			for (var i = 0; i < data.pets.length; i++){
				url = data.pets[i].details_url;
				preview_image = [data.pets[i].results_photo_url, data.pets[i].results_photo_width, data.pets[i].results_photo_height];

				(function(url, preview_image){
					$.ajax({
						type: 'post',
						url: 'getData.php',
						data: {data_url: url}
					}).done(function(data, textStatus, jqXHR){
						data = JSON.parse(data);
						data.pet.preview_image = preview_image;
						data.pet.details_url = url;
						//console.log(data.pet);

						complete_data.push(data.pet);

						total_pets_i = total_pets_i + 1;
						if (total_pets_i == total_pets){
							console.log('getDetails: received all '+ total_pets +' pet details');
							console.log(complete_data);
							parseData();
						}
					}).fail(function(jqXHR, textStatus, errorThrown){
						console.log('getDetails: proxy or service failure');
					});
				})(url, preview_image);
			}
		}
		else {
			console.log('getDetails: there is no data');
		}
	}

	// this function needs to process complete_data and clean up fields
	// also needs to generate a list of filterable qualities
	var parseData = function(){
		console.log('parseData');

		for (var key in complete_data){
			if (complete_data.hasOwnProperty(key)){
				// clean up data in pet array
				color = complete_data[key].color.split(' ')[0];
				color = complete_data[key].color.split('- W')[0];
				color = complete_data[key].color.split('-')[0];
				color = complete_data[key].color.split('.')[0];
				color = complete_data[key].color.split(',')[0];
				color = complete_data[key].color.split('(')[0];
				color = complete_data[key].color.split('/')[0];

				breed = complete_data[key].primary_breed.split(' ')[0];
				breed = complete_data[key].primary_breed.split('-')[0];
				breed = complete_data[key].primary_breed.split('.')[0];
				breed = complete_data[key].primary_breed.split(',')[0];
				breed = complete_data[key].primary_breed.split('(')[0];
				breed = complete_data[key].primary_breed.split('/')[0];
				breed = complete_data[key].primary_breed.split('(Unknown')[0];
				
				// apply changes
				complete_data[key].color = color;
				complete_data[key].primary_breed = breed;

				// set filter values
				filter_set.location.push(complete_data[key].addr_city);
				filter_set.species.push(complete_data[key].species);
				filter_set.sex.push(complete_data[key].sex);
				filter_set.age.push(complete_data[key].age);
				if (color.length < 6){
					filter_set.color.push(color);
				}
				filter_set.breed.push(breed);
			}
		}

		// remove duplicates in filters
		filter_set.location = _.uniq(filter_set.location, false);
		filter_set.species = _.uniq(filter_set.species, false);
		filter_set.sex = _.uniq(filter_set.sex, false);
		filter_set.age = _.uniq(filter_set.age, false);
		filter_set.color = _.uniq(filter_set.color, false);
		filter_set.breed = _.uniq(filter_set.breed, false);

		filters();
		applyFilters();
	}

	var applyFilters = function(){
		ap.removeClass('ready');
		ap_content.html('');

		filtered_colors = null;
		_complete_data = complete_data;

		// same filter
		if (filter_by.color.length){
			filtered_colors = _.filter(filter_set.color, function(a){
				return _.find(filter_by.color, function(b){
					return b === a;
				});
			});
		}

		// filter by color
		if (filter_by.color.length){
			_complete_data =_.filter(complete_data, function(a){
				return _.find(filter_by.color, function(b){
					return b === a.color;
				});
			});
		}


		console.log('applyFilters: filter array test, colors to filter by')
		console.log(filtered_colors);

		console.log('applyFilters: filter array test, complete_data');
		//console.log(filtered_complete_data);

		format();
	}


	var filters = function(){
		console.log('filters');
		//console.log(Object.keys(filter_set).length);

		for (var key in filter_set){
			if (filter_set.hasOwnProperty(key)){
				
				//console.log(key);
				//console.log(_filter_set[key].length);
				//console.log(_filter_set[key]);

				$('.controls').append('<ul class="filter_'+ key +'" data-filter-group="'+ key +'"></ul>');

				for (var i = 0; i < filter_set[key].length; i++){
					//console.log(_filter_set[key][i]);

					$('.filter_'+ key +'').append('<li class="filter_'+ filter_set[key][i] +'" data-filter="'+ filter_set[key][i] +'" data_filter_applied="false">'+ filter_set[key][i] +'</li>');


					$('.filter_'+ filter_set[key][i] +'').click(function(){

						parent_filter = $(this).parent().attr('data-filter-group');
						filter = $(this).attr('data-filter');

						console.log(''+ parent_filter +' > '+ filter +'');

						console.log(parent_filter);

						if (_.contains(_.pluck(filter_by[parent_filter]), filter)){

							console.log('yay');
						}


						if (filter in filter_by[parent_filter]){
							console.log('its there!');
							filter_by[parent_filter].splice(filter, 1);
						}
						else {
							filter_by[parent_filter].push(filter);
							filter_by[parent_filter] = _.uniq(filter_by[parent_filter], false);
						}

						console.log(filter_by[parent_filter]);

						applyFilters();
					});
				}
			}
		}
	}


	var format = function(){
		console.log('format');

		if (_complete_data.length){
			total_count = _complete_data.length;

			for (var i = 0; i < _complete_data.length; i++){
				pet_id = 'pet_id_'+ _complete_data[i].pet_id +'';
				pet_url = _complete_data[i].details_url;

				pet_location = _complete_data[i].addr_city;

				pet_name = _complete_data[i].pet_name.split(' ')[0];
				pet_name = pet_name.split('-')[0];
				pet_name = pet_name.split('.')[0];
				pet_name = pet_name.split(',')[0];

				pet_age = _complete_data[i].age;

				pet_photo = _complete_data[i].preview_image[0];
				pet_photo_w = ''+ _complete_data[i].preview_image[1] +'px';
				pet_photo_h = ''+ _complete_data[i].preview_image[2] +'px';

				pet_sex = _complete_data[i].sex;
				if (pet_sex == 'm'){
					pet_sex = 'Male'
				}
				else {
					pet_sex = 'Female'
				}

				cellFormat = '<div class="pet" id="'+ pet_id +'" data-pet-url="'+ pet_url +'"><div class="photo_wrapper"><img class="pet_photo" src="'+ pet_photo +'" style="width: '+ pet_photo_w +'; height: '+ pet_photo_h +';" /></div> <div class="pet_name">'+ pet_name +'</div> <div class="pet_info">'+ pet_sex +', <span>'+ pet_age +'</span></div> <div class="pet_city">'+ pet_location +'</div> </div>';

				ap_content.append(cellFormat);

				$('#'+ pet_id +'').click(function(){
					url = $(this).attr('data-pet-url');
					modal(url);
				});
			}
			
			ap_range_start.html(total_count);
			ap_range_end.html(total_count);
			ap.addClass('ready');
		}
		else {
			console.log('format: there is no data');
			ap_content.append('there is no data');
			ap.addClass('ready');
		}
	}


	var modal = function(url){
		ap.attr('class', '');

		$.ajax({
			type: 'post',
			url: 'getData.php',
			data: {data_url: url}
		}).done(function(data, textStatus, jqXHR){
			data = JSON.parse(data);

			console.log('modal');
			console.log(data);

			ap_modal_name.html(data['pet']['pet_name']);
			ap_modal_color.html(data['pet']['color']);
			ap_modal_species.html(data['pet']['species']);
			ap_modal_age.html(data['pet']['age']);
			ap_modal_sex.html(data['pet']['sex']);
			ap_modal_size.html(data['pet']['size']);
			ap_modal_hair.html(data['pet']['hair_length']);
			ap_modal_primary.html(data['pet']['primary_breed']);
			ap_modal_primary_pure.html(data['pet']['purebred']);
			ap_modal_secondary.html(data['pet']['secondary_breed']);
			ap_modal_special_needs.html(data['pet']['special_needs']);
			ap_modal_city.html(data['pet']['addr_city']);


			if (data['pet']['images']){
				ap_modal_photos.html('');
				for (var i = 0; i < data['pet']['images'].length; i++){
					ap_modal_photos.append('<img src="'+ data['pet']['images'][i]['original_url'] +'" />');
				}

				for (var i = 0; i < data['pet']['images'].length; i++){
					ap_modal_photos.append('<img src="'+ data['pet']['images'][i]['thumbnail_url'] +'" />');
				}
			}
			else {
				ap_modal_photos.html('');
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

			ap.addClass('ready');
			ap.addClass('details_active');

			ap_modal_close.click(function(){
				ap.removeClass('details_active');
			});
		}).fail(function(jqXHR, textStatus, errorThrown){
			ap.addClass('ready');
			console.log('modal: proxy or service failure');
			alert('modal: proxy or service failure');
		});
	}

	
	// init application
	initApp();

})(jQuery);
