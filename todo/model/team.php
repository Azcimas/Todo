<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace model\record;

/**
 * Description of team
 *
 * @author Adrian
 * 
 * @property int $id
 * @property string $name
 * @property int $supervisorId
 */
class team extends \app\module\record\standardRecordBase{
    
    public function __construct(array $data = array()) {
        parent::__construct('teams', 'id', $data);
    }
}
