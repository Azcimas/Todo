var CLIPBOARD = null;
var preventAjax = false;

$(document).on('focusin', '.datepicker', function () {
    $(this).pickadate({
        format: 'yyyy-mm-dd'
    });
});

$(document).on('keydown', 'body', function (e) {
    var cmd = null;

    // console.log(e.type, $.ui.fancytree.eventToString(e));
    switch ($.ui.fancytree.eventToString(e)) {
        case "ctrl+shift+n":
        case "ctrl+shift+m":
        case "meta+shift+n": // mac: cmd+shift+n
            cmd = "addChild";
            break;
        case "ctrl+n":
        case "ctrl+m":
        case "meta+n": // mac
            cmd = "addSibling";
            e.preventDefault();
            break;
    }
    if (cmd) {
        $("#treetable").trigger("nodeCommand", {cmd: cmd});
        // e.preventDefault();
        // e.stopPropagation();
        return false;
    }
});

$(document).on('click', 'div.interested-users > p > span', function () {
    var $this = $(this);
    if (confirm("Czy na pewno chcesz usunąć zainteresowanego?")) {
        $.ajax({
            url: '/task/removeInterested/userId/' + this.id.split('-')[1] + '/taskId/' + $(this).attr('taskId'),
            ok: function (x) {
                var item = x.response;
                if (item.status === true) {
                    $this.hide();
                    $('#userSelect').append('<option value="' + item.userId + '-' + item.taskId + '">' + item.nickname + '</option>');
                } else {
                    info('Coś poszło nie tak :(', 'notok');
                }
            }
        });
    }
});

$(document).on('change', '#userSelect', function () {
    console.log([$(this).val(), $(this).val().split('-')[0]]);
    if ($(this).val() !== '0-0') {
        $.ajax({
            url: '/task/addInterested/userId/' + $(this).val().split('-')[0] + '/taskId/' + $(this).val().split('-')[1],
            ok: function (x) {
                var item = x.response;
                if (item.status === true) {
                    $('div.interested-users > p').append('<span taskId="' + item.taskId + '" id="user-' + item.userId + '">' + item.nickname + ' <i class="fa fa-times"></i>   </span>');
                    $('#userSelect > option[value="' + item.userId + '-' + item.taskId + '"]').hide();
                    $('#userSelect').val('-');
                } else {
                    info('Coś poszło nie tak :(', 'notok');
                }
            }
        });
    }

});



$(document).on('keydown', 'textarea', function (e) {
    if (e.ctrlKey && e.keyCode === 13) {
        $(this).trigger('confirm');
    }
});

$(document).on('click', '#submitButton', function () {
    $('textarea.comment').trigger('confirm');
});

$(document).on('change', '.task-info', function () {
    $(this).trigger('confirm');
});


$(document).on('change', 'input.complete', function () {
    var id = $(this).attr('taskId');
    if (!preventAjax) {
        $.ajax({
            url: '/task/edit/id/' + $(this).attr('taskId'),
            data: {
                isDone: this.checked
            },
            ok: function (x) {
                console.log('siema');
                var item = x.response;
                if (item.status === true) {
                    if (item.newValue === 'true') {
                        var middle = ' zakończył zadanie.';
                        $("input[taskid='" + id + "'][name='deadline']").removeClass(function (index, css) {
                            return (css.match(/(^|\s)dtg-\S+/g) || []).join(' ');
                        });
                        $("input[taskid='" + id + "'][name='deadline']").addClass('dtg-300');
                    } else {
                        var middle = ' wznowił zadanie.';
                        var date = new Date($("input[taskid='" + id + "'][name='deadline']").val());
                        var now = new Date();
                        var dtg = Math.floor((date - now) / 86400000);
                        if (dtg < 0) {
                            dtg = 0;
                        }
                        $("input[taskid='" + id + "'][name='deadline']").removeClass(function (index, css) {
                            return (css.match(/(^|\s)dtg-\S+/g) || []).join(' ');
                        });
                        $("input[taskid='" + id + "'][name='deadline']").addClass('dtg-' + dtg);

                    }
                    $(".taskhistory").append(createContent(middle, item));
                } else {
                    info('Coś poszło nie tak :(', 'notok');
                }
            }
        });
    }

    var $tr = $(this).parent().parent();
    if (this.checked) {
        $tr.addClass('done');
        $tr.attr('isDone', 'true');
    } else {
        $tr.removeClass('done');
        $tr.attr('isDone', '');
    }
    refreshFaded();
});

$(document).on('change', 'select.user', function () {
    var userId = $(this).val();

    $.ajax({
        url: '/task/edit/id/' + $(this).attr('taskId'),
        data: {
            userId: userId
        },
        ok: function (x) {
            var item = x.response;
            var tree = $("#treetable").fancytree("getTree");
            var activeNode = tree.getActiveNode();
            activeNode.data.userId = userId;
            var middle = ' przypisał zadanie do użytkownika <span class="entry-newValue">' + item.questUser + '</span>.';
            $(".taskhistory").append(createContent(middle, item));
        }
    });
});

$(document).on('change', 'input.fieldInput', function (x) {
    var data = {};
    data[$(this).attr('name')] = $(this).val();
    var $this = $(this);
    $.ajax({
        url: '/task/edit/id/' + $(this).attr('taskId'),
        data: data,
        ok: function (response) {
            var item = response.response;
            if (item.status === false) {
                info('Coś poszło nie tak <i class="fa fa-frown-o"></i>', 'notok');
            } else {
                var text = item.newValue;
                if (text === "") {
                    text = "Brak";
                }
                if (item.type === 'deadline') {
                    var middle = ' zmienił deadline zadania na "<span class="entry-newValue">' + text + '</span>".';
                    $(".taskhistory").append(createContent(middle, item));
                    $($this).removeClass(function (index, css) {
                        return (css.match(/(^|\s)dtg-\S+/g) || []).join(' ');
                    });
                    $($this).addClass('dtg-' + item.dtg);
                }

                if (item.type === 'start') {
                    var middle = ' zmienił datę rozpoczęcia zadania na "<span class="entry-newValue">' + text + '</span>".';
                    $(".taskhistory").append(createContent(middle, item));
                }

                if (item.type === 'end') {
                    var middle = ' zmienił datę zakończenia zadania na "<span class="entry-newValue">' + text + '</span>".';
                    $(".taskhistory").append(createContent(middle, item));
                }
                if (item.type === 'time') {
                    var middle = ' zmienił czas trwania zadania na "<span class="entry-newValue">' + text + '</span>".';
                    $(".taskhistory").append(createContent(middle, item));
                    $this.val(item.newValue.substr(0, 5));
                }
                if (item.type === 'estim') {
                    var middle = ' zmienił przewidywany czas trwania zadania na "<span class="entry-newValue">' + text + '</span>".';
                    $(".taskhistory").append(createContent(middle, item));
                    $this.val(item.newValue.substr(0, 5));
                }
            }

        }
    });
});

$(document).on('confirm', 'div.taskdetails textarea', function () {
    $("#desc-error").hide();
    $.ajax({
        url: '/task/edit/id/' + taskId,
        data: {
            description: $(this).val()
        },
        ok: function (x) {
            var item = x.response;
            if (item.status === true) {
                $('.task-info').text(item.newValue);
                var middle = ' zmienił opis zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                $(".taskhistory").append(createContent(middle, item));
                $("textarea.comment").val('');
                $('div.taskdetails textarea').val('');
            } else {
                $("#desc-error").show();
            }
        }
    });
});

$(document).on('confirm', 'div.comment-box .comment', function () {
    $("#comment-error").hide();
    $.ajax({
        url: '/task/comment/id/' + taskId,
        data: {
            text: $(this).val()
        },
        ok: function (x) {
            var item = x.response;
            if (item.status === true) {
                var middle = ' napisał:<br><span class="entry-newValue">' + item.newValue + '</span>';
                $(".taskhistory").append(createContent(middle, item));
                $("textarea.comment").val('');
            } else {
                $("#comment-error").show();
            }
        }

    });
});

//function datepickerInit(selector) {
//    $(selector).datepicker({
//        format: "yyyy-mm-dd",
//        todayBtn: "linked",
//        clearBtn: true,
//        language: "pl",
//        calendarWeeks: true,
//        autoclose: true,
//        todayHighlight: true
////        beforeShowDay: function (date) {
////            if (date.getMonth() == (new Date()).getMonth()) {
////                switch (date.getDate()) {
////                    case 4:
////                        return {
////                            tooltip: 'Example tooltip',
////                            classes: 'active'
////                        };
////                    case 8:
////                        return false;
////                    case 12:
////                        return "green";
////                }
////            }
////        },
////        datesDisabled: ['08/06/2015', '08/21/2015']
//    });
//}

function refreshFaded() {
    $('#treetable tr').attr('faded', '').each(function () {
//            console.log(this);
        if ($(this).attr('isDone') === 'true') {
            $(this).attr('faded', 'true');
            return;
        }

        var $parent = $('tr[taskId="' + $(this).attr('parentId') + '"]');
        if ($parent.length) {
            if ($parent.attr('faded') === 'true') {
                $(this).attr('faded', 'true');
                return;
            }
        }
    });
}

$(function () {
    $("#splitted").splitter({
        type: "v",
        minLeft: 100, sizeRight: 400, minRight: 100,
        cookie: "vsplitter"
    });

//    $("#splitted").resize(function () {
//        console.log('dsfsdfsd');
    $("#splitted").css('box-sizing', 'content-box');
//    });

    // Attach the fancytree widget to an existing <div id="tree"> element
    // and pass the tree options as an argument to the fancytree() function:
    $("#treetable").fancytree({
        extensions: ["edit", "dnd", "table", "gridnav"],
        checkbox: true,
        titlesTabbable: true, // Add all node titles to TAB chain
        quicksearch: true, // Jump to nodes when pressing first character
        dnd: {
            preventVoidMoves: true,
            preventRecursiveMoves: true,
            autoExpandMS: 400,
            dragStart: function (node, data) {
                return true;
            },
            dragEnter: function (node, data) {
                // return ["before", "after"];
                return true;
            },
            dragDrop: function (node, data) {
                data.otherNode.moveTo(node, data.hitMode);
                $.ajax({
                    url: '/task/move/drop/' + data.node.key + '/move/' + data.otherNode.key + '/hitmode/' + data.hitMode,
                    data: {
                    },
                    ok: function (response) {
                        // TODO: obsługa zwrotki:
                        // - gdy coś pójdzie nie tak
                        console.log(response);
                    }
                });
            }
        },
        edit: {
            triggerStart: ["f2", "shift+click", "mac+enter", ""],
            inputCss: {minWidth: "10em"},
            close: function (event, data) {
                if (data.save) {
                    $.ajax({
                        url: '/task/edit/id/' + data.node.key,
                        data: {
                            title: data.node.title
                        },
                        ok: function (x) {
                            var item = x.response;
                            if (item.status === false) {
                                info('Coś poszło nie tak :(', 'notok');
                            } else {
                                var middle = ' zmienił tytuł zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                $(".taskhistory").append(createContent(middle, item));
                                $('div.taskdetails h3').text(unescape(encodeURIComponent(item.newValue)));
                            }
                        }
                    });
                    if (data.isNew) {
                        // Quick-enter: add new nodes until we hit [enter] on an empty title
//                        $("#treetable").trigger("nodeCommand", {cmd: "addSibling"});
                    }
                }
            }
        },
        init: function () {
            preventAjax = true;
//            $('input.complete').change();
            preventAjax = false;
        },
        table: {
            indentation: 20, // indent 20px per node level
            nodeColumnIdx: 2, // render the node title into the 2nd column
            checkboxColumnIdx: 0  // render the checkboxes into the 1st column
        },
        gridnav: {
            autofocusInput: false,
            handleCursorKeys: true
        },
        source: {
            url: "/task/get/depth/5/id/pr-" + view.projectId
//            url: "ajax-tree-products.json"

        },
        lazyLoad: function (event, data) {
//            console.log([event, data]);
            data.result = {url: "/task/get/depth/5/id/" + data.node.key};
        },
        renderColumns: function (event, data) {
            var node = data.node;
            var $tdList = $(node.tr).attr('taskId', node.key).attr('parentId', node.parent.key).find(">td");
//            console.log([event, data, node]);
            // (index #0 is rendered by fancytree by adding the checkbox)
            //$tdList.eq(1).text(node.getIndexHier()).addClass("alignRight");
            $tdList.eq(1).text(node.key);
            // (index #2 is rendered by fancytree)
//            $tdList.eq(4).html("<input type='checkbox' name='like' value='" + node.key + "'>");
            $tdList.eq(3).addClass('text-center').html($("<input type='checkbox' class='complete' name='complete' taskId='" + node.key + "'>").attr('checked', node.data.isDone == 1));
            $(node.tr).attr('faded', node.data.isDone == 1 ? 'true' : '').attr('isDone', node.data.isDone == 1 ? 'true' : '');

            var $selectUsers = $("<select class='user' taskId='" + node.key + "'/>");
            $("<option />", {text: '-', value: ''}).appendTo($selectUsers);
            for (var id in view.users) {
                $("<option />", {text: view.users[id], value: id, selected: id == node.data.userId}).appendTo($selectUsers);
            }
            $tdList.eq(4).html($selectUsers);
            // deadline
            if (node.data.isDone == 1) {
                node.data.dtg = 30;
            }
            $tdList.eq(5).html("<input type='text' name='deadline' taskId='" + node.key + "' class='datepicker fieldInput dtg-" + node.data.dtg + "' value='" + (node.data.deadline || '') + "'/>");
            // start
            $tdList.eq(6).html("<input type='text' name='start' taskId='" + node.key + "' class='datepicker fieldInput' value='" + (node.data.start || '') + "'/>");
            // end
            $tdList.eq(7).html("<input type='text' name='end' taskId='" + node.key + "' class='datepicker fieldInput' value='" + (node.data.end || '') + "'/>");
            // estim
            $tdList.eq(8).html("<input type='text' name='estim' taskId='" + node.key + "' class='fieldInput' value='" + (node.data.estim || '') + "'/>");
            // time
            $tdList.eq(9).html("<input type='text' name='time' taskId='" + node.key + "' class='fieldInput' value='" + (node.data.time || '') + "'/>");
        },
        activate: function (event, data) {
            taskId = data.node.key;
            $.ajax({
                url: '/task/load/id/' + taskId,
                data: {
                },
                ok: function (response) {
                    $('div.taskdetails h3').text(response.task.title);
                    $('div.taskdetails.about-task').text("Opis zadania:");
                    if (response.task.description) {
                        $('.task-info').text(response.task.description);
                    } else {
                        $('.task-info').text('Brak');
                    }
                    $('div.taskhistory').text('');
                    $('div.add-comment').html('');
                    $('div.interested-users > select').remove();
                    $('div.interested-users > p').text('Zainteresowani:  ');
                    for (var k in response.userList) {
                        if (response.userList[k].creator == 0) {
                            $('div.interested-users > p').append('<span taskId="' + response.task.id + '" id="user-' + response.userList[k].userId + '">' + response.userList[k].nickname + ' <i class="fa fa-times"></i>   </span>');
                        } else {
                            $('div.interested-users > p').append('<span taskId="' + response.task.id + '" id="user-' + response.userList[k].userId + '">' + response.userList[k].nickname + '(twórca) <i class="fa fa-times"></i>   </span>');
                        }
                    }
                    var userSelect = '<select id="userSelect">';
                    userSelect += '<option value="0-0">-</option>';
                    for (var z in response.selectList) {
                        if (response.selectList[z].id !== '1') {
                            userSelect += '<option value="' + response.selectList[z].userId + '-' + response.task.id + '">' + response.selectList[z].nickname + '</option>';
                        }
                    }
                    $('div.interested-users').append(userSelect);
                    for (var i in response.details) {
                        var item = response.details[i];
                        var content = '<a href="#" class="hash-link"><span class="hash-hash">#</span><span class="hash-taskId">' + response.task.id + '</span><span class="hash-colon">:</span><span class="hash-nr">' + item.nr + '</span></a> <span class="entry-creationTime">' + item.creationTime + ' (' + item.ago + ') ' + '</span><br><span class="entry-text"><span class="entry-user">' + item.userNickname + '</span>';
                        switch (item.typeKey) {
                            case 'INTEREST':
                                content += ' dodał do zainteresowanych użytkownika <br><span class="entry-newValue">' + view.users[item.newValue] + '</span>';
                                break;
                            case 'COMMENT':
                                content += ' napisał:<br><span class="entry-newValue">' + item.newValue + '</span>';
                                break;
                            case 'COMMEDIT':
                                content += ' zmienił komentarz:<br><span class="entry-newValue">' + item.newValue + '</span>';
                                break;
                            case 'CREATE':
                                content += ' stworzył zadanie.';
                                break;
                            case 'EDIT':
                                content += ' zmienił tytuł zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'DESCEDIT':
                                content += ' zmienił opis zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'ASSIGN':
                                content += ' przypisał zadanie do użytkownika <span class="entry-newValue">' + view.users[item.newValue] + '</span>.';
                                break;
                            case 'DONE':
                                if (item.newValue === 'true') {
                                    content += ' zakończył zadanie.';
                                } else {
                                    content += ' wznowił zadanie.';
                                }
                                break;
                            case 'DEADLINE':
                                content += ' zmienił deadline zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'START':
                                content += ' zmienił datę rozpoczęcia zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'END':
                                content += ' zmienił datę zakończenia zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'TIME':
                                content += ' zmienił czas trwania zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'ESTIM':
                                content += ' zmienił przewidywany czas trwania zadania na "<span class="entry-newValue">' + item.newValue + '</span>".';
                                break;
                            case 'REMOVE':
                                content += ' usunął zadanie.';
                                break;
                        }
                        content += '</span><hr>';
                        $('<div class="historyentry">' + content + '</div>').appendTo($('div.taskhistory'));
                    }

                    $('<div class="comment-box"><span class="comment-label">Napisz komentarz jako <span class="comment-user">' + view.users[view.userId] + '</span>:</span><br><textarea class="comment"></textarea></div>').appendTo($('div.add-comment'));
                    $('<p id="comment-error" style="display: none; color: red;">Panie! Pusty wartość?</p>').appendTo($('div.add-comment'));
                    $('<button id="submitButton">Dodaj komentarz</button>').appendTo($('div.add-comment'));
                }
            });
        },
        removeNode: function (event, data) {
            var taskId = data.node.key;
            $.ajax({
                url: '/task/remove/id/' + taskId,
                data: {
                },
                ok: function (x) {
                    var item = x.response;
                    if (item.status === true) {
                        info('<center>Pozycja usunięta</center>', 'ok');
                    } else {
                        info('<center>Coś poszło nie tak :(</center>', 'notok');
                    }
                }
            });
        },
        expand: function (event, data) {
//            console.log(['expand', event, data]);
            refreshFaded();
            var taskId = data.node.key;
            $.ajax({
                url: '/task/status/id/' + taskId,
                data: {
                    expanded: true
                },
                ok: function (response) {
                    if (response === false) {
                        info('Coś poszło nie tak :(', 'notok');
                    }
                }
            });
        },
        collapse: function (event, data) {
//            console.log(['collapse', event, data]);
            var taskId = data.node.key;
            $.ajax({
                url: '/task/status/id/' + taskId,
                data: {
                    expanded: false
                },
                ok: function (response) {
                    // TODO: obsługa zwrotki:
                    // - gdy coś pójdzie nie tak
                }
            });
        }
    }).on("nodeCommand", function (event, data) {
        // Custom event handler that is triggered by keydown-handler and
        // context menu:
        var refNode, moveMode,
                tree = $(this).fancytree("getTree"),
                node = tree.getActiveNode();

        console.log([event, data, tree, node]);

        switch (data.cmd) {
            case "moveUp":
                refNode = node.getPrevSibling();
                if (refNode) {
                    node.moveTo(refNode, "before");
                    node.setActive();
                }
                break;
            case "moveDown":
                refNode = node.getNextSibling();
                if (refNode) {
                    node.moveTo(refNode, "after");
                    node.setActive();
                }
                break;
            case "indent":
                refNode = node.getPrevSibling();
                if (refNode) {
                    node.moveTo(refNode, "child");
                    refNode.setExpanded();
                    node.setActive();
                }
                break;
            case "outdent":
                if (!node.isTopLevel()) {
                    node.moveTo(node.getParent(), "after");
                    node.setActive();
                }
                break;
            case "rename":
                node.editStart();
                break;
            case "remove":
                if (node === null) {
                    info('<center>Zaznacz zadanie</center>', 'notok');
                } else {
                    if (confirm("Czy na pewno chcesz usunąć zadanie?")) {
                        console.log(node);
                        refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                        node.remove();
                        if (refNode) {
                            refNode.setActive();
                        }
                    }
                }
                break;
            case "addChild":
                if (node === null) {
                    node = tree.rootNode;
                }
                $.ajax({
                    url: '/task/add',
                    data: {
                        parentId: node.key.substring(0, 4) == 'root' ? 'pr-' + view.projectId : node.key
                    },
                    ok: function (x) {
                        var item = x.response;
                        node.editCreateNode("child", {
                            title: '',
                            key: item.taskId,
                            start: item.start
                        });

                    }
                });
                break;
            case "addSibling":
                var parentNode;
                if (node === null) {
                    parentNode = tree.rootNode;
//                    if (node.children.length) {
//                        node = node.children[node.children.length - 1];
//                    }
                } else {
                    parentNode = node.parent;
                }
                $.ajax({
                    url: '/task/add',
                    data: {
                        parentId: parentNode.key.substring(0, 4) == 'root' ? 'pr-' + view.projectId : parentNode.key,
                        nextTo: node ? node.key : undefined
                    },
                    ok: function (x) {
                        var item = x.response;
                        if (node) {
                            node.editCreateNode("after", {
                                title: '',
                                key: item.taskId,
                                start: item.start
                            });
                        } else {
                            parentNode.editCreateNode("child", {
                                title: '',
                                key: item.taskId,
                                start: item.start
                            });
                        }
                    }
                });
                break;
            case "cut":
                CLIPBOARD = {mode: data.cmd, data: node};
                break;
            case "copy":
                CLIPBOARD = {
                    mode: data.cmd,
                    data: node.toDict(function (n) {
                        delete n.key;
                    })
                };
                break;
            case "clear":
                CLIPBOARD = null;
                break;
            case "paste":
                if (CLIPBOARD.mode === "cut") {
                    // refNode = node.getPrevSibling();
                    CLIPBOARD.data.moveTo(node, "child");
                    CLIPBOARD.data.setActive();
                } else if (CLIPBOARD.mode === "copy") {
                    node.addChildren(CLIPBOARD.data).setActive();
                }
                break;
            default:
                alert("Unhandled command: " + data.cmd);
                return;
        }

        // }).on("click dblclick", function(e){
        //   console.log( e, $.ui.fancytree.eventToString(e) );

    }).on("keydown", function (e) {
        var cmd = null;

        // console.log(e.type, $.ui.fancytree.eventToString(e));
        switch ($.ui.fancytree.eventToString(e)) {
            case "ctrl+shift+n":
            case "meta+shift+n": // mac: cmd+shift+n
                cmd = "addChild";
                break;
            case "ctrl+c":
            case "meta+c": // mac
                cmd = "copy";
                break;
            case "ctrl+v":
            case "meta+v": // mac
                cmd = "paste";
                break;
            case "ctrl+x":
            case "meta+x": // mac
                cmd = "cut";
                break;
            case "ctrl+n":
            case "meta+n": // mac
                cmd = "addSibling";
                e.preventDefault();
                break;
            case "del":
            case "meta+backspace": // mac
                cmd = "remove";
                break;
                // case "f2":  // already triggered by ext-edit pluging
                //   cmd = "rename";
                //   break;
            case "ctrl+up":
                cmd = "moveUp";
                break;
            case "ctrl+down":
                cmd = "moveDown";
                break;
            case "ctrl+right":
            case "ctrl+shift+right": // mac
                cmd = "indent";
                break;
            case "ctrl+left":
            case "ctrl+shift+left": // mac
                cmd = "outdent";
        }
        if (cmd) {
            $(this).trigger("nodeCommand", {cmd: cmd});
            // e.preventDefault();
            // e.stopPropagation();
            return false;
        }
    });

    /*
     * Tooltips
     */
    $("#treetable").tooltip({
        content: function () {
            return $(this).attr("title");
        }
    });

//    $("#treetable").contextmenu({
//        delegate: "span.fancytree-node",
//        menu: [
//            {title: "Edit <kbd>[F2]</kbd>", cmd: "rename", uiIcon: "ui-icon-pencil"},
//            {title: "Delete <kbd>[Del]</kbd>", cmd: "remove", uiIcon: "ui-icon-trash"},
//            {title: "----"},
//            {title: "New sibling <kbd>[Ctrl+N]</kbd>", cmd: "addSibling", uiIcon: "ui-icon-plus"},
//            {title: "New child <kbd>[Ctrl+Shift+N]</kbd>", cmd: "addChild", uiIcon: "ui-icon-arrowreturn-1-e"},
//            {title: "----"},
//            {title: "Cut <kbd>Ctrl+X</kbd>", cmd: "cut", uiIcon: "ui-icon-scissors"},
//            {title: "Copy <kbd>Ctrl-C</kbd>", cmd: "copy", uiIcon: "ui-icon-copy"},
//            {title: "Paste as child<kbd>Ctrl+V</kbd>", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true}
//        ],
//        beforeOpen: function (event, ui) {
//            var node = $.ui.fancytree.getNode(ui.target);
//            $("#treetable").contextmenu("enableEntry", "paste", !!CLIPBOARD);
//            node.setActive();
//        },
//        select: function (event, ui) {
//            var that = this;
//            // delay the event, so the menu can close and the click event does
//            // not interfere with the edit control
//            setTimeout(function () {
//                $(that).trigger("nodeCommand", {cmd: ui.cmd});
//            }, 100);
//        }
//    });
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var menuName_1 = "";
    var menuName_2 = "";
    if (isChrome) {
        menuName_1 = 'Nowe zadanie <kbd> Ctrl+M</kdb>';
        menuName_2 = 'Nowe podzadanie <kbd> Ctrl+Shift+M </kdb>';
    } else {
        menuName_1 = 'Nowe zadanie <kbd> Ctrl+N </kdb>';
        menuName_2 = 'Nowe podzadanie <kbd> Ctrl+Shift+N </kdb>';
    }
    var menu = [{
            name: 'Zmiana tytułu <kbd> F2 </kdb>',
            img: '/images/edit.png',
            title: 'change button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "rename"});
            }
        }, {
            name: 'Usuń <kbd> Del </kdb>',
            img: '/images/remove.png',
            title: 'delete button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "remove"});
            }
        }, {
            name: menuName_1,
            img: '/images/plus_1.png',
            title: 'addSibling button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "addSibling"});
            }
        }, {
            name: menuName_2,
            img: '/images/plus_2.png',
            title: 'addChild button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "addChild"});
            }
        }, {
            name: 'Kopiuj <kbd> Ctrl+C </kdb>',
            img: '/images/copy.png',
            title: 'copy button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "copy"});
            }
        }, {
            name: 'Wytnij <kbd> Ctrl+X </kdb>',
            img: '/images/cut.png',
            title: 'cut button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "cut"});
            }
        }, {
            name: 'Wklej <kbd> Ctrl+V </kdb>',
            img: '/images/paste.png',
            title: 'paste button',
            fun: function () {
                $("#treetable").trigger("nodeCommand", {cmd: "paste"});
            }
        }];


    $('#treetable').contextMenu(menu, {triggerOn: 'contextmenu'});
});


function createContent(middle, items) {
    var content = '<div class="historyentry"><a href="#" class="hash-link"><span class="hash-hash">#</span><span class="hash-taskId">' + items.taskId + '</span><span class="hash-colon">:</span><span class="hash-nr">' + items.nr + '</span></a> <span class="entry-creationTime">' + items.creationTime + ' (' + items.ago + ') ' + '</span><br><span class="entry-text"><span class="entry-user">' + items.userNick + '</span>';
    content += middle;
    content += '</span><hr></div>';
    return content;
}

$(document).ready(function () {
    $('#splitted').height(window.innerHeight - 133);
    $('.taskhistory').height($('.fancydetails').height() - $('.taskdetails').height() - 310);
    $('.taskhistory').scrollTop($('.taskhistory').prop("scrollHeight"));


});

