<?php

namespace model\record;

/**
 * grupy do których są przypisani użytkownicy 
 *
 * @author 
 * 
 * @property int $mandantId - 
 * @property int $id - 
 * @property int $groupId - 
 * @property int $userId - 


 */
class userTask extends \app\module\record\standardRecordBase {

    public function __construct(array $data = array()) {
        parent::__construct('userTask', self::ID, $data);
    }

}
