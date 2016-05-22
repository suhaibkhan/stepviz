module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*!\n' +
        ' * <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("dd-mm-yyyy") %>)\n' +
        ' * <%= pkg.homepage %>\n' +
        ' * <%= pkg.license %> licensed\n\n' +
        ' * Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>, <%= pkg.author.url %>\n' +
        ' */'
    },
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: [
          'src/stepviz.js', 'src/config.js', 'src/core/core.js',
          'src/core/*.js', '!src/core/polyfills.js', 'src/**/*.js',
          'src/core/polyfills.js'
        ],
        dest: 'dist/stepviz.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/stepviz.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'samples/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    sass: {
      options: {
        sourcemap: 'none'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'styles',
          src: ['*.scss'],
          dest: 'dist',
          ext: '.css'
        }]
      }
    },
    usebanner: {
      options: {
        position: 'top',
        banner: '<%= meta.banner %>',
        linebreak: true
      },
      dist: {
        files: {
          src: ['dist/*.js', 'dist/*.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-banner');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass', 'usebanner']);

};
