<?php

namespace content\task;

class addInterested extends \app\module\action\ajax {

    /**
     * Przeciążenie sprawdzenia wymagalności logowania.
     */
    public function onLoginRequirementCheck() {
        return true;
    }

    public function onAction() {
        $userId = $this->getParam('userId');
        $taskId = $this->getParam('taskId');
        if (isset($userId) && isset($taskId) && $taskId !== '0') {
            $check = \model\record\userTask::find(array('userId = ?' => $userId, 'taskId = ?' => $taskId));
            if ($check->count() != 0) {
                $response = array(
                    'status' => false
                );
            } else {
                $userTask = new \model\record\userTask(array('userId' => $userId, 'taskId' => $taskId));
                $userTask->save();
                $task = \model\record\task::get($taskId);
                $id = $task->addActivity(\model\record\task::A_INTERESTED, $this->session->userId, $userId);
                
                $check = \model\record\notification::find(array('userId = ?' => $userId, 'taskId = ?' => $taskId, 'seen = ?' => 0));
                if ($this->session->userId !== $userId && $check->count() == 0) {
                    $notification = new \model\record\notification(array('userId' => $userId, 'activityId' => $id, 'taskId' => $taskId));
                    $notification->save();
                }


                $user = \model\record\user::get($userId);
                $response = array(
                    'status' => true,
                    'taskId' => $taskId,
                    'userId' => $user->id,
                    'nickname' => $user->nickname
                );
            }
        } else {
            $response = array(
                'status' => false
            );
        }
        $this->ajax->response = $response;
    }

}
