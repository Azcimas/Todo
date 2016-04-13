<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace model\record;

/**
 * Description of users
 *
 * @author Adrian
 * 
 * @property int $id - 
 * @property int $isActive
 * @property string $password
 * @property string $login
 * @property string $name 
 * @property string $surname
 * @property string $email
 * @property string $nick
 * @property string $phoneNumber
 */
class users extends \app\module\record\standardRecordBase{
    
    public function __construct(array $data = array()) {
        parent::__construct('users', 'id', $data);
        //$this->_setCollectionColumn('teams', array('userId = ?'=>self::ID), team::class)
    }
    
    public function getTeams() {
        return team::findJoin([['join', 'userTeams', 'userTeams.teamId = teams.id']], array('userId = ?' => $this->getId()));
    }
}
