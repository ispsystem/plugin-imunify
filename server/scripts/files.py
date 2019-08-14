#!/usr/bin/env python3
"""Операции с файлами"""
import json
import subprocess
from argparse import ArgumentParser


FILE_ACTION_DELETE = "delete"
FILE_ACTION_CURE = "cure"
OPERATION_STATUS_SUCCESS = "success"
OPERATION_STATUS_FAILED = "failed"


def get_malicious_list(host: str, action: str):
    cmd = ["/usr/bin/ssh", "-o", "StrictHostKeyChecking=no", "root@" + host]
    cmd.extend(["imunify-antivirus", "malware", "malicious", "list", "--json"])
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    proc.wait()
    proc_stdout = proc.stdout.read().decode("utf-8")
    malicious_list = json.loads(proc_stdout)
    file_statuses = ["cleanup_done", "cleanup_removed"] if action == "restore" else ["found"]
    return [item["id"] for item in malicious_list.get("items", []) if item["status"] in file_statuses]


def handle_operation(params, extended_cmd):
    """
    Выполнение операции
    :param params: Параметры запуска операции
    :param extended_cmd: Команда для выполнения операции
    :return:
    """
    operation_result = {"action": params.action, "status": OPERATION_STATUS_SUCCESS, "result": list()}

    malicious_ids = get_malicious_list(params.host, params.action)
    for file in params.file:
        file_id, iav_file_id = file

        result = {"id": file_id, "status": OPERATION_STATUS_FAILED, "result": str(), "error": str()}
        try:
            if int(iav_file_id) not in malicious_ids:
                result["error"] = "Can not find file in imunify malicious list"
        except ValueError:
            result["error"] = "Only integer file ids"

        cmd = ["/usr/bin/ssh", "-o", "StrictHostKeyChecking=no", "root@" + params.host]
        cmd.extend(extended_cmd)
        cmd.append(iav_file_id)

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
        extended_cmd = ["imunify-antivirus", "malware", "malicious", "delete"]
        return handle_operation(params, extended_cmd)
    if params.action == FILE_ACTION_CURE:
        extended_cmd = ["/bin/python3", "/opt/ispsystem/plugin/imunify/heal.py", "--iav-file-id"]
        return handle_operation(params, extended_cmd)

    return {"action": params.action, "status": OPERATION_STATUS_FAILED, "error": "There is no handler for this action"}


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--host", help="Host", required=True)
    parser.add_argument("--action", help="Action", required=True)
    parser.add_argument("--file", action='append', nargs=2, help="File", metavar=("FILE_ID", "IAV_FILE_ID"), required=True)
    args = parser.parse_args()

    if args.host and args.action:
        result = process(args)
        print(json.dumps(result))
