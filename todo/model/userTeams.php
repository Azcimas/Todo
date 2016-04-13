<?php


namespace model\record;

/**
 * Description of userTeams
 *
 * @author Adrian
 */
class userTeams extends \app\module\record\standardRecordBase{    
    
    public function __construct(array $data = array()) {
        parent::__construct('userTeams', 'id', $data);
    }
}
