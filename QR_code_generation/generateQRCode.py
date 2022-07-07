from asyncio import constants
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
import argparse
import os
from dotenv import load_dotenv

load_dotenv()

BASE = "https://eu1.cloud.thethings.network/api/v3/applications"

headers = {
        "Authorization": os.getenv("TTN_TOKEN")
        }

def generateQR(data):
    """Generate the qr code
        Params:
            data: (string): Data to be placed in qr code
        returns:
            img: (any): Image of qr code
    """
    qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    return img

def makeImage(data, qr_code, filename, version):
    """Makes image final image

        Params:
            data: (dict): Data to be written onto qr code
            qr_code (PilImage): QR code to be pasted onto image
            filename (string): Filename to save qr code as
            version: (int): version code of qr code
    """
    logo = Image.open('dpiLogo.png')	
    logo = logo.resize((1000, 300), Image.ANTIALIAS)

    img = Image.new('RGB', (1240, 1748), color="white")
    width, height = img.size

    y_offset = 40

    qr_width, qr_height = 1200,1200
    qr_code = qr_code.resize((qr_width, qr_height), Image.ANTIALIAS)

    x_pos = int((width/2) - (qr_width/2))
    y_pos = int((height/2) - (qr_height/2)) + y_offset
    img.paste(qr_code,(x_pos,y_pos))
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype('./arial-cufonfonts/ARIAL.ttf', 58)

    for i, key in enumerate(data):
        x_post_text = x_pos + 120
        y_post_text = ((height/2) + (qr_height/2) - 80 + i*150) + y_offset
        text = f"Device UID: {data[key]}"
        if(key == "application_id"):
            text = f"Application ID:\n{data[key]}"
        draw.text((x_post_text, y_post_text), text, font=font, fill="#000000", stroke_width=1)

    img.paste(logo,(x_pos + 100, y_pos - 270))

    font = ImageFont.truetype('./arial-cufonfonts/ARIAL.ttf', 55)
    text = "FarmDecisionTECH™"
    draw.text(( x_pos + 120, 310 + y_offset), text, font=font, fill="#000", stroke_width=1)

    draw.text((width-100,height-100), f"v{version}", font=font, fill="#000", stroke_width=1)
    img.save(f"{filename}.png")

def generateUID():
    """Generates a random UID (Unique Identifier)

        returns:
            uid (string): generated uid
    """
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
    """Verify an appID with TTN

        Params:
            appID (string): appID to be verified
        returns:
            valid (bool): returns true if appID is valid
    
    """
    sys.stdout.write('Validating...\r')

    url = f"{BASE}/{appID}"
    r = requests.get(url, headers=headers)
    r_json = json.loads(r.content)

    sys.stdout.flush()

    if 'code' in r_json:
        return False
    else:
        return True

def getDevices(appID):
    """Get devices from a specific appID

        Params:
            appID (string): appID to get devices from
        returns:
            devices (list): list of devices from appID
    """
    sys.stdout.write('Getting device information QR Codes...\r')

    url = f"{BASE}/{appID}/devices?field_mask=attributes"
    r = requests.get(url, headers=headers)

    devices = []
    if(r.status_code == 200):
        r_json = json.loads(r.content)
        if "end_devices" in r_json:
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
        else:
            sys.stderr.write(f"Error: 'end_devices' does not exist in response. Status Code = {r.status_code}, Application ID = {appID}, Response = {r.text}")
    else:
        sys.stderr.write(f"Error: Status Code = {r.status_code}, Applicaiton ID: {appID}")

    return devices


def create_qr(appID, dev_uid = None, dev_name = None, dev_eui = None, moveDir = None, version=None, app_schema=None, expo=False, ip_port=None):

    """Prepare data and create printable qr code

        Params:
            appID (string): appID for qr code
            dev_uid (string): (Optional) uid for device on qr code. If left blank one will be randomly generated
            dev_name (string): (Optional) name for device on qr code. Only available for qr code v1
            dev_eui (string): (Optional) eui for device on qr code. Only available on qr code v1
            moveDir (string): (Optional) Save qr codes to a specific location on machine. If left blank, qr codes are saved to current working directory
            version (int): (Optional) Specify version of qr code. By default version is 2
            app_schema (string): (Optional) Specify custom app schema. By default schema is 'dma://'
            expo (bool): (Optional) Specify whether this qr code it to work for expo app. False by default
            ip_port (list): (optional) IP and port of expo server [ip, port]
    """
    dev_uid = generateUID() if dev_uid == None or dev_uid == "" else dev_uid

    qr_data=None
    text_data={ #Data to generate the text on the QR code
            "application_id":appID,
            "dev_uid":dev_uid,
        }
    if version ==1:

        if dev_name != None and dev_name != "":
            text_data['dev_name'] = dev_name

        if dev_eui != None and dev_eui != "":
            text_data['dev_eui'] = dev_eui

        qr_data = json.dumps(text_data)
        
    elif version==2:
        if expo==True: 
            #If expo true, generate a url to work with the expo app
            #Format exp://[IP]:[PORT]/--/device/?appid=[appID]&uid=[uid]&link=true
            qr_data= f'exp://{ip_port[0]}:{ip_port[1]}/--/device/?appid={appID}&uid={dev_uid}&link=true'
        else:
            #If false generate qr code with app schema 
            #Format [schema]://device/?appid=[appID]&uid=[uid]&link=true
            qr_data = f'${app_schema}://device/?appid={appID}&uid={dev_uid}&link=true'

    directory = '.' if moveDir == None else moveDir
    filename = f"{directory}/QR_Code-{appID}-{dev_uid}"
    qr_code = generateQR(qr_data)		
    makeImage(text_data, qr_code, filename, version=version)

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
    parser.add_argument("-s", help="Specify a specific UID")
    parser.add_argument("--all", help="Create a QR code for every device in application (requires -a or -g)", action="store_true")
    parser.add_argument("-v", help="Specify which version of QR code to generate (Default v2)", default=2)
    parser.add_argument("-expo", help="Generate QR code for expo app (requires -ip and -port", action="store_true", default=False)
    parser.add_argument("-ip", help="Specify ip address running expo server to generate expo QR code")
    parser.add_argument("-port", help="Specify port running expo server to generate expo QR code")
    parser.add_argument("-schema", help="Specify schema for app, (default dma)", default='dma')

    args = vars(parser.parse_args())

    #Validation of command line args
    if args['a'] is None and args['g'] is False:
        parser.error('Invalid use: Please specify either -a or -g')

    if args['a'] is not None and args['g'] is True:
        parser.error("Invalid use: Can only use either -a or -g")

    if args['t'] is not None and args['all'] is True:
        parser.error("Invalid use: Can only use --all or -t")

    if args['v'] == 1 and args['schema'] != None:
        parser.error("Schema use is not valid for QR code version 1")

    if args['expo'] == True and (args['ip'] == None or args['port']==None):
        parser.error("Invalid use: If using -expo, must specify IP address and Port of expo server")

    f = Figlet(font='slant')
    print(f.renderText('Create QR Code'))

    if os.getenv("TTN_TOKEN") == None:
        print("No bearer token detected. Please create a .env file and past the following:\nTTN_TOKEN=Bearer <Your_token_here>")
        exit()

    path = "."
    num = 0
    applications = []
    uid = None

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

    if args['s'] != None:
        uid = args['s'] if len(args['s']) == 6 else parser.error("UID is not of correct length")

    if args['g'] == True:
        applications = getApplications()

    if args['all'] == True:

        for app in applications:
            if not os.path.isdir(f"{path}/{app}"):
                os.mkdir(f"{path}/{app}")

                devices = getDevices(app)

                for i, device in enumerate(devices):
                    dash = '-' if i%2 ==0 else '|'
                    sys.stdout.write(f'Creating QR codes for application {app}...{dash}\r')
                    create_qr(app, device['uid'], moveDir=f"{path}/{app}", version=args['v'], app_schema=args['schema'], expo=args['expo'], ip_port=[args['ip'], args['port']])
                print('')

    elif args['t'] != None:
        try:
            num = int(args['t'])
        except ValueError:
            print("Invalid integer in -t")
            exit()

        for app in applications:

            if not os.path.isdir(f"{path}/{app}"):
                os.mkdir(f"{path}/{app}")

            for i in range(num):
                dash = '-' if i%2 ==0 else '|'
                sys.stdout.write(f'Creating QR codes for application {app}...{dash}\r')
                create_qr(app, dev_uid=uid, moveDir=f"{path}/{app}", version=args['v'], app_schema=args['schema'], expo=args['expo'], ip_port=[args['ip'], args['port']])

            print('')


    else:
        create_qr(applications[0], version=args['v'], app_schema=args['schema'], expo=args['expo'], ip_port=[args['ip'], args['port']])


    print(f"QR code(s) successfully generated")

if __name__ == "__main__":

    main()













