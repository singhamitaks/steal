steal({src: "./less_engine.js",ignore: true}, function(){

	// Some monkey patching of the LESS AST
	// For our builds we NEVER want the parser to add paths to any URL
	// The original implementation used to append the current path
	// when running in Rhino
	less.tree.URL = function (val, paths) {
		if (val.data) {
			this.attrs = val;
		} else {
			this.value = val;
			this.paths = paths;
		}
	};
	less.tree.URL.prototype = {
		toCSS: function () {
			return "url(" + (this.attrs ? 'data:' + this.attrs.mime + this.attrs.charset + this.attrs.base64 + this.attrs.data
				: this.value.toCSS()) + ")";
		},
		eval: function (ctx) {
			return this.attrs ? this : new(less.tree.URL)(this.value.eval(ctx), this.paths);
		}
	};

	/**
	 * @page steal.less Less
	 * @parent steal.static.type
	 * @plugin steal/less
	 * <p>Lets you build and compile [http://lesscss.org/ Less ] css styles.</p>
	 * <p>Less is an extension of CSS that adds variables, mixins, and quite a bit more.
	 * You can write css like:
	 * </p>
	 * @codestart css
	 * @@brand_color: #4D926F;
	 * #header {
	 *   color: @@brand_color;
	 * }
	 * h2 {
	 *   color: @@brand_color;
	 * }
	 * @codeend
	 * <h2>Use</h2>
	 * <p>First, create a less file like:</p>
	 * @codestart css
	 * @@my_color red
	 * 
	 * body { color:  @@my_color; }
	 * @codeend
	 * 
	 * Save this in a file named <code>red.less</code>.
	 * 
	 * Next, steal the <code>steal/less</code> plugin, wait for it to finish loading
	 * (by using [steal.static.then then]) and then load the less file:
	 * 
	 * @codestart
	 * steal('steal/less').then('./red.less');
	 * @codeend
	 *
	 * Loads Less files relative to the current file.  It's expected that all
	 * Less files end with <code>less</code>.
	 * 
	 */
	steal.type("less css", function(options, success, error){
		var pathParts = options.src.split('/');
		pathParts[pathParts.length - 1] = ''; // Remove filename

		new (less.Parser)({
            optimization: less.optimization,
            paths: [pathParts.join('/')]
        }).parse(options.text, function (e, root) {
			options.text = root.toCSS();
			success();
		});
	});
})
