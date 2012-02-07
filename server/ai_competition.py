import httplib
import json

from ai import AI as simpleAI
from ai_new import AI as advancedAI
from misc import GAME_ENDED
from httplib import HTTPException
from time import sleep

url = 'localhost:8080' #'server.smallworld' #'localhost:8080' #

def sendCmd(conn, data):
	conn.request("POST", "", json.dumps(data))
	res = conn.getresponse().read()
	return json.loads(res) 
	
def main(game=None, num=None):	
	logFilesCnt = 0
	try:
		conn = httplib.HTTPConnection(url)
		for i in range(10):
                        sendCmd(conn, {'action' : 'resetServer'})
                        sendCmd(conn, {'action' : 'createDefaultMaps'})
                        sendCmd(conn, {'action' : 'register', 'username': 'user', 'password': 'password'})
                        sid = sendCmd(conn, {'action' : 'login', 'username': 'user', 'password': 'password'})['sid']
                        gameId = sendCmd(conn, {'action' : 'createGame', 'sid': sid, 'gameName': 'someGame', 'mapId': 8,'playersNum': 2, 'ai': 2})['gameId']  #8
                        logFile = open('logs\\ai_results.log', 'a')
                        userInfo = sendCmd(conn, {'action' : 'aiJoin', 'gameId' : gameId})
                        #simpleAI(url, gameId, userInfo['sid'], userInfo['id'], logFile)
                        advancedAI(url, gameId, userInfo['sid'], userInfo['id'], logFile)
                        userInfo = sendCmd(conn, {'action' : 'aiJoin', 'gameId' : gameId})
                        #advancedAI(url, gameId, userInfo['sid'], userInfo['id'], logFile)
                        simpleAI(url, gameId, userInfo['sid'], userInfo['id'], logFile)
                        while 1:
                                gameState = sendCmd(conn, {'action' : 'getGameState', 'gameId': gameId})['gameState']['state']
                                if gameState == GAME_ENDED: break
                                sleep(30)
	except HTTPException, e:
		print e
		conn.close()


if __name__ == "__main__":
        main()
        
