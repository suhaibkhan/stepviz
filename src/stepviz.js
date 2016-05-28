
(function() {

  'use strict';

  // check for dependencies
  if (typeof window.d3 === 'undefined') {
    throw 'd3 library not found.';
  }

  // init namespaces
  /**
   * stepViz Namespace
   *
   * @namespace
   */
  var ns = {
    /**
     * Components Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    components: {},

    /**
     * Constants Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    constants: {},

    /**
     * Configuration Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    config: {},

    /**
     * Utility functions Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    util: {}
  };

  // set as global
  window.stepViz = ns;

}());
