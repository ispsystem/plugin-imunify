from argparse import ArgumentParser
import base64
import json
import os
import re
import subprocess


PIPE_PATH = "/opt/ispsystem/plugin/imunify/scanresult"
SCAN_STATUS_FAILED = "failed"
SCAN_STATUS_SUCCESS = "success"
EMPTY_SCAN_RESULT_REGEXP = "(?P<start>{.*})(?P<finish>{.*})"


class Fifo:
    def __init__(self):
        self.name = PIPE_PATH
        if os.path.exists(self.name):
            os.unlink(self.name)
        os.mkfifo(self.name)

    def read(self):
        self.fifo = open(self.name)
        return self.fifo.read()

    def close(self):
        self.fifo.close()
        os.unlink(self.name)


def get_scan_args(scan_params):
    """
    Разбор необходимых параметров
    :param scan_params: Параметры сканирования
    :return:
    """
    params = ["/bin/imunify-antivirus"]

    log_level = "DEBUG" if scan_params.get("fullLogDetails", True) else "INFO"
    params.extend(["--console-log-level", log_level, "malware", "on-demand", "start"])

    # TODO(d.vitvitskii) Временное решение. Нужно научиться обрабатывать несколько директорий.
    #  Для этого нужно переписать логику обработки результатов сканирования
    scan_paths = scan_params.get("path", [])
    if not scan_paths or not scan_paths[0]:
        scan_path = "/"
    else:
        scan_path = scan_paths[0]
    params.append("--path")
    params.append(scan_path)

    file_mask_list = scan_params.get("checkMask", [])
    if file_mask_list:
        file_mask = ",".join(file_mask_list)
        params.append("--file-mask")
        params.append(file_mask)

    ignore_mask_list = scan_params.get("excludeMask", [])
    if ignore_mask_list:
        ignore_mask = ",".join(ignore_mask_list)
        params.append("--ignore-mask")
        params.append(ignore_mask)

    intensity_ram = scan_params.get("ramForCheck", 1024)
    params.append("--intensity-ram")
    params.append(str(intensity_ram))

    intensity_io = scan_params.get("parallelChecks", 1)
    params.append("--intensity-io")
    params.append(str(intensity_io))

    return params


def scan(scan_params):
    """
    Запуск сканирования
    :param scan_params: Параметры сканирования
    :return: Exit code
    """
    process = subprocess.Popen(get_scan_args(scan_params), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    process.wait()
    return process.returncode


def process(params, start_date):
    """
    Запуск сканирования и обработка результатов
    :param params: Параметры сканирования
    :param start_date: Дата начала сканирования в формате timestamp
    :return: Словарь, оприсывающий результат сканирования: status, result, scan_id ...
    """
    scan_result = {
        "status": SCAN_STATUS_SUCCESS,
        "scan": dict()
    }

    try:
        scan_params = json.loads(base64.b64decode(params))
    except ValueError as e:
        scan_result["status"] = SCAN_STATUS_FAILED
        scan_result["reason"] = "Error while parsing scan params: '{}'".format(e)
        return scan_result

    try:
        started = int(start_date)
        fifo = Fifo()
        scan(scan_params)
    except Exception as e:
        scan_result["status"] = SCAN_STATUS_FAILED
        scan_result["reason"] = "Error while execute scan process: '{}'".format(e)
        return scan_result

    try:
        on_start_result = fifo.read()
        matches = re.search(EMPTY_SCAN_RESULT_REGEXP, on_start_result)

        if matches:
            on_start_params = json.loads(matches.group('start')).get("params")
            on_complete_params = json.loads(matches.group('finish')).get("params")
        else:
            json_data = json.loads(on_start_result)
            on_start_params = json_data.get("params")

            on_complete_result = fifo.read()
            json_data = json.loads(on_complete_result)
            on_complete_params = json_data.get("params")

        scan_result["scan_id"] = on_start_params.get("scan_id")
        scan_result["scan"]["path"] = on_complete_params.get("path", "")
        scan_result["scan"]["status"] = on_complete_params.get("status", SCAN_STATUS_FAILED)
        scan_result["scan"]["started"] = started
        scan_result["scan"]["created"] = on_complete_params.get("created", 0)
        scan_result["scan"]["infected"] = []

        if on_complete_params.get("total_malicious", 0) != 0:
            output = subprocess.check_output(["imunify-antivirus", "malware", "malicious", "list", "--by-scan-id", scan_result["scan_id"], "--json"]).decode()
            malicious_list = json.loads(output)
            for malicious in malicious_list["items"]:
                try:
                    last_modify = int(os.stat(malicious["file"]).st_mtime)
                except FileNotFoundError:
                    last_modify = 0
                infected_file = {
                    "file": malicious["file"],
                    "last_modify": last_modify,
                    "malicious_type": malicious["type"]
                }
                scan_result["scan"]["infected"].append(infected_file)

    except Exception as e:
        scan_result["status"] = SCAN_STATUS_FAILED
        scan_result["reason"] = "Error while parse scan process data: '{}'".format(e)

    fifo.close()
    return scan_result


def im_hook(dict_param):
    """
    Хук для обработки результатов сканирования
    :param dict_param: Результат работы антивирума
    :return:
    """
    fifo = open(PIPE_PATH, "w")
    fifo.write(json.dumps(dict_param))
    fifo.close()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--params", help="Scan params")
    parser.add_argument("-s", "--started", help="Started date time")
    args = parser.parse_args()

    if args.params and args.started:
        scan_result = process(args.params, args.started)
        print(json.dumps(scan_result))
