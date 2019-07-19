var wgt = null;
var wgtCurrentScript = document.currentScript;

document.addEventListener("DOMContentLoaded", function() {
	
	wgt = (function(window, document) {
		const win = window,
					doc = document,
					head = doc.querySelector('head'),
					widgetTarget = doc.querySelector('a[data-wgt-do]'),
					widgetTargetContainer = widgetTarget.parentNode,
					widgetTargetKey = widgetTarget.getAttribute('data-wgt-key'),
					widgetTargetQuantity = widgetTarget.getAttribute('data-wgt-quantity'),
					pathArray = wgtCurrentScript.src.split( '/' ),
					protocol = pathArray[0],
					host = pathArray[2],
					baseUrl = protocol + '//' + host,
					app = {};
			
		let getLimit = widgetTargetQuantity, 
				getOffset = 0,
				throttled = false,
				widgetContainerWidth = widgetTargetContainer.offsetWidth;

		// variables for dinamic added data, see function addAsyncValToVariables()
		let wgt = null,
				containerMultiWgt = null,
				multiWgt = null,
				popup = null,
				popupBtn = null,
				popupCloseBtn = null,
				popupOverlay = null,
				addMoreItemsBtn = null,
				itemsData = null,
				newItemsData = null,
				globOffset = 0,
				msnry = null,
				isShowAddMoreBtn = null;

		app.settings = {
			"pathToStyle": `${baseUrl}/css/wgt.min.css`,
			"pathToMasonry": 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.js',
			"pathToGoogleMap": 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBNt2FsPs3u7nkz3iE4tvMnXw5mcQGjsjg',
		};

		class Wgtapi {
			constructor() {
				this._baseUrl = 'https://api.dev.vouch4.me/v1/widget'; 
			}

			getResource(url) {
				return fetch(
					url,
					{
						method: 'GET',
						headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
						}
					}
				)
				.then(res => res.json());
			}

			getData(limit = 20, offset = 0) {
				let url = `${this._baseUrl}/${widgetTargetKey}?limit=${limit}&offset=${offset}`;
				return this.getResource(url);
			}
		};

		const wgtapi = new Wgtapi();

		const fn = {
			addAsyncValToVariables() {
				wgt = doc.querySelector('.wgt');
				containerMultiWgt = doc.querySelector('.container-multi-wgt-in-row');
				multiWgt = doc.querySelector('.container-multi-wgt-in-row .wgt-item');
				popup = doc.querySelector('.wgt-popup');
				popupBtn = doc.querySelector('.wgt-btn-popup-open');
				popupCloseBtn = doc.querySelector('.wgt-close-modal');
				popupOverlay = doc.querySelector('.wgt-overlay');
				addMoreItemsBtn = doc.querySelector('.wgt-add-more-btn');			
			},

			getItemsData(callback, limit = 20, offset = 0) {
				wgtapi.getData(limit, offset)
					.then(res => {
						itemsData = res.data;

						globOffset += offset;
						getOffset = Number(getLimit);

						isShowAddMoreBtn = !(res.data.length < limit);
					})
					.then(() => {
						callback();
					});
			},

			getNewItemsData(callback, limit = 20, offset = 0) {
				wgtapi.getData(limit, offset)
					.then(res => {
						newItemsData = res.data;
						itemsData = [...itemsData, ...res.data];
						
						globOffset += Number(limit);
						getOffset += Number(getLimit);

						if (res.data.length < limit) {
							addMoreItemsBtn.classList.add('hide');
						}
					})
					.then(() => {
						callback();
					});
			},

			isSmallContainerWidth() {
				return widgetContainerWidth <= 576;
			},

			createStyle(path, callback) {
				let link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = path;

				link.onload = function() {
					callback();
				};

				return link;
			},		

			createScript(path, callback) {
				let script = document.createElement('script');
				script.src = path;
				script.type = "text/javascript";

				script.onload = function() {
					callback();
				};				

				return script;
			},

			appendTagToHead(tag) {
				head.appendChild(tag);
			},

			handleLayout(callback) {
				let parent = doc.createElement("div");
				parent.innerHTML = parent.innerHTML += fn.HTMLWgtLayout();
				widgetTarget.replaceWith(parent);

				let parentImages = parent.querySelectorAll('.wgt-item-header__img');

				fn.onImagesLoaded(parentImages, callback);
			},

			onImagesLoaded(images, callback) {
				let len = images.length,
						counter = 0;

				[].forEach.call( images, function( img ) {
					img.addEventListener( 'load', incrementCounter, false );
				});

				function incrementCounter() {
					counter++;
					if ( counter === len ) {
						callback();
					}
				};	
			},

			addItemsToLayout(items) {
				let containerEl = doc.createElement("div"); 
				containerEl.innerHTML = containerEl.innerHTML += fn.HTMLWgtItem(items);
				containerMultiWgt.appendChild( containerEl );

				let columnClass = fn.setMsnryColumnWidth(widgetContainerWidth);
				fn.setClassToWgtItems(columnClass);						

				msnry.appended( containerEl );
				
				let parentImages = containerEl.querySelectorAll('.wgt-item-header__img');
				
				fn.onImagesLoaded(parentImages, function() {
					msnry.layout();
				});
			},

			handleLayoutPopupLayout(id) {
				popup.innerHTML = fn.HTMLWgtPopup(id);
				if ( !itemsData[id].content._geoloc ) return;
				fn.initGoogleMapInPopup(itemsData[id].content._geoloc[0]);
			},

			initGoogleMapInPopup(data) {
				let mapDiv = document.querySelector('.wgt-map'),
						mapData = data,
						center = { lat: Number(mapData.lat), lng: Number(mapData.lng) },
						zoom = 8;


				let map = new google.maps.Map(mapDiv, {
					center: center,
					zoom: zoom,
				});

				new google.maps.Marker({
					position: center, 
					map: map,
				}); 
			},

			HTMLWgtLayout() {
				return `
					<div class="wgt">
						${fn.HTMLWgtHeaderForMobile()}
						<div class="container-multi-wgt-in-row">					
							${fn.HTMLWgtHelpersItemsClassElems()}
							${fn.HTMLWgtGuttersSizer()}

							${fn.HTMLWgtItem(itemsData)}
						</div>
						${fn.HTMLWgtAddMoreItemsBtn()}
						${fn.HTMLWgtOverlay()}
						<div class="wgt-popup">
							${fn.HTMLWgtPopup(0)}
						</div>
					</div>
				`;
			},

			HTMLWgtHelpersItemsClassElems() {
				return `
					<div class="wgt-item--one-in-row"></div>
					<div class="wgt-item--two-in-row"></div>
					<div class="wgt-item--three-in-row"></div>
					<div class="wgt-item--four-in-row"></div>
				`;
			},

			HTMLWgtGuttersSizer() {
				return `
					<div class="wgt-item--one-in-row-gutter"></div>
					<div class="wgt-item--two-in-row-gutter"></div>
					<div class="wgt-item--three-in-row-gutter"></div>
					<div class="wgt-item--four-in-row-gutter"></div>
				`;
			},

			HTMLWgtHeaderForMobile() {
				let hiddenClass = '';
				if (widgetContainerWidth > 576) {
					hiddenClass = 'wgt--mobile';
				} 
				return `
					<header class="wgt-header wgt-header--one-in-row ${hiddenClass}">
						<a class="wgt-header__link" href="#">
							<img class="wgt-header__img" src="${baseUrl}/img/vouch-icon.jpg" alt="">
						</a>
						<div class="wgt-header__text">
							<div class="wgt-header__title">Vouch</div>
							<div class="wgt-header__subtitle">Official reviews</div>
						</div>
					</header>	
				`;
			},

			HTMLWgtItem(items) {	
				const result = items.map((el, idx) => {
					const { content, linkeeProfile, linkerProfile, humanTime } = el;
					const fullName = linkeeProfile.firstName + ' ' + linkeeProfile.lastName;
					const footerFullName = linkerProfile.firstName + ' ' + linkerProfile.lastName;

					return `
						<div class="wgt-item" data-id=${idx + globOffset}>
							<header class="wgt-item-header">
								<img src="${content.coverPic}" alt="" class="wgt-item-header__img">
								<div class="wgt-item-header__avatar-wrap">
									<img src="${linkeeProfile.profilePic}" alt="" class="wgt-item__avatar">
									<div class="wgt-item-header__name">${fullName}</div>
								</div>
								<div class="wgt-item-header__descr">${content.title}</div>
							</header>
				
							<footer class="wgt-item-footer">
								<div class="wgt-item-footer__descr">
									${content.questions[5].answer}
								</div>   
								
								<div class="wgt-item-footer__time-wrap">
									<div class="wgt-item-footer__by">Vouched by:</div>
									<time class="wgt-item-footer__time">${humanTime}</time>
								</div>
				
								<div class="wgt-item-footer__rating">
									<div class="wgt-item-header__avatar-wrap">
										<img src="${linkerProfile.profilePic}" alt="" class="wgt-item__avatar">
										<div class="wget-rating-wrapper">
											<div class="wgt-item-header__name">${footerFullName}</div>
											<div class="wget-rating">
												${fn.HTMLWgtStars(content.questions[6].answer)}
											</div>
										</div>
									</div>
								</div>
							</footer>
				
							<button class="wgt-btn-popup-open"></button>
						</div>
					`;
				});

				return result.join('');
			},

			HTMLWgtStars(quantity) {
				let stars = '';
				for(let i = 0 ; i < quantity; i++) {
					stars += `<span class="wget-rating__item">&starf;</span>`;
				} 
				return stars;
			},

			HTMLWgtAddMoreItemsBtn() {
				return isShowAddMoreBtn ?
					`<button class="wgt-add-more-btn">Show more</button>` :
					`<button class="wgt-add-more-btn hide">Show more</button>`;
			},

			HTMLWgtOverlay() {
				return `<div class="wgt-overlay"></div>`
			},

			HTMLWgtQuestionPoint(points) {
				const result = points.map((point) => {

					if ( point.text === "Any extra comments" || point.text === "rating" || point.answer === '' ) {
						return;
					}

					return `
						<div class="wgt-point">
							<div class="wgt-point__text">${point.text}</div>
							<div class="wgt-point__label">${point.answer}</div>
						</div>
					`
				});

				return result.join('');
			},

			HTMLWgtPopupTags(content) {
				if (!content.tags) return '';

				return `
				<div class="wgt-tags">
					<div class="wgt-title">Tags</div>
					<div class="wgt-tags-wrapper">
						${fn.HTMLWgtTag(content.tags)}
					</div>
				</div>   
				`;
			},

			HTMLWgtTag(tags) {
				const result = tags.map((tag) => {
					return `<div class="wgt-tag">${tag}</div>`;
				});
				return result.join('');
			},

			HTMLWgtLocation(content) {
				if ( !content._geoloc ) return '';

				return `
					<div class="wgt-location">
						<div class="wgt-title">Location</div>
						<div class="wgt-map"></div>
					</div>
				`;
			},

			HTMLWgtPopup(id) {
				const currentElement = itemsData[id];
				const { content, linkeeProfile, linkerProfile } = currentElement;
				const fullName = linkeeProfile.firstName + ' ' + linkeeProfile.lastName;
				const footerFullName = linkerProfile.firstName + ' ' + linkerProfile.lastName;
							
				return `
					<div class="wgt-modal">
						<header class="wgt-item-header">
							<img src="${content.coverPic}" alt="" class="wgt-item-header__img">
							<div class="wgt-item-header__avatar-wrap">
								<img src="${linkeeProfile.profilePic}" alt="" class="wgt-item__avatar">
								<div class="wgt-item-header__name">${fullName}</div>
							</div>
							<div class="wgt-item-header__descr">${content.title}</div>
						</header>
						
						<article class="wgt-article">
							<header class="wgt-article-header">
								<div class="wgt-item-footer__rating">
									<div class="wgt-item-header__avatar-wrap">
										<img src="${linkerProfile.profilePic}" alt="" class="wgt-item__avatar">
										<div class="wget-rating-wrapper">
											<div class="wgt-item-header__name">${footerFullName}</div>
											<div class="wget-rating">
												${fn.HTMLWgtStars(content.questions[6].answer)}
											</div>
										</div>
									</div>
								</div>
							</header>
			
							<div class="wgt-article-text">
								<div class="wgt-article__descr">
									${content.questions[5].answer}
								</div>
			
								${ fn.HTMLWgtQuestionPoint(content.questions) }
								
							</div>
										
							${ fn.HTMLWgtLocation(content) }          
							${ fn.HTMLWgtPopupTags(content) }          
						</article>
			
						<button class="wgt-close-modal">
							<span class="wgt-close-modal__text">Back</span>
						</button>
					</div>
				`;
			},

			setMsnryColumnWidth(widgetContainerWidth) {
				if (widgetContainerWidth < 576) {
					return 'wgt-item--one-in-row';
				} else if (widgetContainerWidth < 768) {
					return 'wgt-item--two-in-row';
				} else if (widgetContainerWidth < 992) {
					return 'wgt-item--three-in-row';
				} else if (widgetContainerWidth < 1200) {
					return 'wgt-item--four-in-row';
				} else {
					return 'wgt-item--four-in-row';
				}
			},

			setMsnryGutterWidth(widgetContainerWidth) {
				if (widgetContainerWidth < 576) {
					return '.wgt-item--one-in-row-gutter';
				} else if (widgetContainerWidth < 768) {
					return '.wgt-item--two-in-row-gutter';
				} else if (widgetContainerWidth < 992) {
					return '.wgt-item--three-in-row-gutter';
				} else if (widgetContainerWidth < 1200) {
					return '.wgt-item--four-in-row-gutter';
				} else {
					return '.wgt-item--four-in-row-gutter';
				}
			},

			setClassToWgtItems(className) {
				let wgtElems = doc.querySelectorAll('.wgt-item:not(.wgt-item--one-in-row):not(.wgt-item--two-in-row):not(.wgt-item--three-in-row):not(.wgt-item--four-in-row)');

				for(let i = 0; i < wgtElems.length; i++) {
					wgtElems[i].classList.add(className);
				}
			},

			updateClassToWgtItems(className) {
				let wgtElems = doc.querySelectorAll('.wgt-item');

				for(let i = 0; i < wgtElems.length; i++) {
					wgtElems[i].className = 'wgt-item';
					wgtElems[i].classList.add(className);
				}
			},

			initMasonry() {
				let columnClass = fn.setMsnryColumnWidth(widgetContainerWidth);
				let gutterClass = fn.setMsnryGutterWidth(widgetContainerWidth);		
				fn.setClassToWgtItems(columnClass);				

				msnry = new Masonry( containerMultiWgt, {
					// options
					itemSelector: '.wgt-item',
					columnWidth: '.' + columnClass,
					percentPosition: true,
					gutter: gutterClass
				});
			},

			updateMasonry() {
				let columnClass = fn.setMsnryColumnWidth(widgetContainerWidth);
				let gutterClass = fn.setMsnryGutterWidth(widgetContainerWidth);								
				fn.updateClassToWgtItems(columnClass);		

				msnry.destroy(); // destroy
				msnry = new Masonry( containerMultiWgt, {
					// options
					itemSelector: '.wgt-item',
					columnWidth: '.' + columnClass,
					percentPosition: true,
					gutter: gutterClass
				});
			},

			addStyleToHead(callback) {
				fn.appendTagToHead(fn.createStyle(app.settings.pathToStyle, callback));
			},
			
			addScriptToHead(callback) {
				fn.appendTagToHead(fn.createScript(app.settings.pathToMasonry, callback));
			},

			addGoogleMapsScriptToHead(callback) {
				fn.appendTagToHead(fn.createScript(app.settings.pathToGoogleMap, callback));
			},

			togglePopup() {
				popup.classList.toggle('open');
				popupOverlay.classList.toggle('open');
			},

			closePopup() {
				popup.classList.remove('open');
				popupOverlay.classList.remove('open');
			},

			onPopupBtnClick() {
				wgt.addEventListener('click', function(e) {
					let target = e.target;

					if(target.classList.contains('wgt-btn-popup-open')) {
						const id = target.closest('.wgt-item').getAttribute('data-id');
						fn.handleLayoutPopupLayout(id);
						fn.togglePopup();
					}
				})
			},	
			
			onPopupCloseBtnClick() {
				wgt.addEventListener('click', function(e) {
					let target = e.target;
					
					if(target.classList.contains('wgt-close-modal')) {
						fn.closePopup();
					}

					let closeBtn = target.closest('.wgt-close-modal');
					if ( !closeBtn ) return;
					fn.closePopup();

				});
			},

			onPopupOverlayClick() {
				popupOverlay.addEventListener('click', function() {
					fn.closePopup();
				});
			},

			onAddMoreItemsBtnClick(callback) {
				addMoreItemsBtn.addEventListener('click', function() {
					fn.getNewItemsData(callback, getLimit, getOffset);
				});
			},

			onWindowresize() {
				win.addEventListener('resize', function() {
					widgetContainerWidth = widgetTargetContainer.offsetWidth;

					if (!throttled) {

						fn.updateMasonry();

						throttled = true;
						
						setTimeout(function() {
							throttled = false;
						}, 500);
					}
				});
			},

			domReady() {
				fn.addAsyncValToVariables();		
				fn.initMasonry();

				fn.onPopupBtnClick();
				fn.onPopupCloseBtnClick();
				fn.onPopupOverlayClick();
				fn.onAddMoreItemsBtnClick(
					function(){
						fn.addItemsToLayout(newItemsData)
					}
				);
				fn.onWindowresize();
			},
		};

		fn.addStyleToHead(
			function() {
				fn.addScriptToHead(
					function() {
						fn.addGoogleMapsScriptToHead(
							function() {
								fn.getItemsData(
									function() {
										fn.handleLayout(
											fn.domReady
										);
									}, 
									getLimit, 
									getOffset
								)
							}
						)
					}
				)
			}
		);
		
		return fn;

	})(window, document);
});