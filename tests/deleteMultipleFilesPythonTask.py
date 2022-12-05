# from __future__ import print_function

# import httplib2
# import os

# from oauth2client.file import Storage
# from apiclient import discovery
# from oauth2client import client
# from oauth2client import tools

# try:
#     import argparse
#     flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
# except ImportError:
#     flags = None

# start = 0
# end = 1000000000

# def readFile(filePath):
#     return open(filePath).read().split("\n")

# def get_credentials():
#     SCOPES = 'https://www.googleapis.com/auth/drive'
#     APPLICATION_NAME = 'Drive API Remover'

#     credential_path = os.path.join(os.getcwd(), 'python_access_token.json')
#     store = Storage(credential_path)
#     credentials = store.get()
#     if not credentials or credentials.invalid:
#         flow = client.flow_from_clientsecrets('client_secret.json', SCOPES)
#         flow.user_agent = APPLICATION_NAME
#         if flags:
#             credentials = tools.run_flow(flow, store, flags)
#         else: # Needed only for compatibility with Python 2.6
#             credentials = tools.run(flow, store)
#         print('Storing credentials to ' + credential_path)
#     return credentials

# def callback(request_id, response, exception):
#     if exception:
#         print("Exception:", exception)

# def deleteFiles(files):
#     credentials = get_credentials()
#     http = credentials.authorize(httplib2.Http())
#     service = discovery.build('drive', 'v3', http=http)

#     while(len(files) > 0):    
#         batch = service.new_batch_http_request(callback=callback)

#         batchSize = min(len(files),99)
#         for i in range(batchSize):
#             print("Deleting", files[0])
#             batch.add(service.files().delete(
#                 fileId= files[0]
#             ))
#             del files[0]

#         batch.execute(http=http)

# def getAnyFile(folder):
#     files = os.listdir(folder)
#     for file in files:
#         if int(file) >= int(start) and int(file) <= int(end):
#             return file
#     return None

# def main():
#     while(True):
#         fileName = getAnyFile('files/')
#         if fileName == None:
#             print('No file exists to delete. Exiting...')
#             break

#         filePath = 'files/' + fileName
#         files = readFile(filePath)
#         deleteFiles(files)
#         os.remove(filePath)

# if __name__ == '__main__':
#     main()