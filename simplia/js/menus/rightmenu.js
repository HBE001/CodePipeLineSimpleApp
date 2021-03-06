/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * � 2010-2015 Lotus Interworks Inc. (�LIW�) Proprietary and Trade Secret.
 * Do not copy distribute or otherwise use without explicit written permission from B. Gopinath President.
 * Do not communicate or share the information contained herein with any one else except employees of LIW  on a need to know basis.
 * LIW values its intellectual properties and excepts all those who work with LIW to protect all work, including ideas, designs, processes,
 * software and documents shared or created in any engagement with LIW as proprietary to LIW.
 * This document may make references to open sourced software being considered or used by LIW.
 * Extensions, including modifications to such open source software are deemed proprietary and trade secret to LIW  until
 * and unless LIW formally and with explicit written consent contributes specific modified open source code back to open source.
 * In any event, including cases where modified open sourced components are placed in open source, the selection, interconnection,
 * configuration, processes, designs, implementation of all technology, including opens source software,
 * that is being developed or is part of LIW deployed systems are proprietary and trade secret to LIW and
 * such information shall not be shared with any one else except employees of LIW on a need to know basis.
 *
 */

function RightMenu(Y, properties) {
    //Calling base constructor
    BasicMenu.call(this, Y);

    if (typeof properties === "object") {
        $.extend(this, properties);
    }
    this.init();
}

//Inheriting from the base object
RightMenu.prototype = Object.create(BasicMenu.prototype);


RightMenu.prototype.init = function () {
    this.menu.set('bodyContent', '<div class="rightmenu-container"><ul></ul></div>');

    if (this.customMenu == undefined || !this.customMenu) {
        this.Y.one("#" + this.parentPanel.panel.get('id') + " .checklistmenuright").on("click", function () {
            //Ensuring that the right menu option is displayed on top of the parent panel;
            this.menu.set("zIndex", this.parentPanel.panel.get("zIndex") + 1);
            //this.menu.set("padding", '5px 8px 6px 8px');

            this.menu.align("#" + this.parentPanel.panel.get('id') + ' .yui3-widget-bd',
                [this.Y.WidgetPositionAlign.TR, this.Y.WidgetPositionAlign.TR]);

            this.menu.show();
        }, this);
    }


    //Add the close option to all panels
    var that = this;

    /*----------------------------------------------------------*/
    this.addMenuItem("Full Screen", function () {
        that.parentPanel.fullScreen();
    }, true);
    /*----------------------------------------------------------*/
    this.addMenuItem("Small Screen", function () {
        that.parentPanel.smallScreen();
    }, true);
    /*----------------------------------------------------------*/
    this.addMenuItem("Close", function () {
        that.parentPanel.hidePanel();
    }, true);

};

RightMenu.prototype.addMenuItem = function (menuLabel, callback, addToEnd) {
    var ulStr = "<li>" + menuLabel + "</li>";
    var ulElem = $('#' + this.menu.get('id')).find('.rightmenu-container ul');
    var that = this;

    if (typeof addToEnd !== "undefined" && addToEnd) {
        $(ulStr).appendTo(ulElem).each(function () {
            $(this).click(function () {
                that.hideMenu();
                callback();
            });
        });
    }
    else {
        $(ulStr).prependTo(ulElem).each(function () {
            $(this).click(function () {
                that.hideMenu();
                callback();
            });
        });
    }
};

RightMenu.prototype.removeAllMenuItems = function () {
    $('#' + this.menu.get('id')).find('.rightmenu-container ul').html("");
};
