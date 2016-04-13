<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace model\record;

function array_splice_assoc(&$input, $offset, $length, $replacement) {
    $replacement = (array) $replacement;
    $key_indices = array_flip(array_keys($input));
    if (isset($input[$offset]) && is_string($offset)) {
        $offset = $key_indices[$offset];
    }
    if (isset($input[$length]) && is_string($length)) {
        $length = $key_indices[$length] - $offset;
    }

    $input = array_slice($input, 0, $offset, TRUE) + $replacement + array_slice($input, $offset + $length, NULL, TRUE);
}

function array_splice_preserve_keys(&$input, $offset, $length = null, $replacement = array()) {
    if (empty($replacement)) {
        return array_splice($input, $offset, $length);
    }

    $part_before = array_slice($input, 0, $offset, $preserve_keys = true);
    $part_removed = array_slice($input, $offset, $length, $preserve_keys = true);
    $part_after = array_slice($input, $offset + $length, null, $preserve_keys = true);

    $input = $part_before + $replacement + $part_after;

    return $part_removed;
}

/**
 * Description of test
 *
 * @author Daro
 * 
 * @property string $title tytuł
 * @property string $id id
 * @property string $projectId do którego projektu zadanie jest przypisane
 * @property string $removed czy zadanie jest usunięte
 * @property string $isDone czy zadanie jest zakończone
 * @property string $parentId task nadzrędny
 * @property string $description opis
 * @property string $userId użytkownik
 * @property string $deadline data ostateczna
 * @property string $start rozpoczęcie zadania
 * @property string $end zakończenie zadania
 * @property string $time czas realizacji
 * @property string $estim szacowany czas realizacji
 * @property collection\tasks $subtasks podzadania
 * @property-read string $expanded czy task jest rozwinięty dla użytkownika
 * @property-read string $order kolejność na liście tasków użytkownika
 */
class task extends \app\module\record\standardRecordBase {

    const A_COMMENT = '1';
    const A_COMMEDIT = '2';
    const A_CREATE = '3';
    const A_EDIT = '4';
    const A_DESCEDIT = '5';
    const A_ASSIGN = '6';
    const A_DONE = '7';
    const A_DEADLINE = '8';
    const A_START = '9';
    const A_END = '10';
    const A_TIME = '11';
    const A_ESTIM = '12';
    const A_REMOVED = '13';
    const A_INTERESTED = '14';

    public function __construct(array $data = array()) {
        parent::__construct('task', self::ID, $data);

        $userId = (new \Skinny\Application\Components\ComponentsAware())->getComponent('session')->userId;

        $this->_setCollectionColumnJoin('subtasks', [
                /* ['joinLeft', 'taskUserOption', 'taskUserOption.taskId = task.id AND taskUserOption.userId = ' . self::$db->quote($userId), ['expanded', 'order']] */
                ], ['parentId = ?' => 'id', 'removed = ?' => 0], task::class, collection\tasks::class, ['order', 'id']);

        $this->_setFilteredColumn('estim', function ($value) {
            $parts = explode(':', $value);
            array_pop($parts);
            return implode(':', $parts);
        });

        $this->_setFilteredColumn('time', function ($value) {
            $parts = explode(':', $value);
            array_pop($parts);
            return implode(':', $parts);
        });
    }

    protected function _getSelect() {
        $userId = (new \Skinny\Application\Components\ComponentsAware())->getComponent('session')->userId;
        $select = parent::_getSelect();
        $select->joinLeft('taskUserOption', 'taskUserOption.taskId = task.id AND taskUserOption.userId = ' . self::$db->quote($userId), ['expanded', 'order']);
        return $select;
    }

    public function loadDetails() {
        $select = self::$db->select()
                ->from(['a' => 'activity'], ['creationTime', 'nr', 'userId', 'oldValue', 'newValue'])
                ->joinLeft(['at' => 'activityType'], 'a.typeId = at.id', ['typeKey' => 'key', 'type' => 'name'])
                ->joinLeft(['u' => 'user'], 'a.userId = u.id', ['userName' => 'name', 'userSurname' => 'surname', 'userNickname' => 'nickname', 'userEmail' => 'email'])
                ->where('taskId = ?', $this->getId())
                ->order('creationTime ASC')
        ;

        $result = self::$db->fetchAll($select);
        foreach ($result as $key => $val) {
            $result[$key]['ago'] = $this->ago($val['creationTime']);
        }

        return $result;
    }

    public function addActivity($type, $userId, $newValue = null, $oldValue = null) {
        self::$db->insert('activity', array(
            'taskId' => $this->getId(),
            'typeId' => $type,
            'userId' => $userId,
            'newValue' => $newValue,
            'oldValue' => $oldValue
        ));
        return self::$db->lastInsertId();
    }

    public function ago($val) {
        $date = strtotime($val);
        $now = time();
        $sec = $now - $date;
        if ($sec < 0) {
            $sec = -$sec;
        }
        if ($sec < 60) {
            return "$sec sek. temu";
        }
        if ($sec < 3600) {
            $min = floor($sec / 60);
            $min2 = $this->min($min);
            return "$min $min2 temu";
        }
        if ($sec < 3600 * 24) {
            $min = floor($sec / 60);
            $min = $min % 60;
            $min2 = $this->min($min);
            $hou = floor($sec / 3600);
            $godz = $this->godz($hou);
            return "$hou $godz i $min $min2 temu";
        } else {
            $days = floor($sec / (3600 * 24));
            $dni = $this->dni($days);
            $hou = floor($sec / 3600);
            $hou = $hou % 24;
            $godz = $this->godz($hou);
            return "$days $dni i $hou $godz temu";
        }
    }

    public function dni($v) {
        return 'dn.';
        if ($v == 1) {
            return 'dzień';
        }
        if ($v >= 2 && $v < 5) {
            return 'dni';
        }
        return 'dni';
    }

    public function godz($v) {
        return 'godz.';
        if ($v == 1) {
            return 'godzinę';
        }
        if ($v >= 2 && $v < 5) {
            return 'godziny';
        }
        return 'godzin';
    }

    public function min($v) {
        return 'min.';
        if ($v == 1) {
            return 'minutę';
        }
        if ($v >= 2 && $v < 5) {
            return 'minuty';
        }
        return 'minut';
    }

    public function dtg($value = null) {
        if (null === $value) {
            $value = $this->deadline;
        }
        $end = date('Y-m-d', strtotime('+1 years'));
        $deadline = empty($value) ? $end : $value;

        $datetime1 = strtotime($deadline);
        $datetime2 = time();

        $secs = $datetime2 - $datetime1; // == return sec in difference
        $diff = $secs / 86400;
        return max([0, round(-$diff)]);
    }

    public function move($other, $hitMode, $expand = null) {
//        var_dump([$this->getId(), $other, $hitMode, $expand, [$sourceKey, $destinKey], $data]);
//        die();
        $changeExpandState = (null !== $expand);
        $expand = (int) $expand;

        $userId = (new \Skinny\Application\Components\ComponentsAware())->getComponent('session')->userId;

        $otherTask = task::get($other);
        if (!$otherTask && $hitMode) {
            return false;
        }

        // przeniesienie typu 'over'
        if (null !== $other && $hitMode == 'over') {
            $this->parentId = $other;
            $this->save(false);

            $data = [
                'taskId' => $this->getId(),
                'userId' => $userId,
                'order' => null,
            ];

            if ($changeExpandState) {
                $data['expanded'] = $expand;
            }

            if (($id = self::$db->fetchOne('SELECT id FROM taskUserOption WHERE userId = ' . self::$db->quote($userId) . ' AND taskId = ' . $this->getId()))) {
                self::$db->update('taskUserOption', $data, ['id = ?' => $id]);
            } else {
                self::$db->insert('taskUserOption', $data);
            }

            return true;
        }

        // pozostałe opcje
        $changeOrder = (null !== $other && in_array($hitMode, ['after', 'before']));

        if (!$changeOrder && !$changeExpandState) {
            return true;
        }

        if ($changeOrder) {
            $this->parentId = $otherTask->parentId;
            $this->save(false);
        }

        again:
        $select = self::$db->select()
                ->from('task', ['taskId' => 'id'])
                ->joinLeft('taskUserOption', 'taskUserOption.taskId = task.id AND taskUserOption.userId = ' . self::$db->quote($userId), ['id', 'expanded', 'order'])
                ->order(['order', 'id'])
                ->where('parentId = ?', $this->parentId)
                ->where('removed = ?', 0)
        ;
        $data = self::$db->fetchAll($select);
//        
//        var_dump($data);
//        die();

        if ($changeOrder) {
            $sourceKey = null;
            $destinKey = null;
            foreach ($data as $key => $taskData) {
                if ($taskData['taskId'] == $this->getId()) {
                    $sourceKey = $key;
                }
                if ($taskData['taskId'] == $other) {
                    $destinKey = $key;
                }
            }

            if (null === $sourceKey || null === $destinKey) {
                var_dump([$this->getId(), $other, $hitMode, $expand, [$sourceKey, $destinKey], $data]);
                die();
            }

            if (null === $sourceKey) {
                self::$db->insert('taskUserOption', [
                    'taskId' => $this->getId(),
                    'userId' => $userId
                ]);
                goto again;
            }

            if (null === $destinKey) {
                self::$db->insert('taskUserOption', [
                    'taskId' => $other,
                    'userId' => $userId
                ]);
                goto again;
            }

            array_splice_assoc($data, $destinKey + ($hitMode == 'after' ? 1 : 0), 0, [999999 => $data[$sourceKey]]);
            unset($data[$sourceKey]);
        }

//        var_dump([$this->getId(), $other, $hitMode, $expand, [$sourceKey, $destinKey], $data]);
//        die();

        $order = 1;
        foreach ($data as &$taskData) {
            if ($changeExpandState && $taskData['taskId'] == $this->getId()) {
                $taskData['expanded'] = $expand;
            }

            $taskData['expanded'] = (int) $taskData['expanded'];
            $taskData['order'] = $order;

            if (null === $taskData['id']) {
                $taskData['userId'] = $userId;
                self::$db->insert('taskUserOption', $taskData);
            } else {
                self::$db->update('taskUserOption', $taskData, [
                    'id = ?' => $taskData['id']
                ]);
            }

            ++$order;
        }
    }

    public function expand($expand = true) {
        return $this->move(null, null, $expand);
    }

    /**
     * Funkcja, która zwraca informacje o danej aktywność, potrzebna do dynamicznego
     * doładanowanie tabeli z aktywnościami danego zadania poprzez ajax.
     * 
     * @param int $activityId Id aktywności
     * @return array $info Informacje na temat aktywności
     */
    public function getActivityData($activityId) {

        $data = \model\record\activity::get($activityId);

        $ago = $this->ago($data->creationTime);

        $userNick = user::get($data->userId)->nickname;

        $info = array(
            'taskId' => $data->taskId,
            'nr' => $data->nr,
            'creationTime' => $data->creationTime,
            'ago' => $ago,
            'userNick' => $userNick,
            'newValue' => $data->newValue
        );
        return $info;
    }

    public function prepareResponse($taskId, $id, $additionalData = array()) {

        $task = task::get($taskId);

        $activityData = $task->getActivityData($id);

        $data_1 = array(
            'status' => true,
        );
        return array_merge($data_1, $activityData, $additionalData);
    }

    public function timeCheck($timestr) {
        if ($timestr == '') {
            return '';
        } else {
            if (preg_match('/\d{1,2}:\d{2}/', $timestr)) {
                return $timestr;
            }
            $time = trim($timestr);
            if (is_numeric($time)) {
                return $time;
            } else {
                return false;
            }
        }
    }

    public function addNotifications($activityId, $sessionId) {
        $interestedUsers = \model\record\userTask::find(array('taskId = ?' => $this->getId()));
        foreach ($interestedUsers as $user) {
            $check = \model\record\notification::find(array('userId = ?' => $user['userId'], 'taskId = ?' => $this->getId(), 'seen = ?' => 0));
            if ($user['userId'] !== $sessionId && $check->count() == 0) {
                $notification = new \model\record\notification(array('userId' => $user['userId'], 'activityId' => $activityId, 'taskId' => $this->getId()));
                $notification->save();
            }
        }
    }

}
