#!/usr/bin/env python3
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

DB_CONNECTION = connector.connect(
    host='mysql',
    user=getenv('MYSQL_USER'),
    passwd=getenv('MYSQL_PASSWORD'),
    database=getenv('MYSQL_DATABASE')
)

DB_PREFIX = 'imunify_'
INSTALL_LOCK = "imunify-instance-{}"


class BaseEnum(Enum):
    def __str__(self):
        return self.value

    @classmethod
    def to_sql_enum(cls):
        types_str = ','.join(["'{}'".format(status) for status in cls])
        return "ENUM ({})".format(types_str)

    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class FileStatus(BaseEnum):
    infected = "INFECTED"
    cured = "CURED"
    added_to_exceptions = "EXCEPTED"
    healing = "HEALING"


class ScanType(BaseEnum):
    full = "FULL"
    partial = "PARTIAL"


class Value:
    def __init__(self, val: str):
        self._val = val

    def get(self):
        if self._val == 'False':
            return False
        if self._val == 'True':
            return True
        return self._val


def create_table(name, table_fields, indexes=None):
    table_name = DB_PREFIX + name

    log.info("Create table: {}".format(table_name))
    cur = DB_CONNECTION.cursor()
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    cur.fetchall()
    if cur.rowcount > 0:
        log.debug("Table {} already exists".format(table_name))
        return

    command = "CREATE TABLE " + table_name + " ({})"
    fields_str = str()

    for field in table_fields:
        if fields_str:
            fields_str += ', '
        fields_str += str(field)

    if indexes and fields_str:
        for index in indexes:
            fields_str += ', {}'.format(str(index))

    command = command.format(fields_str)
    log.debug("Execute command: {}".format(command))
    cur.execute(command)
    cur.close()
    DB_CONNECTION.commit()


def select(table: str, table_fields: list, where=None):
    cur = DB_CONNECTION.cursor()

    fields_str = str()
    for field in table_fields:
        if fields_str:
            fields_str += ', '
        fields_str += field.lower()

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
    cur = DB_CONNECTION.cursor()

    fields_str = str()
    values_str = str()
    for field, value in data.items():
        if fields_str:
            fields_str += ', '
        fields_str += field
        if values_str:
            values_str += ', '
        values_str += "'{}'".format(value) if type(value) is str else str(value)

    query = "INSERT INTO {} ({}) VALUES ({})".format(DB_PREFIX + table, fields_str, values_str)

    # TODO(d.vitvitskii) Сделать обработку на Exception во всех запросах
    log.debug("Execute query: '{}'".format(query))
    cur.execute(query)
    DB_CONNECTION.commit()
    id = cur.lastrowid
    cur.close()
    return id


def update(table: str, data: dict, where=None):
    cur = DB_CONNECTION.cursor()

    key_values_str = str()
    for field, value in data.items():
        if key_values_str:
            key_values_str += ', '
        value = "'{}'".format(value) if type(value) is str else str(value)
        key_values_str += "{}={}".format(field, value)

    query = "UPDATE {} SET {}".format(DB_PREFIX + table, key_values_str)
    if where:
        query += " WHERE {}".format(where)

    log.debug("Execute query: '{}'".format(query))
    cur.execute(query)
    DB_CONNECTION.commit()
    cur.close()


def get_settings_value(name, default=""):
    log.info("Get value '{}' from settings table".format(name))

    result = select(table="settings", table_fields=["value"], where="name='{}'".format(name))
    return Value(result[0]['value'] if len(result) > 0 else default)


def get_site_info(instance_id, site_id):
    """
    Получение информации о сайте
    :param instance_id: Идентификатор инстанса пользователя
    :param site_id: Идентификатор сайта пользователя
    :return: Информация о сайте
    """
    attempts = 0
    while attempts < MAX_REQUEST_ATTEMPTS:
        response = requests.get("http://{}/isp/v3/site/{}".format(PROXY_SERVICE, site_id),
                                headers={"internal-auth": "on",
                                         "Host": "instance-{}".format(instance_id)})
        if response.status_code == 200:
            log.debug("Attempt '{}'. Response: {}".format(attempts, response.content))
            return response.json()
        attempts += 1
        time.sleep(1)
    return {}


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


def get_value(struct: dict, pointer: str, default=None, delimiter="/"):
    """
    Реализует механизм доступа к элементам n-й вложенности словаря или json'a
    Позволяет не проверять каждую ноду на существование и обходить Exception
    Пока не работает с массивами!!!
    TODO(d.vitvitskii) Реализовать возможность работы с массивом

    :param struct: Объект словаря или json'a
    :param pointer: Указатель на необъодимую ноду ("qwe/qw/q")
    :param default: Дефолтное значение котороое будет возвращено если нода не найдена (default = None)
    :param delimiter: Разделитель нод в указателе (default = "/")
    :return:
    """
    result = struct
    for node in pointer.split(delimiter):
        try:
            result = result.get(node)
        except ValueError:
            return default
    return result


def create_task(exec_bin, name, instance_id, params=[], task_env={}, notify={}, lock=""):
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


async def task_wait(task_id: int, instance_id: str, site_id: int, ses6: str, started: int, preset_id: int, callback):
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

    extra_headers = {"Cookie": "ses6=" + ses6}
    host, port = PROXY_SERVICE.split(':', 1)
    async with websockets.connect("ws://instance-{}/notifier".format(instance_id),
                                  extra_headers=extra_headers,
                                  host=host,
                                  port=port) as ws:
        await ws.send(dumps(entities))

        result = await ws.recv()
        task_info = loads(result)
        callback(task_info, instance_id, site_id, started, preset_id)


def get_utc_timestamp():
    return calendar.timegm(datetime.utcnow().utctimetuple()) * 1000


class List:
    def __init__(self, list_: list):
        self.content = {'list': list_, 'size': len(list_)}

    def __str__(self):
        return dumps(self.content)


def get_handler_name(path_: str, path_params: dict):
    handler = path_.replace('/', '_')
    for key, value in path_params.items():
        handler = handler.replace(value, key)
    return handler


def get_schema_path(handler: str):
    return SCHEMAS_PATH + handler[1:] + ".json"


def get_default_preset():
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
        return self.__request.match_info

    @property
    def query_params(self):
        return self.__request.rel_url.query

    @property
    def path(self):
        return self.__request.path

    @property
    async def body(self) -> dict:
        return await self.__request.json()


class Imunify:
    async def __call__(self, request: web.Request) -> web.Response:
        handler_info = HandlerInfo(request)

        who_ami = await self.who_ami(handler_info.instance_id, handler_info.ses6)
        if who_ami.status != 200:
            return web.Response(text=await who_ami.text(), status=who_ami.status, content_type='application/json')

        handler = get_handler_name(handler_info.path, handler_info.path_params)
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
        async with ClientSession() as ses:
            return await ses.get('http://{}/auth/v3/whoami'.format(PROXY_SERVICE),
                                 headers={'Instance-ID': instance_id},
                                 cookies={'ses6': ses6})

    @staticmethod
    async def get_instance(instance_id):
        async with ClientSession() as ses:
            return await ses.get('http://{}/auth/v3/instance/{}'.format(PROXY_SERVICE, instance_id),
                                 headers={"internal-auth": "on"})

    async def _site_sid_scan(self, info: HandlerInfo):
        try:
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            return web.Response(text="Bad request", status=400, content_type="text")

        request_body = await info.body
        response = await self.get_instance(info.instance_id)
        data = await response.json()
        log.debug(dumps(data))
        start_scan_time = get_utc_timestamp()
        host = data.get("host", "")
        preset_id = request_body.get("preset_id")

        where_statement = "id={}".format(preset_id)
        table_fields = ['preset']
        result = select(table='presets', table_fields=table_fields, where=where_statement)

        if not result:
            return web.Response(text="No such preset", status=404, content_type='text')

        # TODO (d.vitvitskii) Сделать через base64
        preset = "'{}'".format(result[0]["preset"])
        log.debug("Scan params: {}".format(preset))
        preset = base64.b64encode(result[0]["preset"].encode("utf-8"))
        log.debug("Scan params: {}".format(preset))
        output = create_task(exec_bin="/var/www/imunify/scripts/run_scan.py",
                             name='scan',
                             params=["--address", host, "--params", preset.decode(), "--started", str(start_scan_time)],
                             instance_id=info.instance_id,
                             task_env={"INSTANCE_ID": info.instance_id, "LOG_SETTINGS_FILE_LEVEL": "debug"},
                             notify={"entity": "plugin", "id": int(getenv("PLUGIN_ID"))})

        result = loads(output)
        loop = asyncio.get_event_loop()
        loop.create_task(task_wait(result['task_id'], info.instance_id, site_id, info.ses6, start_scan_time, preset_id, self.scan_done))
        result["started"] = start_scan_time
        return web.Response(text=dumps(result))

    async def _scan_result(self, info: HandlerInfo):
        """
        Результаты сканирования
        Нотификатор не возвращает данные которые мы записываем после того как таска завершилась, только output таски
        Для фронта необходимо после сканирования получать найденные файлы вместе с их идентификаторами
        :param info:
        :return:
        """
        params = info.query_params
        try:
            task_id = int(params.get("task_id", 0))
            date = int(params.get("started", 0))
        except ValueError:
            return web.Response(text=dumps(list()))

        where_statement = "task_id={} AND scan_date={}".format(task_id, date)

        attempt = 0

        result = list()
        while attempt < MAX_REQUEST_ATTEMPTS and not result:
            result = select(table='report', table_fields=['report', 'scan_date'], where=where_statement)
            attempt += 1
            time.sleep(0.5)
        log.debug("Attempt: '{}'. Result: {}".format(attempt, result))

        if not result:
            return web.Response(text=dumps(list()))

        file_list = list()
        for file_id in loads(result[0]["report"])["infected"]:
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
        return web.Response(text=dumps(file_list))

    @staticmethod
    async def _site_sid_preset(info: HandlerInfo):
        request_body = await info.body
        try:
            # TODO(d.vitvitskii) Проверять существует ли такой сайт
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            # TODO(d.vitvitskii) Определиться с ошибкой и форматом ответа
            return web.Response(text="Bad request", status=400, content_type="text")

        scan_type = request_body.get("scan_type")
        preset = request_body.get("preset")

        preset_info = {
            "instance": info.instance_id,
            "site_id": site_id,
            "type": scan_type,
            "preset": dumps(preset),
            "date_use": get_utc_timestamp()
        }

        try:
            # TODO(d.vitvitskii) Уйти от этой конструкции. Обработку ошибки сделать в insert()
            preset_id = insert(table="presets", data=preset_info)
        except Exception as e:
            log.error("Error while creating preset: '{}'".format(e))
            return web.Response(text="Error while creating preset", status=500, content_type='text')
        result = {"preset_id": preset_id}
        return web.Response(text=dumps(result))

    @staticmethod
    async def _preset_id_status(info: HandlerInfo):
        request_body = await info.body
        try:
            preset_id = int(info.path_params.get("id"))
            is_active = bool(request_body.get("is_active"))
        except ValueError:
            return web.HTTPBadRequest(text="Bad request")

        where_statement = "id={} AND instance={}".format(preset_id, info.instance_id)
        fields = {"is_active": is_active}
        update(table='presets', data=fields, where=where_statement)
        return web.Response(text="")

    @staticmethod
    def scan_done(task_info: dict, instance_id: str, site_id: int, started: int, preset_id: int):
        """
        Callback которы будет вызван после завершения задачи на сканирование
        :param task_info: Таска
        :param instance_id: Идентификатор инстанса
        :param site_id: Идентификатор сайта
        :param started: Время начала сканирования
        :return:
        """
        log.debug("Task ended. Info: {}".format(dumps(task_info)))
        site_info = get_site_info(instance_id, site_id)

        scan_report = get_value(task_info, "additional_data/output/content/scan", dict())
        report_data = {
            "instance": int(instance_id),
            "site_id": site_id,
            "task_id": task_info["id"],
            "scan_date": started,
            "preset_id": preset_id
        }

        where_statement = "id={}".format(preset_id)
        presets = select(table='presets', table_fields=['type'], where=where_statement)

        report = {"type": presets[0]["type"], "infected": []}

        for infected_file in scan_report.get("infected", []):
            # TODO(pirozhok) Унести получение docroot в scan на момент старта
            file = get_file(site_info["docroot_base"], site_info["docroot"], infected_file["file"])
            full_path = file["path"] + file["name"]

            path_hash = md5(full_path.encode("utf-8")).hexdigest()
            file_data = {
                "instance": int(instance_id),
                "site_id": site_id,
                "path_hash": path_hash,
                "file": file["name"],
                "path": file["path"],
                "status": str(FileStatus.infected),
                "malicious_type": infected_file["malicious_type"],
                "last_modified": started,
                "detected": started,
                "created": scan_report["started"]
            }
            try:
                # TODO(d.vitvitskii) Уйти от этой конструкции. Обработку ошибки сделать в insert()
                file_id = insert(table="files", data=file_data)
            except Exception:
                where_statement = "instance={} AND site_id={} AND path_hash='{}'".format(instance_id, site_id, path_hash)
                file_row = select(table="files", table_fields=["id"], where=where_statement)
                file_id = file_row[0]["id"]

            report["infected"].append(file_id)
        report_data["report"] = dumps(report)
        insert(table="report", data=report_data)

    @staticmethod
    async def _feature(_):
        # TODO(d.smirnov): убрать дефолтные значения, когда будут реальные данные
        resp = {"isProVersion": get_settings_value("isProVersion", "False").get(),
                "hasScheduledActions": get_settings_value("hasScheduledActions", "False").get()}
        return web.Response(text=dumps(resp))

    @staticmethod
    async def _infected(info: HandlerInfo):
        where_statement = "instance='{}' AND id=(SELECT max(id) from {})".format(info.instance_id, DB_PREFIX + 'report')

        report = select(table='report', table_fields=['report', 'scan_date'], where=where_statement)
        log.debug("Last report for instance {}".format(report))

        result = list()
        if report:
            infected = loads(report[0]['report']).get('infected', list())
            date_found = report[0]['scan_date']
            for file in infected:
                result += [{'file': file, 'date_found': date_found}]

        return web.Response(text=str(List(result)))

    @staticmethod
    async def _site_sid_presets(info: HandlerInfo):
        try:
            # TODO(d.vitvitskii) Проверять существует ли такой сайт
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            # TODO(d.vitvitskii) Определиться с ошибкой и форматом ответа
            return web.Response(text="Bad request", status=400, content_type="text")

        # TODO(d.vtvitskii) Оптимизировать запрос
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
            type = "full" if data["type"] == str(ScanType.full) else str(ScanType.partial)
            preset["id"] = data["id"]
            preset["isActive"] = bool(data["is_active"])
            presets_list[type] = preset
        return web.Response(text=dumps(presets_list))

    @staticmethod
    async def _site_sid_presets_default(info: HandlerInfo):
        try:
            # TODO(d.vitvitskii) Проверять существует ли такой сайт
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            # TODO(d.vitvitskii) Определиться с ошибкой и форматом ответа
            return web.Response(text="Bad request", status=400, content_type="text")

        try:
            with open("etc/default_preset.json", "r") as default_preset_file:
                default_preset = loads(default_preset_file.read())
        except IOError as e:
            log.error("Can not open default preset file: '{}'".format(e))
            return web.Response(text="Bad request", status=400, content_type="text")
        except ValueError as e:
            log.error("Can not parse preset file: '{}'".format(e))
            return web.Response(text="Bad request", status=400, content_type="text")

        site_info = get_site_info(info.instance_id, site_id)
        if not site_info:
            return web.Response(text="Bad request", status=400, content_type="text")

        # TODO(d.vitvitskii) Пока хардкодим. Нужно обсудить как формировать путь
        path = "/www/{}".format(site_info["docroot"])
        default_preset["docroot"] = path

        return web.Response(text=dumps(default_preset))

    @staticmethod
    async def _site_sid_preset_id(info: HandlerInfo):
        try:
            preset_id = int(info.path_params.get("id"))
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            # TODO(d.vitvitskii) Определиться с ошибкой и форматом ответа
            return web.Response(text="Bad request", status=400, content_type="text")

        # TODO(d.vtvitskii) Оптимизировать запрос
        where_statement = "id={} AND site_id={} AND instance={}".format(preset_id, site_id, info.instance_id)
        presets = select(table="presets", table_fields=["id", "type", "preset", "is_active"], where=where_statement)

        if not presets:
            return web.HTTPNotFound(text="Preset not found")

        preset_info = presets[0]
        preset = loads(preset_info["preset"])
        preset["id"] = preset_info["id"]
        preset["isActive"] = preset_info["is_active"]

        return web.Response(text=dumps(preset))

    @staticmethod
    async def _site_sid_scan_history(info: HandlerInfo):
        report_list = list()
        try:
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            return web.Response(text=str(List(report_list)))

        reports = select(table="report",
                         table_fields=["report", "scan_date", "preset_id"],
                         where="instance={} AND site_id={}".format(info.instance_id, site_id))

        for scan in reports:
            report = loads(scan["report"])
            report_list.append({
                "date": scan["scan_date"],
                "checkType": report["type"],
                "infectedFilesCount": len(report["infected"]),
                "curedFilesCount": 0,
                "scanOptionId": scan["preset_id"]
            })
        return web.Response(text=str(List(report_list)))

    @staticmethod
    async def _site_sid_files_type(info: HandlerInfo):
        file_list = list()
        try:
            site_id = int(info.path_params.get("sid"))
        except ValueError:
            return web.Response(text="Bad request", status=400, content_type="text")

        file_type = info.path_params.get("type").upper()
        if not FileStatus.has_value(file_type):
            return web.Response(text="Bad request", status=400, content_type="text")

        table_fields = ["id", "file", "status", "malicious_type", "path", "detected", "created",  "last_modified"]
        files = select(table="files", table_fields=table_fields,  where="site_id={} AND instance={}".format(site_id, info.instance_id))

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
        return web.Response(text=str(List(file_list)))

imunify = Imunify()


def make_get(name):
    return web.get(name, imunify)


def make_post(name):
    return web.post(name, imunify)


class DbField:
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
    def __init__(self, type: str, name: str, fields: list):
        self._type = type
        self._fields = fields
        self._name = name

    def __str__(self):
        index_str = ','.join(self._fields)
        return "{} index_{} ({})".format(self._type, self._name, index_str)


def install_imunufy():
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
                    lock=INSTALL_LOCK.format(instance_id))


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
                    make_get('/infected'),
                    make_get('/site/{sid}/files/{type}'),
                    make_get('/site/{sid}/preset/{id}'),
                    make_get('/site/{sid}/presets'),
                    make_get('/site/{sid}/presets/default'),
                    make_get('/site/{sid}/scan/history'),
                    make_get('/scan/result'),
                    make_post('/preset/{id}/status'),
                    make_post('/site/{sid}/preset'),
                    make_post('/site/{sid}/scan')])

    fields = [DbField("name", "VARCHAR", 128), DbField("value", "VARCHAR", 256)]
    create_table("settings", fields)

    fields = [DbField("id", "INT AUTO_INCREMENT PRIMARY KEY"),
              DbField("instance", "INT"),  # TODO(d.vitvitskii) Добавить индекс
              DbField("site_id", "INT"),
              DbField("task_id", "INT"),
              DbField("report", "JSON"),
              DbField("scan_date", "BIGINT"),
              DbField("preset_id", "BIGINT")]
    create_table("report", fields)

    fields = [DbField("id", "BIGINT AUTO_INCREMENT PRIMARY KEY"),
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

    log.info("Starting Imunify sevice".format(sock_path))
    web.run_app(app, sock=sock)

    remove(args.socket)
    DB_CONNECTION.close()
