<?php

namespace content\task;

use model\record\user;
use model\record\task;
use model\record\collection\tasks;

class remove extends \app\module\action\ajax {

    /**
     * Przeciążenie sprawdzenia wymagalności logowania.
     */
    public function onLoginRequirementCheck() {
        return true;
    }

    public function onPrepare() {
        parent::onPrepare();
    }

    public function onAction() {
        $taskId = $this->getParam('id');
        if (isset($taskId) && !empty(trim($taskId))) {
            $task = task::get($taskId);
            $task->removed = true;
            $task->save(false);
            $userTask = new \model\record\userTask();
            $userTask->delete(array('taskId = ?' => $taskId));
            $task->addActivity(task::A_REMOVED, $this->session->userId);

            $this->db->delete('taskUserOption', ['taskId = ?' => $task->getId()]);
            
            $response = array(
                'status' => true
            );
        } else {
            $response = array(
                'status' => false
            );   
        }
        $this->ajax->response = $response;
    }

}
