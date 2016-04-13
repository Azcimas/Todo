<?php


namespace content\register;

/**
 * Description of deleteUser
 *
 * @author Adrian
 */
class deleteUser extends \app\module\action\pcLayout {
    public function onAction() {
        $data = $this->getPost();
        $user = new \model\record\user();
        $user->delete(array('id = ?' => $data['id']));
    }

    public function onPermissionCheck() {
        return true;
    }

}
