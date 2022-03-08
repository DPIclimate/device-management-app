# Script to increment version code number, required for android.
# "versionCode" is independent of "version". 
# Read more https://developer.android.com/studio/publish/versioning

import json

file = json.loads(str(open('../app.json','r').read()))

versionCode = file['expo']['android']['versionCode']
versionCode = int(versionCode)+1

file['expo']['android']['versionCode'] = versionCode

f = open('../app.json','w').write(json.dumps(file, indent=2))