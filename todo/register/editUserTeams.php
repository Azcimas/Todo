<?php

namespace content\register;

class editUserTeams extends \app\module\action\pcLayout {
    public function onAction() {
        $data = $this->getPost();
        $userTeams = new \model\record\userTeams();
        $userTeams->delete(array('userId = ?' => $data['id']));
        
        foreach ($data['teams'] as $i) {
                    $teams = new \model\record\userTeams();
                    $teams->userId = $data['id'];
                    $teams->teamId = $i;
                    $teams->save();
                }
        $teamArr = [];
        foreach ($data['teams'] as $id) {
            $team = new \model\record\team();
            $team = \model\record\team::get($id);
            array_push($teamArr, $team->name);
        }
        $response = array(
            'id' => $data['id'],
            'teams' => implode(', ', $teamArr)
        );
        
        $this->ajax->response = $response;
    }

    public function onPermissionCheck() {
        return true;
    }

}
