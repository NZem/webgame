function registerResponse(data)
{
	$('#registerLoginOutput').show();
	switch(data['result'])
	{
		case 'badPassword':
			$('#registerLoginOutput span').text('Invalid password');
			break;
		case 'badUsername':
			$('#registerLoginOutput span').text('Invalid username');
			break;
		case 'usernameTaken':
			$('#registerLoginOutput span').text('User with the same name has already registered');
			break;
		case 'ok':
			$('#registerLoginOutput').hide();
			alert("You were registered, congratulations!");
			Interface.changeOnRegistration();
			break;
		default:
			$('#registerLoginOutput span').text('Unknown server response' + data.toString());
	}
}

function loginResponse(data, param)
{
	$('#registerLoginOutput').show();
	var sid, username;
	switch(data['result'])
	{
		case 'badPassword':
			$('#registerLoginOutput span').text('Bad password format');
		case 'badUsername':
			$('#registerLoginOutput span').text('Bad username format');
		case 'badUsernameOrPassword':
			$('#registerLoginOutput span').text('Invalid username or password');
			break;
		case 'ok':
			$('#registerLoginOutput').hide();
			sid = data['sid'];
			userId = data['userId'];
			username = param ? 'user' : $('#username').val();
			Client.currentUser = new User(userId, username, sid);
			Interface.changeOnLogin();
			if (param)
			{
				query = makeQuery(['action', 'sid', 'gameName', 'gameDescription', 'mapId', 'ai'],
					['createGame', sid, '1', '', 1, 2]);
				sendQuery(query, createGameResponse, false, 2);
			}
			break;
		default:
			$('#registerLoginOutput span').text('Unknown server response' + data.toString());
	}
}

gotBadUserSid = function()
{
	alert('Your sid became obsolete, please login once again');
	if (Client.currentUser)
		delete Client.currentUser;
	if (Client.currGameState)
		delete Client.currGameState;
	Interface.changeOnLogout();
}
	
function logoutResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			delete Client.currentUser;
			Interface.changeOnLogout();
			break;
		default:
			console.error('Unknown server response' + data.toString());
	}
}

function getGameListResponse(data)
{
	if (data['result'] != 'ok' || !data['games'])
	{
		console.error("Unknown server response: " + data.toString());
		return;
	}
	Interface.fillGameList(data['games']);
}

function getMapListResponse(data, beforeCreateGame)
{
	if (data['result'] != 'ok' || !data['maps'])
	{
		console.error("Unknown server response: " + data.toString());
		return;
	}
	Client.mapList = data['maps'];
	$('#mapList').empty();
	$('#mapChooseTemplate').tmpl(Client.mapList).appendTo('#mapList');
	$('#aiCnt').spinner('option', 'max', Client.mapList[0].playersNum);
	if (beforeCreateGame)
		$('#createGameForm').dialog('open');
}

function joinGameResponse(data)
{
	switch(data['result'])
	{
		case 'badGameState': 
			alert('You can not join game that have been already started or finished');
			break;
		case 'alreadyInGame': 
			alert("You're already in game");
			break;
		case 'tooManyPlayers': 
			alert('There is no free space on map');
			break;
		case 'ok':
			Client.currentUser.gameId = Client.newGameId;
			delete Client.newGameId;
			Interface.changeOnJoin();
			break;
		default:
			console.error("Unknown server response: " + data.toString());
	}
}

function leaveGameResponse(data)
{
	switch(data['result'])
	{
		case 'notInGame': //may it be???
			alert("You're not playing");
			break;
		case 'ok':
			delete Client.currentUser.gameId;
			delete Client.currentUser.gameIndex;
			Interface.changeOnLeave();
			break;
		default:
			console.error("Unknown server response: " + data.toString());
	}
}

function createGameResponse(data, ai)
{
	switch(data['result'])
	{
		case 'badGameName': 
		case 'gameNameTaken': 
			$('createGameOutput').show();
			$('createGameOutput').text('Invalid game name');
			break;
		case 'badGameDescription': 
			$('createGameOutput').show();
			$('createGameOutput').text('Invalid game description');
			break;
		case 'alreadyInGame': 
			$('createGameOutput').show();
			$('createGameOutput').text("You're already playing");
			break;
		case 'ok':
			Client.currentUser.gameId = data.gameId;
			Interface.changeOnCreateGame(data);
			$('#createGameForm').dialog('close');
			break;
		default:
			console.error('Unknown server response' + data.toString());
	}
}

function setReadinessStatusResponse(data)
{
	switch(data['result'])
	{
		case 'notInGame': 
			alert("You're not playing");
			break;
		case 'badGameState': 
			alert('You cannot do it while playing');
			break;
		case 'ok':
			Interface.changeOnSetReadinessStatus();
			break;
		default:
			console.error('Unknown server response' + data.toString());
	}
}
function getMessagesResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			Client.messages = Client.messages.concat(data['messages']);
			Interface.changeOnGetMessages();
			break;
		default:
			console.error('Unknown server response' + data);
	}
}
function sendMessageResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			$('#messageBox').val('');
			updateChat();
			break;
		default:
			console.error('Unknown server response' + data);
 	}
}

function uploadMapResponse(data)
{
	$('#uploadMapOutput').show();
	switch(data['result'])
	{
		case 'mapNameTaken':
			$('#uploadMapOutput').text('Map with the same name already exists'); //?!!!
			break;
		case 'badMapName':
			$('#uploadMapOutput').text('Invalid map name'); 
			break;
		case 'badPlayersNum':
			$('#uploadMapOutput').text('Invalid number of players'); 
			break;
		case 'badTurnsNum':
			$('#uploadMapOutput').text('Invalid number of turns'); 
			break;
		case 'badRegions':
			$('#uploadMapOutput').text('Bad regions description'); 
			break;
		case 'ok':
			$('#uploadMapOutput').hide();
			updateMapList(false);
			break;
		default:
			$('#uploadMapOutput').hide();
			console.error('Unknown server response' + data);
 	}
}

function getGameStateResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			Client.currGameState = createGameByState(data['gameState']);
			if (game().state !== GAME_WAITING) 
				Graphics.assignColors();
			Interface.updateGameTab();
			break;
		default:
			console.error('Unknown server response' + data);
 	}
}

function selectRaceResponse(data)
{
	switch(data['result'])
	{
		case 'badMoneyAmount':
			alert('Not enough coins for race selecting'); 
			break;
		case 'ok':
			Client.currentTokenBadge = data['tokenBadgeId'];
			$('#showVisibleTokenBadgesDialog').dialog('close');
			break;
		default:
			console.error('Unknown server response' + data);
 	}
}

function declineResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			Graphics.deleteBadge(Graphics.freeTokens.ui.power, Graphics.freeTokens);
			Graphics.deleteBadge(Graphics.freeTokens.ui.race, Graphics.freeTokens);
			finishTurnClick();
			break;
		default:
			console.error('Unknown server response' + data);
 	}
}

function finishTurnResponse(data)
{
	var msg;
	switch(data['result'])
	{
		case 'ok':
			//msg = data['incomeCoins'] ? ('You got ' + data['incomeCoins'] + ' coins on this turn.\n') : '';
			//msg += 'Total coins number: ' + data['coins'] + '\n';
			//msg += 'Statistics: \n';
			msg = '';
			sum = 0;
			for (var i = 0; i < data['statistics'].length; ++i)
			{
				msg += data['statistics'][i][0] + ': ' + data['statistics'][i][1] + '\n';
				sum += data['statistics'][i][1];
			}
			msg = 'You got ' + sum + ' coins on this turn.\nStatistics: \n' + msg;
			alert(msg);
			break; 
		default:
			console.error('Unknown server response' + data);
 	}
}

function conquerResponse(data)
{
	switch(data['result'])
	{
		case 'regionIsImmune':
			alert('Region is immune'); 
			break;
		case 'badTokensNum':
			alert('Not enough tokens, dice: ' + data['dice']); 
			break;
		case 'ok':
			alert('Your attack was successfull' + 
				(data['dice'] !== undefined ? ', \n dice: ' + data['dice'] : ''));
			Interface.prepareForConquest();
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}


function selectFriendResponse(data)
{
	switch(data['result'])
	{
		case 'badFriend':
			alert('Bad friend'); 
			break;
		case 'ok':
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function throwDiceResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			alert('Dice: ' + data['dice']);
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function enchantResponse(data)
{
	switch(data['result'])
	{
		case 'badAttackedRace':
			alert('You cannot attack yourself');
			break;
		case 'nothingToEnchant': 
		case 'cannotEnchantMoreThanOneToken':
			alert('You can enhcant only one token');
			break;
		case 'cannotEnchantDeclinedRace':
			alert('You can enhcant only active race');
			break;
		case 'noMoreTokensInStorageTray':
			alert("There aren't free tokens in storage tray");
			break;
		case 'ok':
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function dragonAttackResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			user().freePowerTokens = 0;
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function redeployResponse(data)
{
	switch(data['result'])
	{
		case 'notEnoughTokensForRedeployment':
			alert('not enough tokens for redeployment'); 
			break;
		case 'noTokensForRedeployment':
			alert('no tokens for redeployment'); 
			break;
		case 'userHasNoRegions':
			alert('user has no regions'); 
			break;
		case 'badTokensNum':
			alert('badTokensNum'); 
			break;
		case 'badEncampmentsNum':
			alert('badEncampmentsNum');
			break;
		case 'tooManyFortifieldsInRegion':
			alert('tooManyFortifieldsInRegion'); 
			break;
		case 'tooManyFortifieldsOnMap':
			alert('tooManyFortifieldsOnMap'); 
			break;
		case 'tooManyFortifields':
			alert('tooManyFortifields');
			break;
		case 'notEnoughEncampmentsForRedeployment':
			alert('notEnoughEncampmentsForRedeployment');
			break;
		case 'badSetHeroCommand':
			alert('badSetHeroCommand');
			break;
		case 'ok':
			game().redeployStarted = false;
			user().freePowerTokens = 0;
			console.log(Graphics.freeTokens.ui.power);
			Graphics.deleteBadge(Graphics.freeTokens.ui.power, Graphics.freeTokens);
			Graphics.deleteBadge(Graphics.freeTokens.ui.race, Graphics.freeTokens);
			$('#changeRedeployStatus').html('Start redeploy');
			if (!user().specPower().canActAfterRedeployment())
				finishTurnClick();
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function defendResponse(data)
{
	switch(data['result'])
	{
		case 'noTokensForRedeployment':
			alert('no tokens for redeployment'); 
			break;
		case 'badTokensNum':
			alert('badTokensNum'); 
			break;
		case 'notEnoughTokens':
			alert('not enough tokens');
			break;
		case 'thereAreTokensInTheHand':
			alert('there are tokens in the hand'); 
			break;
		case 'ok':
			game().defendStarted = false;
			Graphics.deleteBadge(Graphics.freeTokens.ui.race, Graphics.freeTokens);
			Graphics.resetHighlight(game().map)
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function saveGameResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			$('#savedGameActions').val($.toJSON(data['actions']));
			$('#saveGameForm').dialog('open');
			break; //state will be changed on the next getGameState()
		default:
			console.error('Unknown server response' + data);
 	}
}

function loadGameResponse(data)
{
	switch(data['result'])
	{
		case 'ok':
			alert('Game was successfully loaded');
			$('#loadGameForm').dialog('close');
			Interface.checkForExistingGame();
			break; 
		default:
			$('#loadGameOutput').html('Invalid actions: ' + data['result']);
			$('#loadGameOutput').show();
 	}
}
