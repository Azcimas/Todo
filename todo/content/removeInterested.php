<?php

namespace content\task;

class removeInterested extends \app\module\action\ajax {

    /**
     * Przeciążenie sprawdzenia wymagalności logowania.
     */
    public function onLoginRequirementCheck() {
        return true;
    }

    public function onAction() {
        $userId = $this->getParam('userId');
        $taskId = $this->getParam('taskId');
        if (isset($userId) && isset($taskId)) {
            $userTask = new \model\record\userTask();
            $nick = \model\record\user::get($userId)->nickname;
            $userTask->delete(array('userId = ?' => $userId, 'taskId = ?' => $taskId));

            $response = array(
                'status' => true,
                'taskId' => $taskId,
                'userId' => $userId,
                'nickname' => $nick
            );
        } else {
            $response = array(
                'status' => false
            );
        }
        $this->ajax->response = $response;
    }

}
