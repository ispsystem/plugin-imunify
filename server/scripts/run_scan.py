#!/usr/bin/env python3
from argparse import ArgumentParser
import os


def make_scan(args):
    """
    Запуск сканирования на сервере клиента
    :param host: Хост
    :param params: Параметры сканирования
    :param started: Дата начала сканирования в формате timestamp
    :return:
    """
    cmd = "/usr/bin/ssh -o StrictHostKeyChecking=no root@" + args.address +\
          " '/bin/python3 /opt/ispsystem/plugin/imunify/scan.py --params " + args.params +\
          " --docroot " + args.docroot + " --started " + args.started + "'"
    os.system(cmd)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-a", "--address", help="Host")
    parser.add_argument("-d", "--docroot", help="Docroot")
    parser.add_argument("-p", "--params", help="Scan params")
    parser.add_argument("-s", "--started", help="Started date time")
    args = parser.parse_args()

    if args.address and args.docroot and args.params and args.started:
        make_scan(args)
