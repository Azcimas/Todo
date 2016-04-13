<?php

namespace content\task;

/**
 * Description of notificationStatus
 *
 * @author Adrian
 */
class notificationStatus extends \app\module\action\ajax {
    public function onAction() {
        $id = $this->getParam('id');
        $notification = \model\record\notification::get($id);
        $notification->seen = 1;
        $notification->save();
    }

}
