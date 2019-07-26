#!/usr/bin/env python3
from argparse import ArgumentParser
import os


def make_scan(host, path, started):
    cmd = "/usr/bin/ssh -o StrictHostKeyChecking=no root@" + host +\
          " '/bin/python3 /opt/ispsystem/plugin/imunify/scan.py --path " + path + " --started " + started + "'"
    os.system(cmd)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-a", "--address", help="Host")
    parser.add_argument("-p", "--path", help="Path")
    parser.add_argument("-s", "--started", help="Started date time")
    args = parser.parse_args()

    if args.address is not None and args.path is not None:
        make_scan(args.address, args.path, args.started)
