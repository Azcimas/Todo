<?php


namespace content;

/**
 * Description of register
 *
 * @author Adrian
 */
class register extends \app\module\action\pcLayout {
    public function onPermissionCheck() {
        return true;
    }
    
    public function onAction() {
        $users = new \model\record\user();
        $users = \model\record\user::find();
        $this->view->users = $users;
        
        $teams = new \model\record\team();
        $teams = \model\record\team::find();
        $this->view->teams = $teams;
        
        
    }
}
