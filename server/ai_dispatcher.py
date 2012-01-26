import httplib
import json
import sys

from ai import AI
from httplib import HTTPException
from time import sleep

url = 'localhost:8080'

def sendCmd(conn, data):
	conn.request("POST", "", json.dumps(data))
	res = conn.getresponse().read()
	return json.loads(res) 
	

def dispatch(conn, gameId, logFile):
	userInfo = sendCmd(conn, {'action' : 'aiJoin', 'gameId' : gameId})
	return AI(url, gameId, userInfo['sid'], userInfo['id'], logFile)
		
def main(game=None, num=None):	
	logFilesCnt = 0
	try:
		conn = httplib.HTTPConnection(url)
		if game:
                        logFile = open('logs\\ai_results%d.log' % logFilesCnt, 'w')
			logFilesCnt += 1
                        for ai in range(num): dispatch(conn, game, logFile)
                        return
		while 1:
			gameList = sendCmd(conn, {'action' : 'getGameList'})['games']
			for game in gameList:
				aiNum = game['aiRequiredNum'] or 0
				if aiNum:
					logFile = open('logs\\ai_results%d.log' % logFilesCnt, 'w')
					logFilesCnt += 1
					for i in range(aiNum):	dispatch(conn, game['gameId'], logFile)
			sleep(5)
	except HTTPException, e:
		print e
		conn.close()

if __name__ == "__main__":
        argc = len(sys.argv)
        if argc > 1:
                game = int(sys.argv[1])
                num = int(sys.argv[2])
                main(game, num)
        else:
                main()
			
					
			
			

