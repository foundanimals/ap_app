(function($){
	var ap = $('#ap_container');
	var ap_content = $('#ap_content');

	var locations = [
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=5c3490ed69801d9916ca93987e061154&shelter_id=72604&output=json'],
		
		['http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json&start_number=1&end_number=10'],
		['http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json&start_number=1&end_number=10']
		
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=95052e1b892a28c5f89f696edf39b4ec&shelter_id=87677&output=json'],
		// ['http://api.adoptapet.com/search/pets_at_shelter?key=ffa2f34adb6076ce7aba8162fb899d64&shelter_id=87678&output=json']
	];

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

	var total_pets = 0;
	var total_pets_i = 0;

	var complete_data = [];
	var _complete_data = [];

	var filter_count = 0;

	var filter_set = [];
	filter_set.location = [];
	filter_set.species = [];
	filter_set.sex = [];
	filter_set.age = [];
	filter_set.color = [];
	filter_set.breed = [];

	var filter_by = [];
	filter_by.location = [];
	filter_by.species = [];
	filter_by.sex = [];
	filter_by.age = [];
	filter_by.color = [];
	filter_by.breed = [];
	
	
	/* inits app, gets count of locations
	*/
	var initApp = function(){
		ap.attr('class', '');

		console.log('init apApp');
		console.log('apApp: '+ locations.length +' locations');

		if (locations.length > 0){
			for (var i = 0; i < locations.length; i++){
				getData(locations[i][0]);
			}

			console.log('apApp: init complete');
		}
		else {
			console.log('apApp: no locations or program error');
		}
	}


	/* grabs general listing from API
	*/
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

	/* uses general listing to retrieved detailed info,
	** some variables are pushed into the details array,
	** adds details to complete_data
	** total_pets used as a trigger to ensure all ajax calls
	** are complete before parsing data
	*/
	var getDetails = function(data){
		data = JSON.parse(data);
		total_pets = total_pets + data.returned_pets;

		console.log('getDetails: '+ total_pets +'');
		//console.log(data);

		if (data.pets){
			for (var i = 0; i < data.pets.length; i++){
				url = data.pets[i].details_url;
				preview_image = [data.pets[i].results_photo_url, data.pets[i].results_photo_width, data.pets[i].results_photo_height];

				// anonymous function used to prevent crossover
				(function(url, preview_image){
					$.ajax({
						type: 'post',
						url: 'getData.php',
						data: {data_url: url}
					}).done(function(data, textStatus, jqXHR){
						// rebuild some data
						data = JSON.parse(data);

						data.pet.pet_name = data.pet.pet_name.split(' ')[0];
						data.pet.pet_name = data.pet.pet_name.split('-')[0];
						data.pet.pet_name = data.pet.pet_name.split('.')[0];
						data.pet.pet_name = data.pet.pet_name.split(',')[0];

						data.pet.preview_image = preview_image;
						data.pet.details_url = url;
						data.pet.color_array = data.pet.color.toLowerCase();
						data.pet.color_array = returnColors(data.pet.color_array);
						data.pet.location = [data.pet.addr_city];

						complete_data.push(data.pet);

						// this counter confirms that all location data has been retrieved
						total_pets_i = total_pets_i + 1;
						if (total_pets_i == total_pets){
							console.log('getDetails: received all '+ total_pets +' pet details');

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



	/* This function iterates over complete_data and produces filters
	*/
	var parseData = function(){
		console.log('parseData');

		for (var key in complete_data){
			if (complete_data.hasOwnProperty(key)){

				// clean up data string
				// run through color array function
				color = complete_data[key].color_array;
				
				// push filter values
				for (var i = 0; i < color.length; i++){
					filter_set.color.push(color[i].toLowerCase());
				}
				filter_set.breed.push(complete_data[key].primary_breed);
				filter_set.location.push(complete_data[key].addr_city);
				filter_set.species.push(complete_data[key].species);
				filter_set.sex.push(complete_data[key].sex);
				filter_set.age.push(complete_data[key].age);
			}
		}

		// remove duplicates in filters
		filter_set.location = _.uniq(filter_set.location, false);
		filter_set.species = _.uniq(filter_set.species, false);
		filter_set.sex = _.uniq(filter_set.sex, false);
		filter_set.age = _.uniq(filter_set.age, false);
		filter_set.color = _.uniq(filter_set.color, false);
		filter_set.breed = _.uniq(filter_set.breed, false);

		// sort filters
		filter_set.location = filter_set.location.sort(function(a, b){
			if (a < b) return 1;
		    if (b < a) return -1;
		    return 0;
		}).reverse();

		filter_set.species = filter_set.species.sort(function(a, b){
			if (a < b) return 1;
		    if (b < a) return -1;
		    return 0;
		}).reverse();

		filter_set.sex = filter_set.sex.sort(function(a, b){
			if (a < b) return 1;
		    if (b < a) return -1;
		    return 0;
		}).reverse();

		age = [];
		for (age_i = 0; age_i < filter_set.age.length; age_i++){
			if (filter_set.age[age_i] == 'Senior'){
				age[0] = filter_set.age[age_i];
			}
			else if (filter_set.age[age_i] == 'Adult'){
				age[1] = filter_set.age[age_i];
			}
			else if (filter_set.age[age_i] == 'Young'){
				age[2] = filter_set.age[age_i];
			}
			else if (filter_set.age[age_i] == 'Kitten'){
				age[3] = filter_set.age[age_i];
			}
			else if (filter_set.age[age_i] == 'Puppy'){
				age[4] = filter_set.age[age_i];
			}
		}
		age = age.filter(function(e){return e}); 
		filter_set.age = age;

		filter_set.color = filter_set.color.sort(function(a, b){
			if (a < b) return 1;
		    if (b < a) return -1;
		    return 0;
		}).reverse();

		filter_set.breed = filter_set.breed.sort(function(a, b){
		    if (a < b) return 1;
		    if (b < a) return -1;
		    return 0;
		}).reverse();

		filters();
	}


	/* this function builds API filters and
	** binds the navigation to apply and remove filters
	*/
	var filters = function(){
		console.log('filters');
		//console.log(Object.keys(filter_set).length);

		for (var key in filter_set){
			if (filter_set.hasOwnProperty(key)){
				
				//console.log(key);
				//console.log(_filter_set[key].length);
				//console.log(_filter_set[key]);

				$('.controls').append('<ul class="filter_'+ key +'" data-filter-group="'+ key +'"></ul>');
				$('.filter_'+ key +'').append('<lh class="filter_header_'+ key +'" data-filter-parent="'+ key +'" data-filter-open="false">'+ key +'</lh>');

				$('.filter_header_'+ key +'').click(function(){
					if ($(this).attr('data-filter-open') == 'false'){
						parent_filter = $(this).attr('data-filter-parent');
						$(this).attr('data-filter-open', 'true');
						$('.filter_'+ parent_filter +'').addClass('open');
					}
					else {
						parent_filter = $(this).attr('data-filter-parent');
						$(this).attr('data-filter-open', 'false');
						$('.filter_'+ parent_filter +'').removeClass('open');
					}
				});

				for (var i = 0; i < filter_set[key].length; i++){
					//console.log(_filter_set[key][i]);
					cssName = ''+ [key] +'_'+ [i] +'';

					$('.filter_'+ key +'').append('<li class="'+ cssName +'" data-filter="'+ filter_set[key][i] +'" data-filter-parent="'+ key +'" data-filter-applied="false">'+ filter_set[key][i] +'</li>');

					$('.'+ cssName +'').click(function(){
						parent_filter = $(this).attr('data-filter-parent');
						filter = $(this).attr('data-filter');

						//console.log(''+ parent_filter +' > '+ filter +'');

						// if filter is applied remove filter and refreah
						// else add filter and refresh
						if ($(this).attr('data-filter-applied') == 'true'){
							removeArrayItem(filter_by[parent_filter], filter);
							filter_by[parent_filter] = _.uniq(filter_by[parent_filter], false);

							$(this).removeClass('active');
							$(this).attr('data-filter-applied', 'false');
							
							console.log('duplicate');
							console.log(filter_by);
						}
						else {
							filter_by[parent_filter].push(filter);
							filter_by[parent_filter] = _.uniq(filter_by[parent_filter], false);

							$(this).addClass('active');
							$(this).attr('data-filter-applied', 'true');
							
							console.log('original');
							// console.log(filter_by);
						}

						ap.attr('class', '');
						applyFilters();
					});
				}
			}
		}

		applyFilters();
	}


	/* recreates complete_data as _complete_data
	** applies selected filters
	*/
	var applyFilters = function(){
		ap.attr('class', '');
		ap_content.html('');

		_complete_data = [];

		// create a count of active filters
		// pets will need to clear all active filters
		filter_count = 0;
		if (filter_by.location.length > 0){
			filter_count = filter_count + 1;
		}
		if (filter_by.color.length > 0){
			filter_count = filter_count + 1;
		}
		if (filter_by.species.length > 0){
			filter_count = filter_count + 1;
		}
		if (filter_by.sex.length > 0){
			filter_count = filter_count + 1;
		}
		if (filter_by.age.length > 0){
			filter_count = filter_count + 1;
		}
		if (filter_by.breed.length > 0){
			filter_count = filter_count + 1;
		}

		// individual tests for filters
		// compares complete_data to active filters
		// only pushes data that confirms each active filter set
		for (var i = 0; i < complete_data.length; i++){
			_filter_count = 0;
			
			for (var loc_i = 0; loc_i < complete_data[i].location.length; loc_i++){
				if (isInArray(complete_data[i].location[loc_i], filter_by.location)){
					_filter_count = _filter_count + 1;
				}
			}

			for (var color_i = 0; color_i < complete_data[i].color_array.length; color_i++){
				if (isInArray(complete_data[i].color_array[color_i], filter_by.color)){
					_filter_count = _filter_count + 1;
				}
			}

			for (var species_i = 0; species_i < filter_by.species.length; species_i++){
				if (complete_data[i].species == filter_by.species[species_i]){
					_filter_count = _filter_count + 1;
				}
			}

			for (var sex_i = 0; sex_i < filter_by.sex.length; sex_i++){
				if (complete_data[i].sex == filter_by.sex[sex_i]){
					_filter_count = _filter_count + 1;
				}
			}

			for (var age_i = 0; age_i < filter_by.age.length; age_i++){
				if (complete_data[i].age == filter_by.age[age_i]){
					_filter_count = _filter_count + 1;
				}
			}

			for (var breed_i = 0; breed_i < filter_by.breed.length; breed_i++){
				if (complete_data[i].primary_breed == filter_by.breed[breed_i]){
					_filter_count = _filter_count + 1;
				}
			}

			if (_filter_count === filter_count){
				_complete_data.push(complete_data[i]);
			}
		}

		_complete_data = _.uniq(_complete_data, false);

		// console.log(_complete_data);
		console.log('applyFilters: complete');

		activeFilters();
		applySorting();
	}


	var activeFilters = function(){
		console.log('activeFilters');
		$('.active-filters').html('');

		if (filter_by){
			console.log('activeFilters if');

			for (var key in filter_by){
				if (filter_by.hasOwnProperty(key)){
					console.log(key);

					for (i = 0; i < filter_by[key].length; i++){
						$('.active-filters').append('<span>'+ filter_by[key][i] +'</span>');
						console.log(filter_by[key][i]);
					}

					
				}
			}

		}
	}


	var applySorting = function(){
		// sort pet_name by alpha
		_complete_data = _complete_data.sort(function(a, b){
			if (a.pet_name < b.pet_name) return 1;
		    if (b.pet_name < a.pet_name) return -1;
		    return 0;
		}).reverse();

		format();
	}


	/* takes complete_data and produces html for presentation
	*/
	var format = function(){
		console.log('format');

		if (_complete_data.length){
			total_count = _complete_data.length;

			for (var i = 0; i < _complete_data.length; i++){
				pet_id = 'pet_id_'+ _complete_data[i].pet_id +'';
				pet_url = _complete_data[i].details_url;

				pet_location = _complete_data[i].addr_city;

				pet_name = _complete_data[i].pet_name;
				// pet_name = _complete_data[i].pet_name.split(' ')[0];
				// pet_name = pet_name.split('-')[0];
				// pet_name = pet_name.split('.')[0];
				// pet_name = pet_name.split(',')[0];

				pet_age = _complete_data[i].age;

				pet_photo = _complete_data[i].preview_image[0];
				pet_photo_w = ''+ _complete_data[i].preview_image[1] +'px';
				pet_photo_h = ''+ _complete_data[i].preview_image[2] +'px';

				pet_sex = _complete_data[i].sex;

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


	// utility function to check if value is in array
	function isInArray(value, array) {
  		return array.indexOf(value) > -1;
	}

	// utility function to remove array items
	function removeArrayItem(array, item){
		for (var i in array){
			if (array[i] == item){
				array.splice(i, 1);
				break;
			}
		}
	}

	// takes a string and replaces it with a sortable array
	var returnColors = function(string){
		switch(string){
			// dog colors
			case 'black':
				color = ['black'];
				return color;
				break;
			case 'black - with brown, red, golden, orange or chestnut':
				color = ['black', 'brown', 'red', 'golden', 'orange', 'chestnut'];
				return color;
				break;
			case 'black - with gray or silver':
				color = ['black', 'gray', 'silver'];
				return color;
				break;
			case 'black - with tan, yellow or fawn':
				color = ['black', 'tan', 'yellow', 'fawn'];
				return color;
				break;
			case 'black - with white':
				color = ['black', 'white'];
				return color;
				break;
			case 'brindle':
				color = ['brindle'];
				return color;
				break;
			case 'brindle - with white':
				color = ['brindle', 'white'];
				return color;
				break;
			case 'brown/chocolate':
				color = ['brown', 'chocolate'];
				return color;
				break;
			case 'brown/chocolate - with black':
				color = ['brown', 'chocolate', 'black'];
				return color;
				break;
			case 'brown/chocolate - with tan':
				color = ['brown', 'chocolate', 'tan'];
				return color;
				break;
			case 'brown/chocolate - with white':
				color = ['brown', 'chocolate', 'white'];
				return color;
				break;
			case 'gray/blue/silver/salt & pepper':
				color = ['gray', 'blue', 'silver', 'salt pepper'];
				return color;
				break;
			case 'gray/silver/salt & pepper - with white':
				color = ['gray', 'silver', 'salt pepper', 'white'];
				return color;
				break;
			case 'merle':
				color = ['merle'];
				return color;
				break;
			case 'red/golden/orange/chestnut':
				color = ['red', 'golden', 'orange', 'chestnut'];
				return color;
				break;
			case 'red/golden/orange/chestnut - with black':
				color = ['red', 'golden', 'orange', 'chestnut', 'black'];
				return color;
				break;
			case 'red/golden/orange/chestnut - with white':
				color = ['red', 'golden', 'orange', 'chestnut', 'white'];
				return color;
				break;
			case 'silver & tan (yorkie colors)':
				color = ['silver', 'tan'];
				return color;
				break;
			case 'tan/yellow/fawn':
				color = ['tan', 'yellow', 'fawn'];
				return color;
				break;
			case 'tan/yellow/fawn - with black':
				color = ['tan', 'yellow', 'fawn', 'black'];
				return color;
				break;
			case 'tan/yellow/fawn - with white':
				color = ['tan', 'yellow', 'fawn', 'white'];
				return color;
				break;
			case 'tricolor (tan/brown & black & white)':
				color = ['tan', 'brown', 'black', 'white'];
				return color;
				break;
			case 'white':
				color = ['white'];
				return color;
				break;
			case 'white - with black':
				color = ['white', 'black'];
				return color;
				break;
			case 'white - with brown or chocolate':
				color = ['white', 'brown', 'chocolate'];
				return color;
				break;
			case 'white - with gray or silver':
				color = ['white', 'gray', 'silver'];
				return color;
				break;
			case 'white - with red, golden, orange or chestnut':
				color = ['white', 'red', 'golden', 'orange', 'chestnut'];
				return color;
				break;
			case 'white - with tan, yellow or fawn':
				color = ['white', 'tan', 'yellow', 'fawn'];
				return color;
				break;
			// cat colors
			case 'black & white or tuxedo':
				color = ['black', 'white', 'tuxedo'];
				return color;
				break;
			case 'black (all)':
				color = ['black'];
				return color;
				break;
			case 'black (mostly)':
				color = ['black'];
				return color;
				break;
			case 'brown tabby':
				color = ['brown'];
				return color;
				break;
			case 'brown or chocolate':
				color = ['brown', 'chocolate'];
				return color;
				break;
			case 'brown or chocolate (mostly)':
				color = ['brown', 'chocolate'];
				return color;
				break;
			case 'calico or dilute calico':
				color = ['calico'];
				return color;
				break;
			case 'cream or ivory':
				color = ['cream', 'ivory'];
				return color;
				break;
			case 'cream or ivory (mostly)':
				color = ['cream', 'ivory'];
				return color;
				break;
			case 'gray or blue':
				color = ['gray', 'blue'];
				return color;
				break;
			case 'gray or blue (mostly)':
				color = ['gray', 'blue'];
				return color;
				break;
			case 'gray, blue or silver tabby':
				color = ['gray', 'blue', 'silver', 'tabby'];
				return color;
				break;
			case 'orange or red':
				color = ['orange', 'red'];
				return color;
				break;
			case 'orange or red (mostly)':
				color = ['orange', 'red'];
				return color;
				break;
			case 'orange or red tabby':
				color = ['orange', 'red', 'tabby'];
				return color;
				break;
			case 'spotted tabby/leopard spotted':
				color = ['tabby', 'leopard'];
				return color;
				break;
			case 'tan or fawn':
				color = ['tan', 'fawn'];
				return color;
				break;
			case 'tan or fawn (mostly)':
				color = ['tan', 'fawn'];
				return color;
				break;
			case 'tan or fawn tabby':
				color = ['tan', 'fawn', 'tabby'];
				return color;
				break;
			case 'tiger striped':
				color = ['striped'];
				return color;
				break;
			case 'tortoiseshell':
				color = ['tortoiseshell'];
				return color;
				break;
			case 'white (mostly)':
				color = ['white'];
				return color;
				break;

			default:
				color = [];
				break;
		}
	}

	
	// init application
	initApp();

})(jQuery);
