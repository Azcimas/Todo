<?php

namespace content\register;

use Skinny\Data\Validator\StringLength;

/**
 * Description of newUser
 *
 * @author Adrian
 */
class newProject extends \app\module\action\pcLayout {

    public function onPermissionCheck() {
        return true;
    }

    public function onAction() {
        $data = $this->getPost();
        
        $project = new \model\record\project($data);
        $project->save();
        
        $user = \model\record\user::get($project['userId']);
        $response = array(
            'title' => $project['title'],
            'description' => $project['description'],
            'id' => $project['id'],
            'user' => $user['name'] . ' ' . $user['surname']            
        );
        $this->ajax->response = $response;
    }

}
