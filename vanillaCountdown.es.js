const vanillaCountdown = {

	settings: null,
	counter: null,
	expireAt: null,

	// Default settings
	defaults: {
		autostart: true, // start the countdown automatically
		seconds: 600, // the number of seconds to count down
		offset: 0,
		checkTimeUrl: false,
		checkTimeIntervalSeconds: 30,
		checkTimeCallBack: function() { },
		expireAtTimestamp: false,
		onCompleteCallBack: function() { },
		countdownTimeId: 'countdown',
		countdownProgressId: 'countdownProgress',
		countdownProgressContainerId: 'countdownProgressContainer',
		partTwo: false,
		partTwoSeconds: 220,
		partTwoClass: 'text-danger',
		partTwoClassContainer: 'danger',
		partTwoClassProgress: 'bg-danger',
		partTwoCallBack: function() { },
		callbackBefore: function() { },
		callbackAfter: function() { }
	},

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	forEach: function(collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	},

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	extend: function(defaults, options) {
		var extended = {};

		vanillaCountdown.forEach(defaults, function(value, prop) {
			extended[prop] = defaults[prop];
		});

		vanillaCountdown.forEach(options, function(value, prop) {
			extended[prop] = options[prop];
		});

		return extended;
	},

	calculateCount: function() {
		var now = new Date();
		var nowMS = now.getTime();
		var currentMS = vanillaCountdown.expireAt.getTime() - nowMS - vanillaCountdown.settings.offset;
		return Math.floor((currentMS / 1000));
	},

	// Timer Functie
	timer: function() {
		var count = vanillaCountdown.calculateCount();
		if (vanillaCountdown.settings.checkTimeUrl) {
			if (count == 60 || count == 10) {
				vanillaCountdown.checkStartTime(vanillaCountdown.settings.checkTimeUrl, count);
			}
		}

		var elementCountdownProgressContainer = document.getElementById(vanillaCountdown.settings.countdownProgressContainerId);
		var elementCountdownProgress = document.getElementById(vanillaCountdown.settings.countdownProgressId);
		var elementCountdownTime = document.getElementById(vanillaCountdown.settings.countdownTimeId);
		var countdownProgressContainerIdElement = document.getElementById(vanillaCountdown.settings.countdownProgressContainerId);
		var countdownProgressIdElement = document.getElementById(vanillaCountdown.settings.countdownProgressId);
		var countdownTimeIdElement = document.getElementById(vanillaCountdown.settings.countdownTimeId);

		var progress = (-((100 / vanillaCountdown.settings.seconds) * count) + 100);
		var sec = count % 60;
		var min = Math.floor(count / 60);
		min %= 60;

		if (typeof (elementCountdownTime) != 'undefined' && elementCountdownTime != null) {
			elementCountdownTime.innerHTML = ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
		}

		if (typeof (elementCountdownProgress) != 'undefined' && elementCountdownProgress != null) {
			elementCountdownProgress.style.width = ((98.5) - progress) + '%';
		}

		if (vanillaCountdown.settings.partTwo) {
			if (count == vanillaCountdown.settings.partTwoSeconds) {
				if (vanillaCountdown.settings.partTwoClassContainer) {
					if (typeof (elementCountdownProgressContainer) != 'undefined' && elementCountdownProgressContainer != null) {
						elementCountdownProgressContainer.classList.add(vanillaCountdown.settings.partTwoClassContainer);
					}
				}
				if (vanillaCountdown.settings.partTwoClassProgress) {
					if (typeof (elementCountdownProgress) != 'undefined' && elementCountdownProgress != null) {
						elementCountdownProgress.classList.add(vanillaCountdown.settings.partTwoClassProgress);
					}
				}
				if (vanillaCountdown.settings.partTwoClass) {
					if (typeof (elementCountdownTime) != 'undefined' && elementCountdownTime != null) {
						elementCountdownTime.classList.add(vanillaCountdown.settings.partTwoClass);
					}
				}
				vanillaCountdown.settings.partTwoCallBack();
			} else {
				if (count > vanillaCountdown.settings.partTwoSeconds && count % 30 == 0) {
					if (vanillaCountdown.settings.partTwoClassContainer) {
						if (typeof (countdownProgressContainerIdElement) != 'undefined' && countdownProgressContainerIdElement != null) {
							countdownProgressContainerIdElement.classList.remove(vanillaCountdown.settings.partTwoClassContainer);
						}
					}
					if (vanillaCountdown.settings.partTwoClassProgress) {
						if (typeof (countdownProgressIdElement) != 'undefined' && countdownProgressIdElement != null) {
							countdownProgressIdElement.classList.remove(vanillaCountdown.settings.partTwoClassProgress);
						}
					}
					if (vanillaCountdown.settings.partTwoClass) {
						if (typeof (countdownTimeIdElement) != 'undefined' && countdownTimeIdElement != null) {
							countdownTimeIdElement.classList.remove(vanillaCountdown.settings.partTwoClass);
						}
					}
				}
			}
		}

		if (count <= 0) {
			clearInterval(vanillaCountdown.counter);
			vanillaCountdown.settings.onCompleteCallBack();
			return;
		}
	},

	//////////////////////////////
	// Public APIs
	//////////////////////////////

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	checkIfInPart2: function() {
		if (vanillaCountdown.settings.partTwo) {
			var count = vanillaCountdown.calculateCount();
			if (count <= vanillaCountdown.settings.partTwoSeconds) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Check the start time from the server.
	 * @public
	 * @param {string} checkTimeUrl - The URL to fetch the start time from
	 */
	checkStartTime: function(checkTimeUrl) {
		fetch(checkTimeUrl)
			.then(function(response) {
				return response.json();
			})
			.then(function(data) {
				if (data !== false) {
					var d = new Date();
					d.setTime(data.expireAtTimestamp * 1000);
					vanillaCountdown.expireAt = d;
					vanillaCountdown.settings.checkTimeCallBack();
				}
			})
			.catch(function(error) {
				console.error('Error checking start time:', error);
			});
	},


	/**
	 * Destroy the current initialization.
	 * @public
	 */
	destroy: function() {

		// If plugin isn't already initialized, stop
		if (!vanillaCountdown.settings) return;

		// Remove init class for conditional CSS
		// document.documentElement.classList.remove( vanillaCountdown.settings.initClass );

		// @todo Undo any other init functions...

		// Remove event listeners
		// document.removeEventListener('click', eventHandler, false);

		// Reset variables
		settings = null;
	},

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	init: function(options) {

		// Destroy any existing initializations
		vanillaCountdown.destroy();

		// Merge user options with defaults
		vanillaCountdown.settings = vanillaCountdown.extend(vanillaCountdown.defaults, options || {});

		if (vanillaCountdown.settings.checkTimeIntervalSeconds >= vanillaCountdown.settings.seconds) {
			vanillaCountdown.settings.checkTimeIntervalSeconds = Math.ceil((vanillaCountdown.settings.seconds / 2));
		}

		if (vanillaCountdown.settings.autostart) {
			vanillaCountdown.start();
		}
	},

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	start: function() {
		vanillaCountdown.expireAt = new Date();

		if (vanillaCountdown.settings.expireAtTimestamp) {
			vanillaCountdown.expireAt.setTime(vanillaCountdown.settings.expireAtTimestamp * 1000);
		}
		vanillaCountdown.counter = setInterval(vanillaCountdown.timer, 1000);

		if (vanillaCountdown.settings.checkTimeUrl) {
			setInterval(function() {
				vanillaCountdown.checkStartTime(vanillaCountdown.settings.checkTimeUrl);
			}, (vanillaCountdown.settings.checkTimeIntervalSeconds * 1000));
		}

	},

};

export default vanillaCountdown;
