#import sys
#import os

#path = os.path.dirname(__file__)
#sys.path.append(path)
#os.chdir(path)

import parseJson
import misc
import json
from paste import httpserver

def application(environ, start_response):
    #start_response('200 OK', [('Content-Type', 'text/plain')])
    #return str([environ])
    #print request_body
    #return parseJson.parseJsonObj(json.load(request_body))
    if environ['REQUEST_METHOD'] == 'POST':
        try:
            request_body_size = int(environ['CONTENT_LENGTH'])
            request_body = environ['wsgi.input'] #.read(request_body_size)
        except (TypeError, ValueError):
            return 'Cannot read request body'
        try:
            misc.LAST_SID = 0
            misc.LAST_TIME = 0
            response_body = parseJson.parseJsonObj(json.load(request_body))
        except BaseException, e:
            response_body = 'An error %s occured while trying parse json: %s' % (e, request_body)
        status = '200 OK'
        headers = [('Content-type', 'text/plain')]
        start_response(status, headers)
        print "yy"
        print str(response_body)
        return json.dumps(response_body) #str(response_body)
    else:
        response_body = ''
        status = '200 OK'
        headers = [('Content-type', 'text/html'),
                   ('Content-Length', str(len(response_body)))]
        start_response(status, headers)
        return [response_body]

#from wsgiref import simple_server
#server = simple_server.WSGIServer(
#            ('', 8080),
#            simple_server.WSGIRequestHandler,
#        )
#server.set_app(application)
#server.serve_forever()

if __name__ == '__main__':
    httpserver.serve(application, host='0.0.0.0', port='8080') #'127.0.0.1'
