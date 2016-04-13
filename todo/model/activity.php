<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace model\record;

/**
 * Description of addActivity
 *
 * @author Adrian
 */
class activity extends \app\module\record\standardRecordBase {
    public function __construct(array $data = array()) {
        parent::__construct('activity', 'id', $data);
    }
}
