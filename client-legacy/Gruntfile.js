
module.exports = function (grunt) {

    grunt.initConfig({
        dirs: {
            handlebars: 'src/templates'
        },
        // watch list
        watch: {
            handlebars: {
                files: ['<%= handlebars.compile.src %>'],
                tasks: ['handlebars:compile']
            },
            coffee: {
                files: ['test/**/*.coffee','test/**/*.html', 'src/**/*.coffee'],
                tasks: ['coffee', 'mocha_phantomjs']
            },
        },
        coffee: {
            compile: {
                options: {
                    bare: true
                },
                expand: true,
                flatten: false,
                cwd: "test",
                src: ["**/*.coffee"],
                dest: 'test',
                ext: ".js"
            }
        },
        handlebars: {
            compile: {
                options: {
                    amd: false
                },
                src: ["src/templates/**/*.handlebars"],
                dest: "src/js/lib-coco/precompiled.handlebars.js"
            }
        },
        mocha_phantomjs: {
            all: ['test/**/*.html']
        },

      	exec: {
      	    compile_packs: {
      	        command: './scripts/compilepacks.js'
      	    }
      	}
    });

    grunt.registerTask('test', [
      'exec',
      'coffee',
      'mocha_phantomjs',
    ]);

    grunt.registerTask('testWatch', [
      'exec',
      'coffee',
      'mocha_phantomjs',
      'watch'
    ]);

    grunt.registerTask('coffeeW', [
      'coffee',
      'watch'
    ]);

    // Requires the needed plugin
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');

};
