#!/usr/bin/env python3
"""Операции с файлами"""
import json
import subprocess
from argparse import ArgumentParser


FILE_ACTION_DELETE = "delete"
FILE_ACTION_HEAL = "heal"
OPERATION_STATUS_SUCCESS = "success"
OPERATION_STATUS_FAILED = "failed"


def get_cmd(host: str):
    """
    Возвращает основные команды для выполнения операции
    :param host: Хост на котором будет выполняться операция
    :return:
    """
    return ["/usr/bin/ssh", "-o", "StrictHostKeyChecking=no", "root@" + host, "imunify-antivirus", "malware", "malicious"]


def handle_operation(params, extended_cmd):
    """
    Выполнение операции
    :param params:
    :param extended_cmd:
    :return:
    """
    operation_result = {"action": params.action, "status": OPERATION_STATUS_SUCCESS, "result": list()}

    for file in params.file:
        result = dict()
        file_id, iav_file_id, file_path = file
        cmd = get_cmd(params.host)
        cmd.extend(extended_cmd)

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
        return handle_operation(params, ["delete"])
    if params.action == FILE_ACTION_HEAL:
        return handle_operation(params, ["cleanup"])

    return {"action": params.action, "status": OPERATION_STATUS_FAILED, "error": "There is no handler for this action"}


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--host", help="Host", required=True)
    parser.add_argument("--action", help="Action", required=True)
    parser.add_argument("--file", action='append', nargs=3, help="File", metavar=("FILE_ID", "IAV_FILE_ID", "FILE_PATH"), required=True)
    args = parser.parse_args()

    if args.host and args.action:
        result = process(args)
        print(json.dumps(result))
