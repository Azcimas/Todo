<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace content\register;

/**
 * Description of dataCheck
 *
 * @author Adrian
 */
class dataCheck extends \app\module\action\pcLayout {

    public function onPermissionCheck() {
        return true;
    }

    public function onAction() {
        $data = $this->getPost();
        if ($data['type'] == 'team-text') {
            $check = \model\record\team::find(array('name like ?' => $data['check']));
            if ($check->count() != 0) {
                $response = false;
            } else {
                $response = true;
            }
        } else {
            $type = explode('-', $data['type']);
            $check = \model\record\user::find(array($type[0] . ' like ?' => $data['check']));
            if ($check->count() != 0) {
                $response = false;
            } else {
                $response = true;
            }
        }
        $this->ajax->response = $response;
    }

}
