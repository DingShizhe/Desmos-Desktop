#!/usr/bin/env python3

import requests
import re
import html
import json

import os, sys

url = sys.argv[1]

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0'
}

def get_desmos_html(url):
    n = os.path.basename(url)
    r = requests.get(url, headers=headers)
    if r.status_code is not 200:
        return None
    return (r.text, n)

def html_2_desmos_file(data):
    text, name = data
    result = re.findall(r'data\-load\-data="(.*?)"', text)
    if not len(result) == 1:
        return
    res = html.unescape(result[0])

    res = json.loads(res)

    output = res['graph']['state']

    with open(name+'.des', 'w') as fo:
        json.dump(output, fo, ensure_ascii=False, indent=4)


# for f_n in os.listdir('.'):
#     if f_n.endswith('html'):
#         get_desmos_file(f_n)

text = get_desmos_html(sys.argv[1])
html_2_desmos_file(text)