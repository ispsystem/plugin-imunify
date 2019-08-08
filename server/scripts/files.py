#!/usr/bin/env python3
"""Операции с файлами"""
import json
import subprocess
from argparse import ArgumentParser


FILE_ACTION_DELETE = "delete"
OPERATION_STATUS_SUCCESS = "success"
OPERATION_STATUS_FAILED = "failed"


def get_ssh_cmd(host: str):
    """
    Возвращает основные команды для достпа на удаленный сервер
    :param host: Хост на котором будет выполняться операция
    :return:
    """
    return ["/usr/bin/ssh", "-o", "StrictHostKeyChecking=no", "root@" + host]


def delete_files(params):
    """
    Удаление файлов
    :param params: Параметры
    :return:
    """
    operation_result = {"action": params.action, "status": OPERATION_STATUS_SUCCESS, "result": list()}

    for file in params.file:
        result = dict()
        file_id, file_path = file
        cmd = get_ssh_cmd(args.host)
        cmd.append("rm")
        cmd.append(file_path)

        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        proc.wait()

        result["id"] = file_id
        result["status"] = OPERATION_STATUS_SUCCESS if proc.returncode == 0 else OPERATION_STATUS_FAILED
        result["result"] = proc.stdout.read().decode("utf-8")
        result["error"] = proc.stderr.read().decode("utf-8")
        operation_result["result"].append(result)

    return operation_result


def process(params):
    """
    Обработка запроса
    :param params: Праметры  запрашиваемой операции
    :return:
    """
    if params.action == FILE_ACTION_DELETE:
        if params.file:
            return delete_files(params)

    return {"action": params.action, "status": OPERATION_STATUS_FAILED, "error": "There is no handler for this action"}


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--host", help="Host", required=True)
    parser.add_argument("--action", help="Action", required=True)
    parser.add_argument("--file", action='append', nargs=2, help="File", metavar=("FILE_ID", "FILE_PATH"), required=True)
    args = parser.parse_args()

    if args.host and args.action:
        result = process(args)
        print(json.dumps(result))
