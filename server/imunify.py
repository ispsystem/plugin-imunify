#!/usr/bin/env python3
"""ImunifyAV plugin"""
from aiohttp import web, ClientSession, hdrs
from argparse import ArgumentParser
from enum import Enum
from hashlib import md5
from json import dumps, loads
from jsonschema import validate, ValidationError, SchemaError
from mysql import connector
from os import getenv, environ, remove, getcwd, path
from datetime import datetime
import base64
import calendar
import logging as log
import re
import requests
import socket
import subprocess
import websockets
import asyncio
import time


TASK_CREATOR = '/opt/ispsystem/plugin_service/bin/task_creator'
ANSIBLE_PLAYBOOK_COMMAND = getenv("ANSIBLE_PLAYBOOK")
PROXY_SERVICE = getenv("PROXY_SERVICE")
SCHEMAS_PATH = 'schemas/'
MAX_REQUEST_ATTEMPTS = 10
OPERATION_STATUS_SUCCESS = "success"
DEFAULT_LIMIT_VALUE = 15
LIMIT_REGEXP = r"^\d+,\d+$|^\d+$"

DB_CONNECTION = connector.connect(
    host='mysql',
    user=getenv('MYSQL_USER'),
    passwd=getenv('MYSQL_PASSWORD'),
    database=getenv('MYSQL_DATABASE')
)

DB_PREFIX = 'imunify_'
IMUNIFY_LOCK = "imunify-instance-{}"


class BaseEnum(Enum):
    """Базовый класс для Enum'a"""
    def __str__(self):
        return self.value

    @classmethod
    def to_sql_enum(cls):
        """
        Преобразует Enum в строку-тип mysql enum
        :return:
        """
        types_str = ','.join(["'{}'".format(status) for status in cls])
        return "ENUM ({})".format(types_str)

    @classmethod
    def has_value(cls, value):
        """
        Проверка на вхождение сущности в enum
        :param value:
        :return:
        """
        return any(value == item.value for item in cls)


class FileStatus(BaseEnum):
    """Статусы файлов"""
    infected = "INFECTED"
    cured = "CURED"
    added_to_exceptions = "EXCEPTED"
    healing = "HEALING"
    deleted = "DELETED"


class ScanType(BaseEnum):
    """Типы сканирования"""
    full = "FULL"
    partial = "PARTIAL"


class FileAction(BaseEnum):
    """Типы операций с файлами"""
    delete = "delete"


class Value:
    """Получение значения поля из настроек"""
    def __init__(self, val: str):
        self._val = val

    def get(self):
        """
        Обработка значения поля
        :return:
        """
        if self._val == 'False':
            return False
        if self._val == 'True':
            return True
        return self._val


def create_table(name, table_fields, indexes=None):
    """
    Создание таблицы
    :param name: Название таблицы
    :param table_fields: Поля
    :param indexes: Индексы
    :return:
    """
    table_name = DB_PREFIX + name

    log.info("Create table: {}".format(table_name))
    cur = DB_CONNECTION.cursor()
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    cur.fetchall()
    if cur.rowcount > 0:
        log.debug("Table {} already exists".format(table_name))
        return

    command = "CREATE TABLE " + table_name + " ({})"
    fields_str = ', '.join(str(field) for field in table_fields)
    if indexes and fields_str:
        for index in indexes:
            fields_str += ', {}'.format(str(index))

    command = command.format(fields_str)
    log.debug("Execute command: {}".format(command))
    cur.execute(command)
    cur.close()
    DB_CONNECTION.commit()


def select(table: str, table_fields: list, where=None):
    """
    Метод, реализующий выборку из таблицы
    :param table: Название таблицы
    :param table_fields: Поля
    :param where: Условие по которому будет вестить выборка
    :return:
    """
    cur = DB_CONNECTION.cursor()

    fields_str = ', '.join(field.lower() for field in table_fields)
    query = "SELECT {} FROM {}".format(fields_str, DB_PREFIX + table)
    if where:
        query += " WHERE {}".format(where)

    log.debug("Execute query: '{}'".format(query))
    cur.execute(query)
    row_headers = [x[0] for x in cur.description]
    rows = cur.fetchall()
    cur.close()
    DB_CONNECTION.commit()

    result = list()
    for row in rows:
        result.append(dict(zip(row_headers, row)))
    return result


def insert(table: str, data: dict):
    """
    Метод, реализующий добавление записи в таблицу
    :param table: Название таблицы
    :param data: Словарь который содержит данные для вставки (поля в виде ключей и значения)
    :return:
    """
    cur = DB_CONNECTION.cursor()

    fields_str = str()
    values_str = str()
    for field, value in data.items():
        if fields_str:
            fields_str += ', '
        fields_str += field
        if values_str:
            values_str += ', '
        values_str += "'{}'".format(value) if isinstance(value, str) else str(value)

    query = "INSERT INTO {} ({}) VALUES ({})".format(DB_PREFIX + table, fields_str, values_str)

    log.debug("Execute query: '{}'".format(query))
    row_id = None
    try:
        cur.execute(query)
        DB_CONNECTION.commit()
        row_id = cur.lastrowid
    except Exception as e:
        log.error("Error while execute query: '{}'".format(e))
    cur.close()
    return row_id


def update(table: str, data: dict, where=None):
    """
    Метод, реализующий обновление записи в таблицу
    :param table: Название таблицы
    :param data: Словарь который содержит данные для обновления данных полей
    :param where: Условие по которому будет выбрана запись или записи для обновления
    :return:
    """
    cur = DB_CONNECTION.cursor()

    key_values_str = str()
    for field, value in data.items():
        if key_values_str:
            key_values_str += ', '
        value = "'{}'".format(value) if isinstance(value, str) else str(value)
        key_values_str += "{}={}".format(field, value)

    query = "UPDATE {} SET {}".format(DB_PREFIX + table, key_values_str)
    if where:
        query += " WHERE {}".format(where)

    log.debug("Execute query: '{}'".format(query))
    cur.execute(query)
    DB_CONNECTION.commit()
    cur.close()


def get_settings_value(name, default=""):
    """
    Получение значения определенной настройки плагина по ключу
    :param name:
    :param default:
    :return:
    """
    log.info("Get value '{}' from settings table".format(name))

    result = select(table="settings", table_fields=["value"], where="name='{}'".format(name))
    return Value(result[0]['value'] if len(result) > 0 else default)


def get_file(docroot_base, docroot, file):
    """
    Получение инмени файла и пути к директории в которой он лежит относительно директории сайта
    :param docroot_base: Путь до директории с сайтами
    :param docroot: Директория с сайтом
    :param file_path: Полный путь к файлу
    :return: Имя файла, путь к директори с файлом
    """
    replace_pattern = "{}/{}".format(docroot_base, docroot)
    file_path = file.replace(replace_pattern, "")
    return {"name": path.basename(file_path),
            "path": path.dirname(file_path)}


def get_value(json_object: dict, pointer: str, default=None, delimiter="/"):
    """
    Реализует механизм доступа к элементам n-й вложенности словаря
    Позволяет не проверять каждую ноду на существование и обходить Exception

    :param json_object: Объект словаря или json'a
    :param pointer: Указатель на необъодимую ноду ("qwe/qw/q")
    :param default: Дефолтное значение котороое будет возвращено если нода не найдена (default = None)
    :param delimiter: Разделитель нод в указателе (default = "/")
    :return:
    """
    result = json_object
    for node in pointer.split(delimiter):
        try:
            result = result.get(node)
        except ValueError:
            return default
    return result


def create_task(exec_bin, name, instance_id, params=None, task_env=None, notify=None, lock=""):
    """
    Создание задачи (таски)
    :param exec_bin: Путь до исполняемого файла
    :param name: Название задачи
    :param instance_id: Идентификатор инстанса пользователя
    :param params: Параметры запуска задачи
    :param task_env: переменные окружения задачи
    :param notify:
    :param lock: Лочка
    :return:
    """
    if notify is None:
        notify = {}
    if task_env is None:
        task_env = {}
    if params is None:
        params = []
    cmd = [TASK_CREATOR,
           "--exec", exec_bin,
           "--name", name
           ]
    if params:
        cmd += ["--params", dumps(params)]
    if task_env:
        cmd += ["--env", dumps(task_env)]
    if notify:
        cmd += ["--notify", dumps(notify)]
    if lock:
        cmd += ["--lock", lock]

    env = environ.copy()
    env["INSTANCE_ID"] = instance_id
    env["LOG_SETTINGS_FILE_LEVEL"] = "debug"
    return subprocess.check_output(cmd, env=env).decode()


async def task_wait(task_id: int, scan_info: dict, callback):
    """
    Механизм ожидания результата работы таски
    :param task_id: Идентификатор таски
    :param scan_info: Информация о сканировании
    :param callback: Метод который будет вызван при завершении работы задачи
    :return:
    """
    log.debug("Begin task {} wait".format(task_id))
    entities = {
        "entities": [
            {
                "entity": "task",
                "ids": [task_id],
                "type": [{"name": "delete"}]
            }
        ]
    }

    extra_headers = {"Cookie": "ses6=" + scan_info["ses6"]}
    host, port = PROXY_SERVICE.split(':', 1)
    async with websockets.connect("ws://instance-{}/notifier".format(scan_info.get("instance")),
                                  extra_headers=extra_headers,
                                  host=host,
                                  port=port) as ws:
        await ws.send(dumps(entities))

        result = await ws.recv()
        task_info = loads(result)
        callback(task_info, scan_info)


def get_utc_timestamp():
    """
    Текущая дата в формате timestamp
    :return:
    """
    return calendar.timegm(datetime.utcnow().utctimetuple()) * 1000


def get_limit_value(limit: str):
    """
    Валидация и обработка переданного лимита
    :param limit: Строка с лимитом
    :return:
    """
    limit_value = limit if re.search(LIMIT_REGEXP, limit) else str(DEFAULT_LIMIT_VALUE)
    return " LIMIT {}".format(limit_value)


class List:
    """Обертка над list()"""
    def __init__(self, wrapped_list: list, size=None):
        self.content = {'list': wrapped_list, "size": size if size else len(wrapped_list)}

    def __str__(self):
        return dumps(self.content)

    def to_dict(self):
        """
        Возвращает преобразованный list в виде словаря с дополнительной информацией
        :return:
        """
        return self.content


def get_handler_name(method: str, url_path: str, path_params: dict):
    """
    Возвращает имя необходимого хендлера для рефлексифного вызова метода
    :param method: Метод
    :param url_path: URL
    :param path_params: Параметры
    :return:
    """
    handler = url_path.replace('/', '_')
    for key, value in path_params.items():
        handler = handler.replace(value, key)
    return method.lower() + handler


def get_schema_path(handler: str):
    """
    Метод для получения схемы вализации POST-методов
    :param handler: Название хендлера
    :return:
    """
    return SCHEMAS_PATH + handler + ".json"


def get_default_preset():
    """
    Метод для получения дефолтного пресета сканирования
    :return:
    """
    preset = dict()
    try:
        with open("etc/default_preset.json", "r") as default_preset_file:
            preset = loads(default_preset_file.read())
    except IOError as e:
        log.error("Can not open default preset file: '{}'".format(e))
    except ValueError as e:
        log.error("Can not parse preset file: '{}'".format(e))
    return preset


class HandlerInfo:
    """Информация о запросе"""
    def __init__(self, request: web.Request):
        log.debug("Received {} request".format(request.method))

        log.debug("  uri: {}".format(request.path))
        log.debug("  headers: ")
        for key, value in request.headers.items():
            log.debug("\t{}: {}".format(key, value))

        self.headers = {k.lower(): v for k, v in request.headers.items()}
        self.instance_id = self.headers.get("instance-id", "auth")
        self.ses6 = request.cookies.get('ses6', '')
        self.__request = request

        log.debug("Path params {}".format(dumps(self.__request.match_info)))
        log.debug("Current instance-id: {}".format(self.instance_id))

    @property
    def path_params(self):
        """
        Path-params
        :return:
        """
        return self.__request.match_info

    @property
    def query_params(self):
        """
        Query-params
        :return:
        """
        return self.__request.rel_url.query

    @property
    def path(self):
        """
        Request path
        :return:
        """
        return self.__request.path

    @property
    async def body(self) -> dict:
        """
        Тело запроса
        :return:
        """
        return await self.__request.json()


class Imunify:
    """Основной класс, реализующий хендлеры"""
    async def __call__(self, request: web.Request) -> web.Response:
        """
        Предобработка пользовательского запроса
        :param request:
        :return:
        """
        handler_info = HandlerInfo(request)

        who_ami = await self.who_ami(handler_info.instance_id, handler_info.ses6)
        if who_ami.status != 200:
            return web.Response(text=await who_ami.text(), status=who_ami.status, content_type='application/json')

        handler = get_handler_name(request.method, handler_info.path, handler_info.path_params)
        log.debug("Handler '{}' was chosen".format(handler))
        if hasattr(self, handler):
            if request.method == hdrs.METH_POST:
                try:
                    log.debug("Schema path: {}".format(get_schema_path(handler)))
                    with open(get_schema_path(handler)) as schema_file:
                        schema = loads(schema_file.read())
                        postdata = await handler_info.body
                        validate(postdata, schema)
                except ValidationError:
                    return web.HTTPBadRequest(text="Validation error. Check that your postdata is valid")
                except (SchemaError, ValueError):
                    return web.HTTPBadRequest(text="Invalid validation schema")
                except IOError:
                    return web.HTTPNotFound(text="Validation schema not found")
            result = await getattr(self, handler)(handler_info)
            log.debug("Response body: '{}'".format(result.body.decode()))
            result.content_type = 'application/json'
            return result

        return web.HTTPNotFound()

    @staticmethod
    async def who_ami(instance_id, ses6):
        """
        Получение данных авторизации
        :param instance_id: Идентификатор инстанса
        :param ses6: Сессия пользователя
        :return:
        """
        async with ClientSession() as ses:
            return await ses.get('http://{}/auth/v3/whoami'.format(PROXY_SERVICE),
                                 headers={'Instance-ID': instance_id},
                                 cookies={'ses6': ses6})

    @staticmethod
    async def get_site_info(instance_id, site_id, ses6):
        """
        Получение информации о сайте
        :param instance_id: Идентификатор инстанса пользователя
        :param site_id: Идентификатор сайта пользователя
        :param ses6: Сессия пользователя
        :return: Информация о сайте
        """
        async with ClientSession() as ses:
            attempts = 0
            result = None
            while attempts < MAX_REQUEST_ATTEMPTS:
                response = await ses.get("http://{}/isp/v3/site/{}".format(PROXY_SERVICE, site_id),
                                         headers={"Host": "instance-{}".format(instance_id)},
                                         cookies={"ses6": ses6})
                if response.status != 503:
                    return response
                else:
                    result = response
                    attempts += 1
                    await asyncio.sleep(1)
            return result

    @staticmethod
    async def get_instance(instance_id):
        """
        Получение информации об инстансе пользователя
        :param instance_id: Идентификатор инстанса
        :return:
        """
        async with ClientSession() as ses:
            return await ses.get('http://{}/auth/v3/instance/{}'.format(PROXY_SERVICE, instance_id),
                                 headers={"internal-auth": "on"})

    async def post_site_site_id_scan(self, info: HandlerInfo):
        """
        Хендлер запуска сканирования
        :param info: Информация о запросе
        :return:
        """
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = await site_info_response.json()

        request_body = await info.body
        response = await self.get_instance(info.instance_id)
        data = await response.json()
        log.debug(dumps(data))
        start_scan_time = get_utc_timestamp()
        host = data.get("host", "")
        preset_id = request_body.get("preset_id")

        where_statement = "id={} AND instance={}".format(preset_id, info.instance_id)
        table_fields = ['preset']
        result = select(table='presets', table_fields=table_fields, where=where_statement)

        if not result:
            return web.HTTPNotFound(text="The identifier of the preset for this instance is not valid or does not exist")

        where_statement = "id={} AND instance={}".format(preset_id, info.instance_id)
        fields = {"date_use": start_scan_time}
        update(table='presets', data=fields, where=where_statement)

        preset_value = result[0]["preset"]
        log.debug("Scan params: {}".format(preset_value))
        preset = base64.b64encode(preset_value.encode("utf-8"))
        docroot = "{}/{}/".format(site_info["docroot_base"], site_info["docroot"])
        output = create_task(exec_bin="/var/www/imunify/scripts/run_scan.py",
                             name='scan',
                             params=["--address", host,
                                     "--docroot", docroot,
                                     "--params", preset.decode(),
                                     "--started", str(start_scan_time)],
                             instance_id=info.instance_id,
                             task_env={"INSTANCE_ID": info.instance_id, "LOG_SETTINGS_FILE_LEVEL": "debug"},
                             lock=IMUNIFY_LOCK.format(info.instance_id),
                             notify={"entity": "plugin", "id": int(getenv("PLUGIN_ID"))})

        result = loads(output)
        loop = asyncio.get_event_loop()
        scan_info = {
            "instance": info.instance_id,
            "site_id": site_id,
            "ses6": info.ses6,
            "started": start_scan_time,
            "preset_id": preset_id,
            "docroot_base": site_info["docroot_base"],
            "docroot": site_info["docroot"]
        }
        loop.create_task(task_wait(result['task_id'], scan_info, self.scan_done))
        result["started"] = start_scan_time
        return web.Response(text=dumps(result))

    async def get_scan_result(self, info: HandlerInfo):
        """
        Метод для получения результатов сканирования
        :param info: Информация о запросе
        :return:
        """
        params = info.query_params
        try:
            task_id = int(params.get("task_id", 0))
            date = int(params.get("started", 0))
        except ValueError:
            return web.Response(text=dumps(list()))

        attempt = 0
        report_result = list()
        where_statement = "task_id={} AND scan_date={}".format(task_id, date)
        while attempt < MAX_REQUEST_ATTEMPTS and not report_result:
            report_result = select(table='report', table_fields=['report', 'scan_date', 'preset_id'], where=where_statement)
            attempt += 1
            await asyncio.sleep(0.5)
        log.debug("Attempt: '{}'. Result: {}".format(attempt, report_result))

        if not report_result:
            return web.Response(text=dumps(list()))

        file_list = list()
        for file_id in loads(report_result[0]["report"])["infected"]:
            where_statement = "id={}".format(file_id, date)
            table_fields = ['id', 'file', 'status', 'malicious_type', 'path', 'detected', 'created', 'last_modified']
            result = select(table='files', table_fields=table_fields, where=where_statement)

            file = result[0]
            infected_file = {
                "id": file["id"],
                "name": file["file"],
                "status": file["status"],
                "threatName": file["malicious_type"],
                "path": file["path"],
                "detectionDate": file["detected"],
                "createdDate": file["created"],
                "lastChangeDate": file["last_modified"]
            }
            file_list.append(infected_file)
        report = loads(report_result[0]["report"])
        response = {
            "historyItem": {
                "date": report_result[0]["scan_date"],
                "checkType": report["type"],
                "infectedFilesCount": len(file_list),
                "curedFilesCount": report["cured"],
                "scanOptionId": report_result[0]["preset_id"]
            },
            "infectedFiles": List(file_list).to_dict()
        }
        return web.Response(text=dumps(response))

    async def post_site_site_id_preset(self, info: HandlerInfo):
        """
        Создание нового пресета для сканирования
        :param info: Информация о запросе
        :return:
        """
        request_body = await info.body
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        scan_type = request_body.get("scan_type")
        preset = request_body.get("preset")

        preset_info = {
            "instance": info.instance_id,
            "site_id": site_id,
            "type": scan_type,
            "preset": dumps(preset),
            "date_use": get_utc_timestamp()
        }

        preset_id = insert(table="presets", data=preset_info)
        if not preset_id:
            return web.HTTPServerError(text="Error while creating preset")

        result = {"preset_id": preset_id}
        return web.Response(text=dumps(result))

    @staticmethod
    async def post_preset_id_status(info: HandlerInfo):
        """
        Изменение статуса пресета (Активация/деактивация)
        :param info: Информация о запросе
        :return:
        """
        request_body = await info.body
        try:
            preset_id = int(info.path_params.get("id"))
            is_active = bool(request_body.get("is_active"))
        except ValueError:
            return web.HTTPBadRequest(text="Preset's id or status is not valid")

        where_statement = "id={} AND instance={}".format(preset_id, info.instance_id)
        fields = {"is_active": is_active}
        update(table='presets', data=fields, where=where_statement)
        return web.Response(text=dumps({"preset_id": preset_id}))

    @staticmethod
    def scan_done(task_info: dict, scan_info: dict):
        """
        Callback который будет вызван после завершения задачи на сканирование
        :param task_info: Таска
        :param scan_info: Информация о сканировании
        :return:
        """
        log.debug("Task ended. Info: {}".format(dumps(task_info)))
        scan_report = get_value(task_info, "additional_data/output/content/scan", dict())
        report_data = {
            "instance": int(scan_info["instance"]),
            "site_id": scan_info["site_id"],
            "task_id": task_info["id"],
            "scan_date": scan_info["started"],
            "preset_id": scan_info["preset_id"]
        }

        where_statement = "id={}".format(scan_info["preset_id"])
        presets = select(table='presets', table_fields=['type'], where=where_statement)

        report = {"type": presets[0]["type"], "infected": []}

        for infected_file in scan_report.get("infected", []):
            file = get_file(scan_info["docroot_base"], scan_info["docroot"], infected_file["file"])
            full_path = file["path"] + file["name"]

            path_hash = md5(full_path.encode("utf-8")).hexdigest()
            file_data = {
                "iav_file_id": infected_file["iav_file_id"],
                "instance": int(scan_info["instance"]),
                "site_id": scan_info["site_id"],
                "path_hash": path_hash,
                "file": file["name"],
                "path": file["path"],
                "status": infected_file["status"] if FileStatus.has_value(infected_file["status"]) else str(FileStatus.infected),
                "malicious_type": infected_file["malicious_type"],
                "last_modified": infected_file["last_modified"],
                "detected": scan_info["started"],
                "created": scan_info["started"]  # TODO(d.vitvitskii) Получать дату создания файла
            }

            file_id = insert(table="files", data=file_data)
            if not file_id:
                where_statement = "instance={} AND site_id={} AND path_hash='{}'".format(scan_info["instance"], scan_info["site_id"], path_hash)
                file_row = select(table="files", table_fields=["id"], where=where_statement)
                file_id = file_row[0]["id"]

                data = {"iav_file_id": infected_file["iav_file_id"],
                        "status": infected_file["status"] if FileStatus.has_value(infected_file["status"]) else str(FileStatus.infected)}
                update(table="files", data=data, where="id={}".format(file_id))

            report["infected"].append(file_id)
        report["cured"] = scan_report.get("cured", 0)
        report_data["report"] = dumps(report)
        insert(table="report", data=report_data)

    @staticmethod
    def files_done(task_info: dict, info: dict):
        """
        Callback который будет вызван после завершения операции с файлами
        :param task_info: Таска
        :param info: Дополнительная информация
        :return:
        """
        log.debug("Task ended. File operation complete. Info: {}".format(dumps(task_info)))
        operations_result = task_info["additional_data"]["output"]["content"]
        status = operations_result["status"]

        if status == OPERATION_STATUS_SUCCESS:
            operations = operations_result["result"]
            file_status = str(FileStatus.deleted)
            for operation in operations:
                if operation["status"] == OPERATION_STATUS_SUCCESS:
                    where_statement = "id={}".format(operation["id"])
                    fields = {"status": str(file_status)}
                    update(table='files', data=fields, where=where_statement)

    @staticmethod
    async def get_feature(_):
        """
        Информация о состоянии плагина
        :param _:
        :return:
        """
        # TODO(d.smirnov): убрать дефолтные значения, когда будут реальные данные
        resp = {"isProVersion": get_settings_value("isProVersion", "False").get(),
                "hasScheduledActions": get_settings_value("hasScheduledActions", "False").get()}
        return web.Response(text=dumps(resp))

    async def get_site_site_id_presets(self, info: HandlerInfo):
        """
        Список пресетов пользователя определенного инстанса и сайта.
        Возвращает последние по дате использования пресеты каждого из типов
        Если таковых нет - возвращает дефолтный пресет
        :param info: Информация о запросе
        :return:
        """
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "date_use IN (SELECT MAX(date_use) FROM imunify_presets " \
                          "WHERE site_id={site} AND instance={instance} GROUP BY type) " \
                          "AND site_id={site} AND instance={instance}".format(site=site_id, instance=info.instance_id)
        presets = select(table="presets", table_fields=["id", "type", "preset", "is_active"], where=where_statement)

        presets_list = dict()
        if not presets:
            default_preset = get_default_preset()
            if not default_preset:
                return web.HTTPNotFound(text="Default preset not found")

            preset_info = {
                "instance": int(info.instance_id),
                "site_id": site_id,
                "type": str(ScanType.full),
                "preset": str(dumps(default_preset)),
                "date_use": get_utc_timestamp()
            }
            preset_id = insert(table="presets", data=preset_info)
            default_preset["id"] = preset_id
            default_preset["isActive"] = True
            presets_list["full"] = default_preset
            return web.Response(text=dumps(presets_list))

        for data in presets:
            preset = loads(data["preset"])
            type = data["type"].lower()
            preset["id"] = data["id"]
            preset["isActive"] = bool(data["is_active"])
            presets_list[type] = preset
        return web.Response(text=dumps(presets_list))

    async def get_site_site_id_presets_default(self, info: HandlerInfo):
        """
        Метод, возвращающий дефолтный пресет
        :param info: Информация о запросе
        :return:
        """
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = await site_info_response.json()

        default_preset = get_default_preset()
        if not default_preset:
            return web.HTTPNotFound(text="Default preset file does not exist")

        path = "/www/{}".format(site_info["docroot"])
        default_preset["docroot"] = path

        return web.Response(text=dumps(default_preset))

    async def get_site_site_id_preset_preset_id(self, info: HandlerInfo):
        """
        Метод, возвращающий пресет по его идентификатору
        :param info: Информация о запросе
        :return:
        """
        try:
            preset_id = int(info.path_params.get("preset_id"))
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site or preset is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "id={} AND site_id={} AND instance={}".format(preset_id, site_id, info.instance_id)
        presets = select(table="presets", table_fields=["id", "type", "preset", "is_active"], where=where_statement)

        if not presets:
            return web.HTTPNotFound(text="Preset does not exist")

        preset_info = presets[0]
        preset = loads(preset_info["preset"])
        preset["id"] = preset_info["id"]
        preset["isActive"] = preset_info["is_active"]

        return web.Response(text=dumps(preset))

    async def get_site_site_id_scan_history(self, info: HandlerInfo):
        """
        История сканирований сайта
        :param info: Информация о запросе
        :return:
        """
        report_list = list()
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "instance={} AND site_id={} ".format(info.instance_id, site_id)
        order_statement = "ORDER BY scan_date DESC "
        all_rows = select(table="report", table_fields=["COUNT(*) as count"], where=where_statement + order_statement)

        scan_type = info.query_params.get("type", str())
        if scan_type:
            where_statement += "AND report->'$.type' = '{}' ".format(scan_type)
        where_statement += order_statement + get_limit_value(info.query_params.get("limit", str(DEFAULT_LIMIT_VALUE)))
        reports = select(table="report",
                         table_fields=["report", "scan_date", "preset_id"],
                         where=where_statement)

        for scan in reports:
            report = loads(scan["report"])
            report_list.append({
                "date": scan["scan_date"],
                "checkType": report["type"],
                "infectedFilesCount": len(report["infected"]),
                "curedFilesCount": report["cured"],
                "scanOptionId": scan["preset_id"]
            })
        return web.Response(text=str(List(report_list, size=all_rows[0]["count"])))

    async def get_site_site_id_files_type(self, info: HandlerInfo):
        """
        Получение списка файлов по их типу
        :param info: Информация о запросе
        :return:
        """
        file_list = list()
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        file_type = info.path_params.get("type").upper()
        if not FileStatus.has_value(file_type):
            return web.HTTPBadRequest(text="File type is not valid")

        table_fields = ["id", "file", "status", "malicious_type", "path", "detected", "created", "last_modified"]
        where_statement = "site_id={} AND instance={} ORDER BY detected DESC".format(site_id, info.instance_id)
        all_rows = select(table="files", table_fields=["COUNT(*) as count"], where=where_statement)

        where_statement += get_limit_value(info.query_params.get("limit", str(DEFAULT_LIMIT_VALUE)))
        files = select(table="files", table_fields=table_fields, where=where_statement)

        for file_info in files:
            file = {
                "id": file_info["id"],
                "name": file_info["file"],
                "status": file_info["status"],
                "threatName": file_info["malicious_type"],
                "path": file_info["path"],
                "detectionDate": file_info["detected"],
                "createdDate": file_info["created"],
                "lastChangeDate": file_info["last_modified"]
            }
            file_list.append(file)
        return web.Response(text=str(List(file_list, size=all_rows[0]["count"])))

    async def delete_site_site_id_files(self, info: HandlerInfo):
        """
        Удаление файлов
        :param info: Информация о запросе
        :return:
        """
        request_body = await info.body
        try:
            site_id = int(info.path_params.get("site_id"))
        except ValueError:
            return web.HTTPBadRequest(text="The identifier of the site is not valid")

        site_info_response = await self.get_site_info(info.instance_id, site_id, info.ses6)
        if site_info_response.status != 200:
            response = await site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = await site_info_response.json()

        file_ids = request_body.get("files")
        response = await self.get_instance(info.instance_id)
        data = await response.json()
        host = data.get("host", "")

        ids = ",".join(str(id) for id in file_ids)
        where_statement = "id IN ({}) AND status='{}' AND site_id={} AND instance={}".format(ids, str(FileStatus.infected), site_id, info.instance_id)
        files = select(table="files", table_fields=["id", "file", "path"], where=where_statement)

        if not files:
            return web.HTTPNotFound(text="There is no files to delete")

        params = ["--host", host, "--action", str(FileAction.delete)]
        for file in files:
            path = site_info["docroot_base"] + "/" + site_info["docroot"] + file["path"] + "/" + file["file"]
            params.append("--file")
            params.append(str(file["id"]))
            params.append(path)

        output = create_task(exec_bin="/var/www/imunify/scripts/files.py",
                             name='files',
                             params=params,
                             instance_id=info.instance_id,
                             task_env={"INSTANCE_ID": info.instance_id, "LOG_SETTINGS_FILE_LEVEL": "debug"},
                             notify={"entity": "plugin", "id": int(getenv("PLUGIN_ID"))})

        result = loads(output)
        loop = asyncio.get_event_loop()
        info = {
            "instance": info.instance_id,
            "ses6": info.ses6,
            "action": str(FileAction.delete)
        }
        loop.create_task(task_wait(result['task_id'], info, self.files_done))
        result = loads(output)
        return web.Response(text=dumps(result))


imunify = Imunify()


def make_get(name):
    """
    GET query realization
    :param name:
    :return:
    """
    return web.get(name, imunify)


def make_post(name):
    """
    POST query realization
    :param name:
    :return:
    """
    return web.post(name, imunify)


def make_delete(name):
    """
    DELETE query realization
    :param name:
    :return:
    """
    return web.delete(name, imunify)


class DbField:
    """Механизм для создания полей в таблице"""
    def __init__(self, name: str, field_type: str, size=None, default=None):
        self._name = name.lower()
        self._type = field_type.upper()
        self._size = size
        self._default = default

    def __str__(self):
        data = "{} {}".format(self._name, self._type)
        if self._size:
            data += '(' + str(self._size) + ')'
        if self._default:
            data += " DEFAULT {}".format(str(self._default))
        return data


class DbIndex:
    """Механизм для создания индексов в таблице"""
    def __init__(self, type: str, name: str, fields: list):
        self._type = type
        self._fields = fields
        self._name = name

    def __str__(self):
        index_str = ','.join(self._fields)
        return "{} index_{} ({})".format(self._type, self._name, index_str)


def install_imunufy():
    """
    Установка антивируса
    :return:
    """
    vepp_list = []
    try:
        url = "http://" + PROXY_SERVICE + "/auth/v3/instance"
        params = {"where": "product EQ 'vepp'"}
        response = requests.get(url, headers={"internal-auth": "on"}, params=params)
        if response.ok:
            vepp_list = response.json()['list']
    except ValueError as e:
        exit("Can not get instances. Error '{}'".format(e))

    task_env = {
        "ANSIBLE_LOAD_CALLBACK_PLUGINS": "True",
        "ANSIBLE_STDOUT_CALLBACK": "json",
        "ANSIBLE_HOST_KEY_CHECKING": "False",
        "SCRIPT_PATH": getcwd() + "/scripts/scan.py",
        "INSTANCE_ID": ""
    }

    for item in vepp_list:
        instance_id = str(item['id'])
        task_env["INSTANCE_ID"] = instance_id
        create_task(exec_bin=ANSIBLE_PLAYBOOK_COMMAND,
                    name='imunify_install',
                    params=["--inventory", item["host"] + ',', getcwd() + "/playbooks/imunify.yml"],
                    instance_id=instance_id,
                    task_env=task_env,
                    lock=IMUNIFY_LOCK.format(instance_id))


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--socket', required=True)
    args = parser.parse_args()

    log.basicConfig(filename="/var/log/imunify.log",
                    level=log.DEBUG,
                    format='%(asctime)s %(levelname)-8s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S')

    sock_path = args.socket
    log.debug("Creating unix socket '{}'".format(sock_path))

    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(sock_path)
    subprocess.call(['chmod', '0666', args.socket])

    app = web.Application()
    app.add_routes([make_get('/feature'),
                    make_get('/site/{site_id}/files/{type}'),
                    make_get('/site/{site_id}/preset/{preset_id}'),
                    make_get('/site/{site_id}/presets'),
                    make_get('/site/{site_id}/presets/default'),
                    make_get('/site/{site_id}/scan/history'),
                    make_get('/scan/result'),
                    make_post('/preset/{id}/status'),
                    make_post('/site/{site_id}/preset'),
                    make_post('/site/{site_id}/scan'),
                    make_delete('/site/{site_id}/files')])

    fields = [DbField("name", "VARCHAR", 128), DbField("value", "VARCHAR", 256)]
    create_table("settings", fields)

    fields = [DbField("id", "INT AUTO_INCREMENT PRIMARY KEY"),
              DbField("instance", "INT"),
              DbField("site_id", "INT"),
              DbField("task_id", "INT"),
              DbField("report", "JSON"),
              DbField("scan_date", "BIGINT"),
              DbField("preset_id", "BIGINT")]
    create_table("report", fields)

    fields = [DbField("id", "BIGINT AUTO_INCREMENT PRIMARY KEY"),
              DbField("iav_file_id", "BIGINT"),
              DbField("instance", "INT"),
              DbField("site_id", "INT"),
              DbField("path_hash", "VARCHAR", 32),
              DbField("file", "TEXT"),
              DbField("path", "TEXT"),
              DbField("status", FileStatus.to_sql_enum()),
              DbField("malicious_type", "VARCHAR", 255),
              DbField("last_modified", "BIGINT"),
              DbField("detected", "BIGINT"),
              DbField("created", "BIGINT")]
    indexes = [DbIndex("UNIQUE INDEX", "files", ["instance", "site_id", "path_hash"])]
    create_table("files", fields, indexes)

    fields = [DbField("id", "BIGINT AUTO_INCREMENT PRIMARY KEY"),
              DbField("instance", "INT"),
              DbField("site_id", "INT"),
              DbField("type", ScanType.to_sql_enum()),
              DbField("preset", "JSON"),
              DbField("date_use", "BIGINT"),
              DbField("is_active", "TINYINT", size=1, default="1")]
    create_table("presets", fields)
    install_imunufy()

    log.info("Starting Imunify service".format(sock_path))
    web.run_app(app, sock=sock)

    remove(args.socket)
    DB_CONNECTION.close()
