#!/usr/bin/env python3
from argparse import ArgumentParser
import os


def make_scan(host, params, started):
    cmd = "/usr/bin/ssh -o StrictHostKeyChecking=no root@" + host +\
          " '/bin/python3 /opt/ispsystem/plugin/imunify/scan.py --params " + params + " --started " + started + "'"
    os.system(cmd)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-a", "--address", help="Host")
    parser.add_argument("-p", "--params", help="Scan params")
    parser.add_argument("-s", "--started", help="Started date time")
    args = parser.parse_args()

    if args.address and args.params and args.started:
        make_scan(args.address, args.params, args.started)
