#!/usr/bin/env python3
"""запуск задачи на сканирование"""
from argparse import ArgumentParser
import os


def make_scan(params):
    """
    Запуск сканирования на сервере клиента
    :param params: Параметры сканирования
    :return:
    """
    cmd = "/usr/bin/ssh -o StrictHostKeyChecking=no root@" + params.address +\
          " '/bin/python3 /opt/ispsystem/plugin/imunify/scan.py --params " + params.params +\
          " --docroot " + params.docroot + " --started " + params.started + "'"
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
