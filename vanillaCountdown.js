(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['axios'], factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory(require('axios'));
	} else {
		root.vannilaCountdown = factory(root, root.axios); // @todo rename plugin
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {
	'use strict';

	//////////////////////////////
	// Variables
	//////////////////////////////

	var vannilaCountdown = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings;
	var counter;
	var expireAt;

	// Default settings
	var defaults = {
		autostart: true, // start the countdown automatically
		seconds: 600, // the number of seconds to count down
		offset: 0,
		checkTimeUrl: false,
		checkTimeIntervalSeconds: 30,
		checkTimeCallBack: function () { },
		expireAtTimestamp: false,
		onCompleteCallBack: function () { },
		countdownTimeId: 'countdown',
		countdownProgressId: 'countdownProgress',
		countdownProgressContainerId: 'countdownProgressContainer',
		partTwo: false,
		partTwoSeconds: 220,
		partTwoClass: 'text-danger',
		partTwoClassContainer: 'danger',
		partTwoClassProgress: 'bg-danger',
		partTwoCallBack: function () { },
		callbackBefore: function () { },
		callbackAfter: function () { }
	};

	//////////////////////////////
	// Private Functions
	//////////////////////////////

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	function forEach(collection, callback, scope) {
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
	}

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	function extend(defaults, options) {
		var extended = {};

		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});

		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});

		return extended;
	}

	function calculateCount() {
		var now = new Date();
		var nowMS = now.getTime();
		var currentMS = expireAt.getTime() - nowMS - settings.offset;
		return Math.floor((currentMS / 1000));
	}

	// Timer Functie
	function timer() {
		var count = calculateCount();
		if (settings.checkTimeUrl) {
			if (count == 60 || count == 10) {
				vannilaCountdown.checkStartTime(settings.checkTimeUrl, count);
			}
		}

		var elementCountdownProgressContainer = document.getElementById(settings.countdownProgressContainerId);
		var elementCountdownProgress = document.getElementById(settings.countdownProgressId);
		var elementCountdownTime = document.getElementById(settings.countdownTimeId);
		var countdownProgressContainerIdElement = document.getElementById(settings.countdownProgressContainerId);
		var countdownProgressIdElement = document.getElementById(settings.countdownProgressId);
		var countdownTimeIdElement = document.getElementById(settings.countdownTimeId);

		var progress = (-((100 / settings.seconds) * count) + 100);
		var sec = count % 60;
		var min = Math.floor(count / 60);
		min %= 60;

		if (typeof (elementCountdownTime) != 'undefined' && elementCountdownTime != null) {
			elementCountdownTime.innerHTML = ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
		}

		if (typeof (elementCountdownProgress) != 'undefined' && elementCountdownProgress != null) {
			elementCountdownProgress.style.width = ((98.5) - progress) + '%';
		}

		if (settings.partTwo) {
			if (count == settings.partTwoSeconds) {
				if (settings.partTwoClassContainer) {
					if (typeof (elementCountdownProgressContainer) != 'undefined' && elementCountdownProgressContainer != null) {
						elementCountdownProgressContainer.classList.add(settings.partTwoClassContainer);
					}
				}
				if (settings.partTwoClassProgress) {
					if (typeof (elementCountdownProgress) != 'undefined' && elementCountdownProgress != null) {
						elementCountdownProgress.classList.add(settings.partTwoClassProgress);
					}
				}
				if (settings.partTwoClass) {
					if (typeof (elementCountdownTime) != 'undefined' && elementCountdownTime != null) {
						elementCountdownTime.classList.add(settings.partTwoClass);
					}
				}
				settings.partTwoCallBack();
			} else {
				if (count > settings.partTwoSeconds && count % 30 == 0) {
					if (settings.partTwoClassContainer) {
						if (typeof (countdownProgressContainerIdElement) != 'undefined' && countdownProgressContainerIdElement != null) {
							countdownProgressContainerIdElement.classList.remove(settings.partTwoClassContainer);
						}
					}
					if (settings.partTwoClassProgress) {
						if (typeof (countdownProgressIdElement) != 'undefined' && countdownProgressIdElement != null) {
							countdownProgressIdElement.classList.remove(settings.partTwoClassProgress);
						}
					}
					if (settings.partTwoClass) {
						if (typeof (countdownTimeIdElement) != 'undefined' && countdownTimeIdElement != null) {
							countdownTimeIdElement.classList.remove(settings.partTwoClass);
						}
					}
				}
			}
		}

		if (count <= 0) {
			clearInterval(counter);
			settings.onCompleteCallBack();
			return;
		}
	}

	//////////////////////////////
	// Public APIs
	//////////////////////////////

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	vannilaCountdown.checkIfInPart2 = function () {
		if (settings.partTwo) {
			var count = calculateCount();
			if (count <= settings.partTwoSeconds) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	vannilaCountdown.checkStartTime = function (checkTimeUrl) {
		var axios = require('axios');
		axios.get(checkTimeUrl)
			.then(function (response) {
				if (response.data != false) {
					var d = new Date();
					d.setTime(response.data.expireAtTimestamp * 1000);
					expireAt = d;
					settings.checkTimeCallBack();
				}
			});
	};


	/**
	 * Destroy the current initialization.
	 * @public
	 */
	vannilaCountdown.destroy = function () {

		// If plugin isn't already initialized, stop
		if (!settings) return;

		// Remove init class for conditional CSS
		// document.documentElement.classList.remove( settings.initClass );

		// @todo Undo any other init functions...

		// Remove event listeners
		// document.removeEventListener('click', eventHandler, false);

		// Reset variables
		settings = null;
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	vannilaCountdown.init = function (options) {
		// Feature test
		if (!supports) return;

		// Destroy any existing initializations
		vannilaCountdown.destroy();

		// Merge user options with defaults
		settings = extend(defaults, options || {});

		if (settings.checkTimeIntervalSeconds >= settings.seconds) {
			settings.checkTimeIntervalSeconds = Math.ceil((settings.seconds / 2));
		}

		if (settings.autostart) {
			vannilaCountdown.start();
		}
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	vannilaCountdown.start = function () {
		expireAt = new Date();

		if (settings.expireAtTimestamp) {
			expireAt.setTime(settings.expireAtTimestamp * 1000);
		}
		counter = setInterval(timer, 1000);

		if (settings.checkTimeUrl) {
			setInterval(function () {
				vannilaCountdown.checkStartTime(settings.checkTimeUrl);
			}, (settings.checkTimeIntervalSeconds * 1000));
		}

	};



	return vannilaCountdown;
});
