import qrcode
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw 
import json
import random
import string
import requests
from pyfiglet import Figlet
import sys
import time
import argparse
import os

BASE = "https://eu1.cloud.thethings.network/api/v3/applications"

headers = {
    "Authorization":"Bearer NNSXS.7F3JEGKWDTXOG6NCF2NHF3RBFLKNCSLRUKR37LY.SUXH6HZGBK7WTHRDS3NT4XKGZANMXMHKKHQTW4VKF4SU2KCNAQAQ",
    }

def generateQR(jsonData, filename):

	qr = qrcode.QRCode(
	    version=1,
	    error_correction=qrcode.constants.ERROR_CORRECT_L,
	)
	qr.add_data(jsonData)
	qr.make(fit=True)

	img = qr.make_image(fill_color="black", back_color="white")
	return img

def makeImage(data, qr_code, filename):

	logo = Image.open('dpiLogo.png')

	img = Image.new('RGB', (1240, 1748), color="white")
	width, height = img.size

	qr_width, qr_height = 1200,1200
	qr_code = qr_code.resize((qr_width, qr_height), Image.ANTIALIAS)

	x_pos = int((width/2) - (qr_width/2))
	y_pos = int((height/2) - (qr_height/2))
	img.paste(qr_code,(x_pos,y_pos))
	draw = ImageDraw.Draw(img)
	font = ImageFont.truetype('./arial-cufonfonts/ARIAL.ttf', 55)

	for i, key in enumerate(data):
		x_post_text = width/2
		y_post_text = (height/2) + (qr_height/2) - 20 + i*60

		text = f"{key} - {data[key]}"
		draw.text((x_post_text, y_post_text), text, font=font, fill="#000000", stroke_width=1, anchor="mm")

	img.paste(logo,(30,30))
	img.save(f"{filename}.png")

def generateUID():
	#Generates a random UID
	uids = [i.strip('\n') for i in open('uids.txt').readlines()]

	genUID = ""
	#Until UID is a unique uid
	while True:
		charSet = string.ascii_uppercase + string.digits
		for i in range(6):
			genUID += random.choice(charSet)

		if genUID not in uids:
			break;

	with open('uids.txt','a') as f:
		f.writelines(genUID + '\n')
	return genUID

def verifyApp(appID):

	# Verifies application ID with TTN
	sys.stdout.write('Validating...\r')

	url = f"{BASE}/{appID}"
	r = requests.get(url, headers=headers)
	r_json = json.loads(r.content)

	sys.stdout.flush()

	if 'code' in r_json:
		return False
	else:
		return True

def getAllDevices(appID):

	sys.stdout.write('Getting device information QR Codes...\r')

	url = f"{BASE}/{appID}/devices?field_mask=attributes"
	r = requests.get(url, headers=headers)
	r_json = json.loads(r.content)

	devices = []
	req_devices = r_json['end_devices']

	for device in req_devices:
		uid = ""

		try:
			uid = device['attributes']['uid']
			print(f"Device {device['ids']['device_id']} already has UID {uid}, skipping uid generation")

		except KeyError:
			uid = generateUID()

		devices.append({
			'name':device['ids']['device_id'],
			'uid':uid
			})

	return devices


def create(appID, dev_uid = None, dev_name = None, dev_eui = None, moveDir = None):

	dev_uid = generateUID() if dev_uid == None or dev_uid == "" else generateUID()

	data = {
	   "application_id":appID,
	   "dev_uid":dev_uid,
	}

	if dev_name != None and dev_name != "":
		data['dev_name'] = dev_name

	if dev_eui != None and dev_eui != "":
		data['dev_eui'] = dev_eui


	directory = '.' if moveDir == None else moveDir

	filename = f"{directory}/QR_Code-{appID}-{dev_uid}"

	jsonData = json.dumps(data)
	qr_code = generateQR(jsonData, filename)		
	makeImage(data, qr_code, filename)

def getApplications():

	sys.stdout.write('Retrieving applications...\r')

	url = f"{BASE}"
	r = requests.get(url, headers=headers)
	r_json = json.loads(r.content)

	applications = r_json['applications']
	app_ids = [app['ids']['application_id'] for app in applications]
	
	return app_ids

def main():

	parser = argparse.ArgumentParser(description='Create a QR code for TTN device')
	parser.add_argument("-a", help="Specify an Application ID")
	parser.add_argument("-p", help="Specify a path to save the files to")
	parser.add_argument("-t", help="Specify a number of QR codes to generate")
	parser.add_argument("-g", help="Go through every application on TTN", action="store_true")
	parser.add_argument("--all", help="Create a QR code for every device in application (requires -a or -g)", action="store_true")

	args = vars(parser.parse_args())

	if args['a'] is None and args['g'] is False:
		parser.error('Invalid use: Please specify either -a or -g')

	if args['a'] is not None and args['g'] is True:
		parser.error("Invalid use: Can only use either -a or -g")

	f = Figlet(font='slant')
	print(f.renderText('Create QR Code'))

	path = "."
	num = 0
	applications = []

	if args['p'] != None:
		if os.path.isdir(args['p']):
			path = args['p'].rstrip('/')
		else:
			parser.error(args['p'] + "Is not a valid path")

	if args['a'] != None:

		if verifyApp(args['a']):
			applications.append(args['a'])

		else:
			print("Application ID is invalid, please try again")
			exit()

	if args['t'] != None:
		try:
			num = int(args['t'])
		except ValueError:
			print("Invalid integer in -t")
			exit()

	if args['g'] == True:
		applications = getApplications()

	if args['all'] == True:

		for app in applications:
			if not os.path.isdir(f"{path}/{app}"):
				os.mkdir(f"{path}/{app}")

				devices = getAllDevices(app)

				for i, device in enumerate(devices):
					dash = '-' if i%2 ==0 else '|'
					sys.stdout.write(f'Creating QR codes for application {app}...{dash}\r')
					create(app, device['uid'], moveDir=f"{path}/{app}")

	elif args['t'] != None:
		for app in applications:

			if not os.path.isdir(f"{path}/{app}"):
				os.mkdir(f"{path}/{app}")

			for i in range(num):
				dash = '-' if i%2 ==0 else '|'
				sys.stdout.write(f'Creating QR codes for application {app}...{dash}\r')
				create(app,moveDir=f"{path}/{app}")

			print('')

	else:
		create(applications[0])

	
	print(f"QR code(s) successfully generated")

if __name__ == "__main__":

	main()













