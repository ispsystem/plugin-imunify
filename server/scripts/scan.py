from argparse import ArgumentParser
from datetime import datetime
import calendar
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
        """
        Read from pipe
        :return: Data from pipe
        """
        self.fifo = open(self.name)
        return self.fifo.read()

    def close(self):
        """
        Close pipe
        :return:
        """
        self.fifo.close()
        os.unlink(self.name)


def scan(path):
    """
    Start scan
    :param path: Scan directory
    :return: Process exit code
    """
    process = subprocess.Popen(["/bin/imunify-antivirus", "malware", "on-demand", "start", "--path", path],
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE)
    process.wait()
    return process.returncode


# TODO(d.vitvitskii) Поменять на time.time()*1000
def get_utc_timestamp():
    return calendar.timegm(datetime.utcnow().utctimetuple()) * 1000


def process(path, start_date):
    """
    Scan process
    :param path: Scan path
    :return: Dictionary that present scan result: status, result, scan_id etc.
    """
    scan_result = {
        "status": SCAN_STATUS_SUCCESS,
        "scan": dict()
    }

    try:
        started = int(start_date)
        fifo = Fifo()
        scan(path)
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
                infected_file = {
                    # TODO(d.vitvitskii) Получать дату последнего изменения файла
                    "file": malicious["file"],
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
    Hooks for detecting scan results
    :param dict_param: Events parameters
    :return:
    """
    fifo = open(PIPE_PATH, "w")
    fifo.write(json.dumps(dict_param))
    fifo.close()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", help="Scan path")
    parser.add_argument("-s", "--started", help="Started date time")
    args = parser.parse_args()

    if args.path is not None and args.started is not None:
        scan_result = process(args.path, args.started)
        print(json.dumps(scan_result))
