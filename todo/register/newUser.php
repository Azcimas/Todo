<?php

namespace content\register;

use Skinny\Data\Validator\StringLength;

/**
 * Description of newUser
 *
 * @author Adrian
 */
class newUser extends \app\module\action\pcLayout {

    public function onPermissionCheck() {
        return true;
    }

    public function onAction() {
        $data = $this->getPost();
        $validate = new \Skinny\Data\Validate([]);

        $validate->name
                ->required('Wymagane!')
                ->add(new StringLength([
                    StringLength::OPT_MIN => 2,
                    StringLength::OPT_MAX => 20
                        ]), [
                    StringLength::MSG_NOT_STRING => "Musi być łańcuchem znaków!",
                    StringLength::MSG_TOO_SHORT => "Minimum 2 znaki!",
                    StringLength::MSG_TOO_LONG => "Maximum 20 znaków!",
        ]);

        $validate->surname
                ->required('Wymagane!')
                ->add(new StringLength([
                    StringLength::OPT_MIN => 2,
                    StringLength::OPT_MAX => 30
                        ]), [
                    StringLength::MSG_NOT_STRING => "Musi być łańcuchem znaków!",
                    StringLength::MSG_TOO_SHORT => "Minimum 2 znaki!",
                    StringLength::MSG_TOO_LONG => "Maximum 30 znaków!",
        ]);

        $validate->login
                ->required('Wymagane!')
                ->add(function($login) {
                    $check = \model\record\user::find(array('login like ?' => $login));
                    return $check->count() == 0;
                }, 'Podany login występuje w systemie!'
                )
                ->add(new StringLength([
                    StringLength::OPT_MIN => 3,
                    StringLength::OPT_MAX => 20
                        ]), [
                    StringLength::MSG_NOT_STRING => "Musi być łańcuchem znaków!",
                    StringLength::MSG_TOO_SHORT => "Minimum 3 znaki!",
                    StringLength::MSG_TOO_LONG => "Maximum 20 znaków!",
        ]);

        $validate->email
                ->required('Wymagane!')
                ->add(function($email) {
                    $check = \model\record\user::find(array('email like ?' => $email));
                    return $check->count() == 0;
                }, 'Podany email występuje w systemie!'
                )
                ->add(function($email) {
                    return filter_var($email, FILTER_VALIDATE_EMAIL);
                }, 'Błędny format e-mail!'
        );

        $validate->password
                ->required('Wymagane!')
                ->add(new StringLength([
                    StringLength::OPT_MIN => 5,
                    StringLength::OPT_MAX => 30
                        ]), [
                    StringLength::MSG_NOT_STRING => "Musi być łańcuchem znaków!",
                    StringLength::MSG_TOO_SHORT => "Minimum 5 znaków!",
                    StringLength::MSG_TOO_LONG => "Maximum 30 znaków!",
        ]);

        $validate->password2
                ->required('Wymagane!')
                ->add(function($password2, $item) {
                    return $password2 === $item->root()->password->value();
                }, "Hasła muszą być takie same!");

        $validate->teams
                ->required('Wymagane!');


        if ($validate->isValid($data)) {
            if ($data['nickname'] === '') {
                $data['nickname'] = $data['login'];
            }
            $user = new \model\record\user($data);
            $user->password = sha1($data['password']);
            $user->save();

            foreach ($user['teams'] as $i) {
                $teams = new \model\record\userTeams();
                $teams->userId = $user['id'];
                $teams->teamId = $i;
                $teams->save();
            }
            $userTeams = implode(', ', $user->getTeams()->name);
            $response = [
                'status' => true,
                'name' => $user['name'],
                'surname' => $user['surname'],
                'nickname' => $user['nickname'],
                'id' => $user['id'],
                'teams' => $userTeams
            ];
        } else {
            $response = [
                'status' => false,
                'err' => $validate->getAllErrors()
            ];
        }


        $this->ajax->response = $response;
    }

}
