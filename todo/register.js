$(document).ready(function () {

    $("#addUser").click(function () {
        /*
         * Walidacja czy któryś z wymaganych inputów nie jest pusty.
         */
//        stat = 1;
//        var x = document.getElementsByClassName("required");
//        for (i = 0; i < 7; i++) {
//            var id = $(x[i]).attr('id');
//            if ($('#' + id).val() === '') {
//                $('#' + id + '-error').html('Wymagane!');
//                stat = 0;
//            }
//        }
        /*
         * Walidacja czy wpisane hasła są identyczne.
         */
//        if ($("#password-text").val() !== $("#password2-text").val()) {
//            $('#password2-text').val('');
//            $('#password-text').val('');
//            $('#password-text-error').html('');
//            $('#password2-text-error').html('Hasła muszą być takie same!');
//            stat = 0;
//        }

        if ($('#active-check').is(':checked')) {
            isActive = 1;
        } else {
            isActive = 0;
        }

        var userInfo = {
            login: $("#login-text").val(),
            email: $("#email-text").val(),
            password: $("#password-text").val(),
            password2: $("#password2-text").val(),
            name: $("#name-text").val(),
            surname: $("#surname-text").val(),
            nickname: $("#nick-text").val(),
            phone: $("#phone-text").val(),
            teams: $("#register-select").val(),
            isActive: isActive
        };
//        if (stat === 1) {
        $.ajax({
            url: "/register/newUser",
            data: userInfo,
            ok: function (x) {
                if (x.response.status === true) {
                    var html = '<tr id="item_' + x.response.id +
                            '"><td><div class="del_wrapper" align="center">' +
                            '<a href="" class="del_button" id="del-' + x.response.id +
                            '"><i class="fa fa-trash fa-2x"></i></a></div></td>' +
                            '<td>' + x.response.id + '.</td>' +
                            '<td>' + x.response.nickname + '</td>' +
                            '<td>' + x.response.name + '</td>' +
                            '<td>' + x.response.surname + '</td>' +
                            '<td>' + x.response.teams + '</td></tr>' +
                            '<td><div class="del_wrapper" align="center">' +
                            '<a href="" class="edit_button" id="edit-' + x.response.id +
                            '"><i class="fa fa-pencil"></i></a></div></td>';
                    var html_2 = '<option value="' + x.response.id + '">' + x.response.name + ' ' + x.response.surname + '</option>';
                    $('#userTable > tbody').append(html);
                    $('#user-select').append(html_2);
                    $('.required, #nick-text, #phone-text').val('');
                    alert('Użytkownik stworzony!');
                } else {
                    if (x.response.msg) {
                        $("#email-text-error").html(x.response.msg);
                    } else {
                        $("#login-text-error").html('');
                        $("#email-text-error").html('');
                        $("#password-text-error").html('');
                        $("#password2-text-error").html('');
                        $("#name-text-error").html('');
                        $("#surname-text-error").html('');

                        if (x.response.err.login) {
                            $("#login-text-error").html(x.response.err.login['@errors']['msgInvalid']);
                            $("#login-text-error").html(x.response.err.login['@errors']['required']);
                        }
                        if (x.response.err.email) {
                            $("#email-text-error").html(x.response.err.email['@errors']['msgInvalid']);
                            $("#email-text-error").html(x.response.err.email['@errors']['required']);
                        }
                        if (x.response.err.password) {
                            $("#password-text-error").html(x.response.err.password['@errors']['msgInvalid']);
                            $("#password-text-error").html(x.response.err.password['@errors']['required']);
                        }
                        if (x.response.err.password2) {
                            $("#password2-text-error").html(x.response.err.password2['@errors']['msgInvalid']);
                            $("#password2-text-error").html(x.response.err.password2['@errors']['required']);
                        }
                        if (x.response.err.name) {
                            $("#name-text-error").html(x.response.err.name['@errors']['msgInvalid']);
                            $("#name-text-error").html(x.response.err.name['@errors']['required']);
                        }
                        if (x.response.err.surname) {
                            $("#surname-text-error").html(x.response.err.surname['@errors']['msgInvalid']);
                            $("#surname-text-error").html(x.response.err.surname['@errors']['required']);
                        }
                        if (x.response.err.teams) {
                            $("#teams-text-error").html(x.response.err.teams['@errors']['required']);
                        }
                    }
                }
            }
        });


    });

    $("#addTeam").click(function () {
        /*
         * Walidacja czy któryś z wymaganych inputów nie jest pusty.
         */
        if ($("#team-text").val() === '') {
            info('<center>Wpisz nazwę!</center>', 'notok');
        } else {
            if ($("#user-select").val() == 0) {
                var supervisorId = null;
            } else {
                var supervisorId = $("#user-select").val();
            }
            var teamData = {
                name: $("#team-text").val(),
                supervisorId: supervisorId
            };

            $.ajax({
                url: "/register/newTeam",
                data: teamData,
                ok: function (x) {
                    if (x.response.status === true) {
                        var html = '<option id="opt_' + x.response.id + '" value="' + x.response.id + '">' + x.response.name + '</option>';
                        $('#register-select').append(html);
                        info('<center>Zespoł stworzony!</center>', 'ok');
                    } else {
                        info('Istnieje już taki zespół!', 'notok');
                    }
                }
            });
        }
    });

    $("body").on("click", "#userTable .del_button", function (e) {
        e.preventDefault();
        /*
         * Walidacja czy użytkownik jest pewny usunięcia.
         */
        if (confirm('Czy na pewno chcesz usunąć użytkownika?')) {
            /*
             * Wczytanie id usuwanego użytkownika.
             */
            var clickedID = this.id.split('-');
            var id = clickedID[1];

            var arr = {
                id: id
            };
            jQuery.ajax({
                url: "/register/deleteUser",
                data: arr,
                success: function () {
                    $('#item_' + id).fadeOut();
                    $('#user-select #opt_' + id).fadeOut();
                }
            });
        }
    });

    $("body").on("click", "#userTable .edit_button", function (e) {
        e.preventDefault();
        var clickedID = this.id.split('-');
        var id = clickedID[1];
        var arr = {
            'id': id,
            'teams': $('#item_' + id + ' #register-select').val()
        };

        $.ajax({
            url: "/register/editUserTeams",
            data: arr,
            ok: function (x) {
                var html = x.response.teams;
                $('#item_' + x.response.id + ' td:nth-child(6)').html(html);
            }
        });

    });

});

//$(document).on('change', '#login-text, #nick-text, #team-text', function () {
//    dataCheck(this.id);
//});
//
//
//$(document).on('change', '#password-text, #password2-text', function () {
//    if ($("#" + this.id).val().length < 5) {
//        $("#" + this.id).val('');
//        $("#" + this.id + "-error").html('Minimum 5 znaków!');
//        stat = 0;
//    } else {
//        $("#" + this.id + "-error").html('');
//    }
//});

// Walidacja czy taki uzytkownik lub zespoł juz nie istnieje.
function dataCheck(input) {
    var arr = {
        check: $("#" + input).val(),
        type: input
    };
    $.ajax({
        url: "/register/dataCheck",
        data: arr,
        ok: function (x) {
            if (x.response === false) {
                $("#" + input).val('');
                $("#" + input + "-error").html('Występuje już w systemie!');
            } else {
                $("#" + input + "-error").html('');
            }
        }
    });
}

// Walidacja e-mail.
//$(document).on('change', '#email-text', function validateEmail() {
//    emailCheck($("#email-text").val());
//});
function emailCheck(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email === '') {
        $("#email-text-error").html('Wymagane!');
    } else {
        if (re.test(email)) {
            $("#email-text-error").html('');
            dataCheck("email-text");
        } else {
            $("#email-text").val('');
            $("#email-text-error").html('Błędny format e-mail!');
            stat = 0;
        }
    }
}




