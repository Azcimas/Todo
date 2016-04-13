<?php

namespace content\register;

/**
 * Description of newTeam
 *
 * @author Adrian
 */
class newTeam extends \app\module\action\pcLayout {

    public function onPermissionCheck() {
        return true;
    }

    public function onAction() {
        $data = $this->getPost();
        $check = \model\record\team::find(array('name like ?' => $data['name']));
        if ($check->count() != 0) {
            $response = ['status' => false];
        } else {
            $team = new \model\record\team($data);
            $team->save();
            $response = [
                'status' => true,
                'name' => $team['name'],
                'id' => $team['id']
            ];
        }
        $this->ajax->response = $response;
    }

}
