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
class userGroups extends \app\module\record\standardRecordBase {

    public function __construct(array $data = array()) {
        parent::__construct('userGroups', self::ID, $data);
    }

}
