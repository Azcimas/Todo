<?php

namespace content;

use model\record\user;

/**
 * Description of index
 *
 * @author Daro
 */
class project extends \app\module\action\pcLayout {

    public function onPermissionCheck() {
        return true;
    }

    public function onAction() {
        $project = \model\record\project::findOne(['title = ?' => key($this->getParams())]);
        if (!$project) {
            $projectId = $this->getParam('id');
            if (!$projectId) {
                $this->redirect('/');
            }
            $project = \model\record\project::get($projectId);
            if (!$project) {
                $this->redirect('/');
            }
        } else {
            $projectId = $project->getId();
        }

        $this->view->title = "Projekt " . $project->title;

        $this->view->setScriptVar('users', \model\record\user::find()->nickname); // nameAndSurname);
        $this->view->setScriptVar('userId', $this->session->userId);

        $users = \model\record\user::find();
        $users->useIndex(\Skinny\Db\Record\RecordCollection::IDX_ID);
        $this->view->setScriptVar('users', $users->nickname); // nameAndSurname);
//        $this->view->setScriptVar('projects', \model\record\project::find(['removed = 0'], 'name')); // nameAndSurname);

        $this->view->setScriptVar('userId', $this->loggedUser->id);
        $this->view->setScriptVar('projectId', $projectId);

        $this->view->js->add('tasktree');
        $this->view->js->add('splitter');

    }

}
