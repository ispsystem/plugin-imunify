from zipfile import ZipFile
from requests import post, get, delete
from os import remove
from time import sleep
from json import loads
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from urllib import parse

# TODO(d.smirnov): Написать полноценный тест на добавление плагина

z = ZipFile("test.zip", "w")

try:
    z.write("meta.json")
    z.write("imunify.py")
    z.write("playbooks/imunify.yml")
    z.write("scripts/scan.py")
    z.write("scripts/run_scan.py")
    z.write("schemas/scan.json")
finally:
    z.close()

# r = post("https://localhost/auth/v3/first_user_invite", verify=False)
# print(r.text)
#
# token = loads(r.text)['token']
#
# r = post("https://localhost/auth/v3/token/{}/invite_first_user".format(token),
#          json={"email": "admin@example.com",
#                "password": "WjGqfzhInWwzBh"}, verify=False)

r = post("https://localhost/auth/v3/auth", json={"email": "obthioib@drope.ml", "password": "123456"}, verify=False)

print(r.content)

ses6 = loads(r.content.decode())["session"]
cookies = {'ses6': ses6}

r = post("https://localhost/plugin/v3/plugin/upload", files={'plugin': open("test.zip", 'rb')}, cookies=cookies, verify=False)
print(r.text)

plugin_id = r.json()['plugin_id']

remove("test.zip")

r = get("https://localhost/plugin/v3/plugin/vepp", cookies=cookies, verify=False)
print(r.content)

r = get("https://localhost/plugin/v3/plugin/vm", cookies=cookies, verify=False)
print(r.content)

r = get("https://localhost/plugin/v3/plugin", cookies=cookies, verify=False)
print(r.content)

r = get("https://localhost/plugin/v3/plugin/imunify/info", cookies=cookies, verify=False)
print(r.content)

r = get("https://localhost/plugin/imunify/", verify=False)
print(r.content)

attempts = 10

while attempts > 0:
    r = get("https://localhost/plugin/api/imunify/feature", cookies=cookies, verify=False)
    if r.status_code != 200:
        sleep(0.5)
        attempts -= 1
    else:
        print(r.content)
        break

#
# r = get("https://localhost/plugin/v3/plugin/not_exist/info", cookies=cookies, verify=False)
# print(r.content)
# #
# r = post("https://localhost/plugin/v3/plugin/1/disable", json={}, cookies=cookies, verify=False)
# print(r.content)
#
# r = delete("https://localhost/plugin/v3/plugin/1", cookies=cookies, verify=False)
# print(r.content)
