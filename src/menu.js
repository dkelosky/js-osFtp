define(function (require, exports, module) {
    'use strict';


  /**
   * Bracket modules
   */
  var Menus = brackets.getModule('command/Menus');


  /**
   * Extension modules
   */
  var osFtpCommon   = require('src/common');


  /**
   * Exported functions
   */
  exports.addToContextMenus       = addToContextMenus;
  exports.removeFromContextMenus  = removeFromContextMenus;


  /**
   * Register a command and add to the two context menus
   * @param {String}   id             Base id for this command
   * @param {Boolean}  addMenuDivider Indicator of whether or not a menu divider should be added
   * @param {String}   afterId        Previouslly added menu where we want to place the new item after
   * @param {Boolean}  before         Indicator of whether or not a menu divider should be added before or after
   */
  function addToContextMenus(id, addMenuDivider, afterId, before) {

    //function vars
    var contextMenu;

    //get menu item for working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);

    //add menu divider if requested
    if (addMenuDivider)
      contextMenu.addMenuDivider();

    //add menu item for working set
    addContextMenuItem(contextMenu, id, afterId, before);


    /**
     * Add to project set
     */

    //get menu item for project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

    //add menu divider if requested
    if (addMenuDivider)
      contextMenu.addMenuDivider();

    //add menu item for project set
    addContextMenuItem(contextMenu, id, afterId, before);

  }

  /**
   * Add an item to a context menu
   * @param {Object}  contextMenu Project or working set context menu object
   * @param {String}  id          Identifier of command to be added
   * @param {String}  afterId     Id where the menu item will be added after
   * @param {Boolean} before      Indicator of whether or not a menu divider should be added before or after
   */
  function addContextMenuItem(contextMenu, id, afterId, before) {

    //assume position is after
    var position = Menus.AFTER;

    //if before alter position
    if (before)
      position = Menus.BEFORE;

    //if we don't have an afterId
    if (!osFtpCommon.isSet(afterId)) {

      //add to menu with defaults
      contextMenu.addMenuItem(id);

      //else we were given an afterId
    } else {

      //add to menu after afterId
      contextMenu.addMenuItem(
        id,               //new id
        null,             //no key binding
        position,         //position
        afterId  //after this id
      );
    }

  }


  /**
   * Remove items from the context menu
   * @param {String} id Id to remove from the context menu
   */
  function removeFromContextMenus(id) {

    //function vars
    var contextMenu;

    //remove from the working set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_CONTEXT_MENU);
    contextMenu.removeMenuItem(id);

    //remove from the project set
    contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.removeMenuItem(id);

  }


});
