{$this->content}
{*<link href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css" type="text/css" rel="stylesheet">*}
<link href="/jquery-ui.css" type="text/css" rel="stylesheet">
{* out <script src="//code.jquery.com/jquery-1.11.3.min.js" type="text/javascript"></script>*}
{*<script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js" type="text/javascript"></script>*}
<script src="/jquery-ui.min.js" type="text/javascript"></script>
<script src="/jquery-migrate-1.2.1.js"></script>
{*<script src="//code.jquery.com/jquery-migrate-1.2.1.js"></script>*}

<script src="//cdn.jsdelivr.net/jquery.ui-contextmenu/1/jquery.ui-contextmenu.min.js"></script>
<link href="/fancytree-master/src/skin-win7/ui.fancytree.css" rel="stylesheet" type="text/css">
<script src="/fancytree-master/src/jquery.fancytree.js" type="text/javascript"></script>
<script src="/fancytree-master/src/jquery.fancytree.dnd.js" type="text/javascript"></script>
<script src="/fancytree-master/src/jquery.fancytree.edit.js" type="text/javascript"></script>
<script src="/fancytree-master/src/jquery.fancytree.gridnav.js" type="text/javascript"></script>
<script src="/fancytree-master/src/jquery.fancytree.table.js" type="text/javascript"></script>

<script src="/bootstrap-datepicker/js/bootstrap-datepicker.js"></script>
<script src="/bootstrap-datepicker/js/locales/bootstrap-datepicker.pl.js" charset="UTF-8"></script>


<div id="splitted">
    <div style="padding:10px; background-color: snow;" class="fancytree">
        <table id="treetable">
            <colgroup>
                <col width="30px"></col>
                <col width="30px"></col>
                <col width="*"></col>
                <col width="50px"></col>
                <col width="30px"></col>
            </colgroup>
            <thead>
                <tr>
                    <th class="text-center"></th>
                    <th class="text-center">#</th>
                    <th class="text-center">Task</th>
                    <th class="text-center">Done</th>
                    <th class="text-center">User</th>
                    <th class="text-center input-column">Deadline</th>
                    <th class="text-center input-column">Start</th>
                    <th class="text-center input-column">End</th>
                        {*<th class="text-center">Pre</th>*}
                    <th class="text-center input-column">Estim</th>
                    <th class="text-center input-column">Time</th>
                </tr>
            </thead>
            <tbody>
                <tr> <td></td> <td></td> <td></td> <td></td> </tr>
            </tbody>
        </table>
    </div>
    <div class="fancydetails">
        <div class="taskdetails">
            <h3></h3>
            <textarea class="task-info"></textarea>
            <p id="desc-error" style="display: none; color: red;">Panie! Pusty wartość?</p>
            <div class="interested-users">
                <p></p>
            </div>        
        </div>
        <div class="history-comments">
            <div class="load-history"><i class="fa fa-chevron-up"></i></div>
            <div class="taskhistory"></div>
            <div class="add-comment"></div>
        </div>
    </div>
</div>