<?php

namespace content\task;

use model\record\user;
use model\record\task;
use model\record\collection\tasks;
use model\record\activity;

class edit extends \app\module\action\ajax {

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
        $taskId = (int) $this->getParam('id');
        $post = $this->getPost();

        $task = task::get($taskId);

        if (isset($post['title'])) {
            if (!empty(trim($post['title']))) {
                $id = $task->addActivity(task::A_EDIT, $this->session->userId, $post['title'], $task->title);
                $task->addNotifications($id, $this->session->userId);
                $task->title = $post['title'];
                $response = $task->prepareResponse($taskId, $id);
            } else {
                $response = array(
                    'status' => false
                );
            }
        }
        if (isset($post['description'])) {
            if (!empty(trim($post['description']))) {
                $id = $task->addActivity(task::A_DESCEDIT, $this->session->userId, $post['description'], $task->description);
                $task->addNotifications($id, $this->session->userId);
                $task->description = $post['description'];
                $response = $task->prepareResponse($taskId, $id);
            } else {
                $response = array(
                    'status' => false
                );
            }
        }
        if (isset($post['isDone'])) {
            if (!empty(trim($post['isDone']))) {
                $id = $task->addActivity(task::A_DONE, $this->session->userId, $post['isDone'], $task->isDone);
                $task->addNotifications($id, $this->session->userId);
                $task->isDone = $this->bool($post['isDone']);
                $response = $task->prepareResponse($taskId, $id);
            } else {
                $response = array(
                    'status' => false
                );
            }
        }
        if (isset($post['userId'])) {
            $id = $task->addActivity(task::A_ASSIGN, $this->session->userId, $post['userId'], $task->userId);
            $task->addNotifications($id, $this->session->userId);
            $task->userId = $this->nullable($post['userId']);
            if ($post['userId'] != '') {
                $questUser = user::get($post['userId'])->nickname;
            } else {
                $questUser = 'Brak';
            }
            $additionalData = array(
                'questUser' => $questUser
            );


            $response = $task->prepareResponse($taskId, $id, $additionalData);
        }
        if (isset($post['deadline'])) {
            if ($post['deadline'] !== '' && !preg_match("/^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $post['deadline'])) {
                $response = array(
                    'status' => false
                );
            } else {
                $id = $task->addActivity(task::A_DEADLINE, $this->session->userId, $post['deadline'], $task->deadline);
                $task->addNotifications($id, $this->session->userId);
                $task->deadline = $this->nullable($post['deadline']);
                $dtg = $task->dtg($post['deadline']);
                $post['dtg'] = $task->dtg();

                $additionalData = array(
                    'type' => 'deadline',
                    'dtg' => $dtg
                );

                $response = $task->prepareResponse($taskId, $id, $additionalData);
            }
        }
        if (isset($post['start'])) {
            if ($post['start'] !== '' && !preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $post['start'])) {
                $response = array(
                    'status' => false
                );
            } else {
                $id = $task->addActivity(task::A_START, $this->session->userId, $post['start'], $task->start);
                $task->addNotifications($id, $this->session->userId);
                $task->start = $this->nullable($post['start']);

                $additionalData = array(
                    'type' => 'start'
                );

                $response = $task->prepareResponse($taskId, $id, $additionalData);
            }
        }
        if (isset($post['end'])) {
            if ($post['end'] !== '' && !preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $post['end'])) {
                $response = array(
                    'status' => false
                );
            } else {
                $id = $task->addActivity(task::A_END, $this->session->userId, $post['end'], $task->end);
                $task->addNotifications($id, $this->session->userId);
                $task->end = $this->nullable($post['end']);

                $additionalData = array(
                    'type' => 'end'
                );

                $response = $task->prepareResponse($taskId, $id, $additionalData);
            }
        }
        if (isset($post['time'])) {
            $time = $task->timeCheck($post['time']);
            if ($time === false) {
                $response = array(
                    'status' => false
                );
            } else {
                if (strpos($post['time'], ':') === false) {
                    $post['time'] .= ':00:00';
                }
                $parts = explode(':', $post['time']);
                $parts[0] = str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                $parts[1] = str_pad($parts[1], 2, '0', STR_PAD_LEFT);
                $parts[2] = isset($parts[2]) ? str_pad($parts[2], 2, '0', STR_PAD_LEFT) : '00';
                $post['time'] = implode(':', $parts);
                if ($post['time'] === '00:00:00') {
                    $post['time'] = '';
                }
                $id = $task->addActivity(task::A_TIME, $this->session->userId, $post['time'], $task->time);
                $task->addNotifications($id, $this->session->userId);
                $task->time = $this->nullable($post['time']);

                $additionalData = array(
                    'type' => 'time'
                );

                $response = $task->prepareResponse($taskId, $id, $additionalData);
            }
        }
        if (isset($post['estim'])) {
            $estim = $task->timeCheck($post['estim']);
            if ($estim === false) {
                $response = array(
                    'status' => false
                );
            } else {
                if (strpos($estim, ':') === false) {
                    $estim .= ':00:00';
                }
                $parts = explode(':', $estim);
                $parts[0] = str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                $parts[1] = str_pad($parts[1], 2, '0', STR_PAD_LEFT);
                $parts[2] = isset($parts[2]) ? str_pad($parts[2], 2, '0', STR_PAD_LEFT) : '00';
                $estim = implode(':', $parts);
                if ($estim === '00:00:00') {
                    $estim = '';
                }
                $id = $task->addActivity(task::A_ESTIM, $this->session->userId, $estim, $task->estim);
                $task->addNotifications($id, $this->session->userId);
                $task->estim = $this->nullable($estim);

                $additionalData = array(
                    'type' => 'estim'
                );

                $response = $task->prepareResponse($taskId, $id, $additionalData);
            }
        }

        $task->save(false);
        $this->ajax->response = $response;
    }

}
