<div id="wrapper">
    <div id="register-content">
        <h2>Rejestracja nowego użytkownika</h1>
            <div id="register-left">
                <span class="title">Dane logowania:</span></br>
                <input type="text" name="login_txt" id="login-text" class="required" placeholder="Login(*)"></br>
                <p class="errors" id="login-text-error"></p>
                <input type="email" name="email_txt" id="email-text" class="required" placeholder="e-mail(*)"></br>
                <p class="errors" id="email-text-error"></p>
                <input type="password" name="password_txt" id="password-text" class="required" placeholder="Hasło(*)"></br>
                <p class="errors" id="password-text-error"></p>
                <input type="password" name="password_2_txt" id="password2-text" class="required" placeholder="Powtórz hasło(*)"></br>
                <p class="errors" id="password2-text-error"></p>
            </div>
            <div id="register-right">
                <span class="title">Informacje:</span></br>
                <input type="text" name="name_txt" id="name-text" class="required" placeholder="Imię(*)"></br>
                <p class="errors" id="name-text-error"></p>
                <input type="text" name="surname_txt" id="surname-text" class="required" placeholder="Nazwisko(*)"></br>
                <p class="errors" id="surname-text-error"></p>
                <input type="text" name="nick_txt" id="nick-text" placeholder="Nick"></br>
                <p class="errors" id="nick-text-error"></p>
                <input type="text" name="phone_txt" id="phone-text" placeholder="nr. telefonu"></br>
            </div>
    </div>
    <div id="register-addintional">
        <span class="title">Dodatkowe:</span></br>
        <span id="active">Aktywny:</span><input type="checkbox" checked="checked" id="active-check"></br></br>
        <span id="teams">Zespół:</br>
            <select id="register-select" multiple="multiple">
                {foreach from=$this->teams item=$team}
                    <option value="{$team->id}">{$team->name}</option>
                {/foreach}
            </select></br>
            <p class="errors" id="teams-text-error"></p></br>
            <button id="addUser">
                Dodaj Użytkownika
            </button>
        </span>
    </div>
    <div id="newTeams">
        <h3>Dodawanie nowego zespołu:</h3>
        <input type="text" name="team_txt" id="team-text" placeholder="Nazwa zespołu"></br>
        <p class="errors" id="team-text-error" style="display: none;">*Wymagane</p>
        <span id="teams">Kierownik zespołu:</span></br>
        <select id="user-select">
                <option id="opt_0" value="0">-</option>
            {foreach from=$this->users item=$user}  
                <option id="opt_{$user->id}" value="{$user->id}">{$user->name} {$user->surname}</option>
            {/foreach}

        </select></br>
        <button id="addTeam">
            Dodaj Zespół
        </button>
    </div>
</div>
<div id="usersList">
    <span class="title">Lista użytkowników:</span>

    <table id="userTable">
        <thead>
            <tr>
                <th>Usuń</th>
                <th>ID</th>
                <th>Nick</th>
                <th>Imie</th>
                <th>Nazwisko</th>
                <th>Zespoł</th>
                <th>Zmiana</th>
            </tr>
        </thead>

        <tbody>
            {foreach from=$this->users item=user} 
                {if $user->id == '1'}
                {else}  
                    <tr id="item_{$user->id}">
                        <td><div class="del_wrapper" align="center">
                                <a href="" class="del_button" id="del-{$user->id}">
                                    <i class="fa fa-trash fa-2x"></i></a></div></td>
                        <td>{$user->id}.</td>
                        <td>{$user->nick}</td>
                        <td>{$user->name}</td>
                        <td>{$user->surname}</td>
                        <td>{implode(', ', $user->getTeams()->name)}</td>
                        <td><select size="3" id="register-select" multiple="multiple">
                                {foreach from=$this->teams item=$team}
                                    <option value="{$team->id}">{$team->name}</option>
                                {/foreach}
                            </select>
                        </td>
                        <td><div class="del_wrapper" align="center">
                                <a href="" class="edit_button" id="edit-{$user->id}">
                                    <i class="fa fa-pencil"></i></a></div></td>
                    </tr>
                {/if}
            {/foreach}
        </tbody>
    </table>
</div>