"""Скрипт лечения зараженных файлов"""
from argparse import ArgumentParser
import json
import os
import re
import subprocess


PIPE_PATH = "/opt/ispsystem/plugin/imunify/healresult"
HEAL_STATUS_FAILED = "failed"
HEAL_STATUS_SUCCESS = "success"
EMPTY_HEAL_RESULT_REGEXP = "(?P<start>{.*})(?P<finish>{.*})"


class Fifo:
    """Механизм работы с пайпами"""
    def __init__(self):
        self.name = PIPE_PATH
        if os.path.exists(self.name):
            os.unlink(self.name)
        os.mkfifo(self.name)

    def read(self):
        """
        Чтение данных из пайпы
        :return: Данные из пайпы
        """
        self.fifo = open(self.name)
        return self.fifo.read()

    def close(self):
        """
        закрытие и удаление пайпы
        :return:
        """
        self.fifo.close()
        os.unlink(self.name)


def heal(iav_file_id):
    """
    Запуск лечения
    :return: Exit code
    """
    cmd = ["/bin/imunify-antivirus", "malware", "malicious", "cleanup", iav_file_id]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    proc.wait()
    return {"return_code": proc.returncode,
            "stderr": proc.stderr.read().decode("utf-8"),
            "stdout": proc.stdout.read().decode("utf-8")}


def process(iav_file_id):
    """
    Обработка запроса
    :param iav_file_id: Идентификатор файла для лечения
    :return:
    """
    try:
        fifo = Fifo()
        heal_result = heal(iav_file_id)
        if heal_result["return_code"]:
            exit(heal_result["stderr"])
    except Exception as e:
        exit("Error while execute healing process: '{}'".format(e))

    try:
        on_start_result = fifo.read()
        matches = re.search(EMPTY_HEAL_RESULT_REGEXP, on_start_result)

        if matches:
            on_complete_params = json.loads(matches.group('finish')).get("params")
        else:
            on_complete_result = fifo.read()
            json_data = json.loads(on_complete_result)
            on_complete_params = json_data.get("params")

        total_files = on_complete_params.get("total_files", 0)
        total_cleaned = on_complete_params.get("total_cleaned", 0)
        if total_files != total_cleaned:
            exit("Can not heal infected file")
    except Exception as e:
        exit("Error while parse heal process data: '{}'".format(e))

    fifo.close()


def im_hook(dict_param):
    """
    Хук для обработки результатов лечения
    :param dict_param: Результат работы антивируса
    :return:
    """
    fifo = open(PIPE_PATH, "w")
    fifo.write(json.dumps(dict_param))
    fifo.close()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--iav-file-id", help="The identifier of file", required=True)
    args = parser.parse_args()

    process(args.iav_file_id)
