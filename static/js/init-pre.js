// see: https://stackoverflow.com/a/37480521
if (typeof module === 'object') {
	window.module = module;
	window.is_electron_app = true;
	module = undefined;
}
