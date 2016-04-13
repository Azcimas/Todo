<?php

namespace model\record;

/**
 * Description of test
 *
 * @author Daro
 * @property int $mandantId - 
 * @property int $id - 
 * @property int $isActive
 * @property int $isTester
 * @property int $regionDicId
 * @property string $password
 * @property string $login
 * @property string $name imię
 * @property string $surname
 * @property string $email
 * @property string $phoneNumber
 * @property \Skinny\Db\Record\RecordCollection $groups grupy użytkownika
 */
class user extends \app\module\record\standardRecordBase {

    public function __construct(array $data = array()) {
        parent::__construct('user', 'id', $data);

    }

    public function toString() {
        return $this->name . ' ' . $this->surname;
    }

    /**
     * sprawdza czy rekord użytkownika nalezy do grupy super Admin.
     * @return boolean
     */
    public function isAdmin() {

        if (!$isAdmin = userGroups::findOne(['userId = ?' => $this->session->userId, 'groupId = ?' => userGroups::ID_SA])) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Pobiera kolekcję grup użytkownika.
     * 
     * @return \Skinny\Db\Record\RecordCollection
     */
    public function getGroups() {
        //return [];
        return \model\record\userGroups::findJoin([
                    ['join', ['_mg' => 'groups'], '_mg.id = groupId', ['name']],
                        ], ['userId = ?' => $this->getId()]);
    }

//    public function getMessages() {
//        return userMessages::getMessagesOfUser($this->getId());
//    }


    public function getFullName() {
        return $this->name . ' ' . $this->surname;
    }
    
    
    public function getTeams() {
        return team::findJoin([['join', 'userTeams', 'userTeams.teamId = teams.id']], array('userId = ?' => $this->getId()));
    }

}
