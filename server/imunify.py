#!/usr/bin/env python3
"""ImunifyAV plugin"""
from aiohttp import web, ClientSession, hdrs
from argparse import ArgumentParser
from consul import Consul
from enum import Enum
from hashlib import md5
from json import dumps, loads
from jsonschema import validate, ValidationError, SchemaError
from aiomysql import create_pool
from os import getenv, environ, remove, getcwd, path
from datetime import datetime
import base64
import calendar
import logging as log
import re
import socket
import subprocess
import websockets
import asyncio


TASK_CREATOR = '/opt/ispsystem/plugin_service/bin/task_creator'
ANSIBLE_PLAYBOOK_COMMAND = getenv("ANSIBLE_PLAYBOOK")
PROXY_SERVICE = getenv("PROXY_SERVICE")
SCHEMAS_PATH = 'schemas/'
MAX_REQUEST_ATTEMPTS = 10
MAX_REQUEST_INSTANCE_ATTEMPTS = 30
OPERATION_STATUS_SUCCESS = "success"
DEFAULT_LIMIT_VALUE = 15
LIMIT_REGEXP = r"^\d+,\d+$|^\d+$"
MIN_POOL_SIZE = 1
MAX_POOL_SIZE = 20  # Установить в 0 и не ограничивать размер пула?

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
    deleted = "DELETED"


class ScanType(BaseEnum):
    """Типы сканирования"""
    full = "FULL"
    partial = "PARTIAL"


class FileAction(BaseEnum):
    """Типы операций с файлами"""
    delete = "DELETE"
    cure = "CURE"
    restore = "RESTORE"


class NotifyConsul(Consul):
    def __init__(self):
        super(NotifyConsul, self).__init__(host=getenv("KV_STORAGE_ADDR"), port=8500)

    def put_key(self, instance_id: str, action: str, entity: str, notifies: list, addition=None):
        data = dict()
        data["notifies"] = notifies
        if addition:
            data["additional_data"] = addition

        self.kv.put(f"instance/{instance_id}/notify/{action}/{entity}", dumps(data))


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


async def create_table(name, table_fields, indexes=None):
    """
    Создание таблицы
    :param name: Название таблицы
    :param table_fields: Поля
    :param indexes: Индексы
    :return:
    """
    table_name = DB_PREFIX + name

    log.info("Create table: {}".format(table_name))
    async with app["DB_CONNECTION_POOL"].acquire() as connection:
        async with connection.cursor() as cur:
            command = "CREATE TABLE IF NOT EXISTS " + table_name + " ({})"
            fields_str = ', '.join(str(field) for field in table_fields)
            if indexes and fields_str:
                for index in indexes:
                    fields_str += ', {}'.format(str(index))

            command = command.format(fields_str)
            log.debug("Execute command: {}".format(command))
            await cur.execute(command)
            await cur.close()
            await connection.commit()


async def select(table: str, table_fields: list, where=None, params=None):
    """
    Метод, реализующий выборку из таблицы
    :param table: Название таблицы
    :param table_fields: Поля
    :param where: Условие по которому будет вестить выборка
    :param params: Параметры для подстановки
    :return:
    """
    async with app["DB_CONNECTION_POOL"].acquire() as connection:
        async with connection.cursor() as cur:
            fields_str = ', '.join(field.lower() for field in table_fields)
            query = "SELECT {} FROM {}".format(fields_str, DB_PREFIX + table)
            if where:
                query += " WHERE {}".format(where)

            log.debug("Execute query: '{}' with params: '{}'".format(query, str(params)))
            await cur.execute(query) if params is None else await cur.execute(query, params)
            row_headers = [x[0] for x in cur.description]
            rows = await cur.fetchall()
            await cur.close()
            await connection.commit()

            result = list()
            for row in rows:
                result.append(dict(zip(row_headers, row)))
            return result


async def insert(table: str, data: dict):
    """
    Метод, реализующий добавление записи в таблицу
    :param table: Название таблицы
    :param data: Словарь который содержит данные для вставки (поля в виде ключей и значения)
    :return:
    """
    async with app["DB_CONNECTION_POOL"].acquire() as connection:
        async with connection.cursor() as cur:
            fields_str = str()
            values_str = str()
            params = list()
            for field, value in data.items():
                if fields_str:
                    fields_str += ', '
                fields_str += field
                if values_str:
                    values_str += ', '
                values_str += "%s"
                params.append(value)

            query = "INSERT INTO {} ({}) VALUES ({})".format(DB_PREFIX + table, fields_str, values_str)

            log.debug("Execute query: '{}' with params: '{}'".format(query, str(params)))
            row_id = None
            try:
                await cur.execute(query, params)
                await connection.commit()
                row_id = cur.lastrowid
            except Exception as e:
                log.error("Error while execute query: '{}'".format(e))
            await cur.close()
            return row_id


async def update(table: str, data: dict, where=None, params=None):
    """
    Метод, реализующий обновление записи в таблицу
    :param table: Название таблицы
    :param data: Словарь который содержит данные для обновления данных полей
    :param where: Условие по которому будет выбрана запись или записи для обновления
    :param params: Параметры для подстановки
    :return:
    """
    async with app["DB_CONNECTION_POOL"].acquire() as connection:
        async with connection.cursor() as cur:
            key_values_str = str()
            arguments = list()
            for field, value in data.items():
                if key_values_str:
                    key_values_str += ', '
                key_values_str += "{}=%s".format(field, value)
                arguments.append(value)

            query = "UPDATE {} SET {}".format(DB_PREFIX + table, key_values_str)
            if where and params:
                query += " WHERE {}".format(where)
                arguments.extend(params)

            log.debug("Execute query: '{}' with params: '{}'".format(query, str(arguments)))
            await cur.execute(query, arguments)
            await connection.commit()
            await cur.close()


async def get_settings_value(instance_id, name, default=""):
    """
    Получение значения определенной настройки плагина по ключу
    :param instance_id: Идентификатор инстанса
    :param name: Название
    :param default: Дефолтное значение
    :return:
    """
    log.info("Get value '{}' from settings table for instance {}".format(name, instance_id))

    result = await select(table="settings", table_fields=["value"], where="instance=%s AND name=%s", params=(instance_id, name))
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
        await callback(task_info, scan_info)


def get_utc_timestamp():
    """
    Текущая дата в формате timestamp
    :return:
    """
    return calendar.timegm(datetime.utcnow().utctimetuple()) * 1000


async def instance_waiter(callback):
    """
    Механим отслеживания новых инстансов
    :param callback: Будет вызван как только инстанс будет создан
    :return:
    """
    log.debug("Begin new instance waiter")
    entities = {
        "entities": [
            {
                "entity": "instance",
                "type": [
                    {"name": "create", "action": "/auth/v3/instance/{instance_id}"}
                ]
            }
        ]
    }

    extra_headers = {"internal-auth": "on"}
    host, port = PROXY_SERVICE.split(':', 1)

    ws = await websockets.connect("ws://instance-auth/notifier", extra_headers=extra_headers, host=host, port=port)
    await ws.send(dumps(entities))
    while True:  # Пока не смог придумать адекватного решения
        result = await ws.recv()
        instance_info = loads(result)
        await callback(instance_info)


async def start_background_tasks(app):
    """
    Запуск background задач
    :param app: web.Application
    :return:
    """
    app['init_db'] = app.loop.create_task(init_db(app))


def get_file_status(action: str):
    """
    Возвращает статус файла для обновления
    :param action:
    :return:
    """
    if action == str(FileAction.delete):
        return str(FileStatus.deleted)
    if action == str(FileAction.cure):
        return str(FileStatus.cured)
    if action == str(FileAction.restore):
        return str(FileStatus.infected)


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


async def new_instance(instance_info: dict):
    """
    Callback на установку антивируса при создании нового инстанса
    :param instance_info: Информация об инстансе
    :return:
    """
    log.debug("Found new instance. Info: {}".format(dumps(instance_info)))
    instance_id = int(instance_info.get("id"))

    instance_data = instance_info.get("data", dict())
    product_name = instance_data.get("product", str())

    # Раньше проверяли еще и host
    # Но т.к. хост добавлется не сразу при создании инстанса, то эту проверку унес в get_vepp_list()
    if product_name == 'vepp':
        await install_imunufy(instance=instance_id)


async def get_instance(instance_id):
    """
    Получение информации об инстансе пользователя
    :param instance_id: Идентификатор инстанса
    :return:
    """
    attempt = 0
    request = None
    async with ClientSession() as ses:
        while attempt < MAX_REQUEST_INSTANCE_ATTEMPTS:
            request = await ses.get('http://{}/auth/v3/instance/{}'.format(PROXY_SERVICE, instance_id),
                                    headers={"internal-auth": "on"})
            log.debug("Attempt: '{}'. Status: '{}'. Response: '{}'".format(attempt, request.status, await request.text()))
            if request.status == 200:
                data = await request.json()
                host = data.get("host")
                if host:
                    log.debug("Recived host: '{}'".format(host))
                    break
            attempt += 1
            await asyncio.sleep(5)
        return request


async def get_vepp_list():
    """
    Получение списка инстансов на которых установлен vepp
    :return:
    """
    async with ClientSession() as ses:
        return await ses.get("http://" + PROXY_SERVICE + "/auth/v3/instance",
                             headers={"internal-auth": "on"},
                             params={"where": "product EQ 'vepp'"})

class SiteInfo:
    def __init__(self, res):
        self.status = res.status
        self.m_text = None
        self.m_json = None


    def json(self):
        return self.m_json


    def text(self):
        return self.m_text


class Imunify:
    """Основной класс, реализующий хендлеры"""
    async def __call__(self, request: web.Request) -> web.Response:
        """
        Предобработка пользовательского запроса
        :param request:
        :return:
        """
        handler_info = HandlerInfo(request)

        if handler_info.headers.get("internal-auth", None) is None:
            log.debug("Use ses6")
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
                    log.warning("Validation schema not found. Skiping...")
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
            response = None
            while attempts < MAX_REQUEST_ATTEMPTS:
                response = await ses.get("http://{}/isp/v3/site/{}".format(PROXY_SERVICE, site_id),
                                         headers={"Host": "instance-{}".format(instance_id)},
                                         cookies={"ses6": ses6})
                log.debug("Attempt: '{}'. Status: '{}'. Response: '{}'".format(attempts, response.status, response.text()))
                if response.status != 503:
                    break
                else:
                    attempts += 1
                    await asyncio.sleep(1)
            site_info = SiteInfo(response)
            if response.status != 200:
                site_info.m_text = await response.text()
            else:
                site_info.m_json = await response.json()
            return site_info

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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = site_info_response.json()

        request_body = await info.body
        response = await get_instance(info.instance_id)
        data = await response.json()
        log.debug(dumps(data))
        start_scan_time = get_utc_timestamp()
        host = data.get("host", "")
        preset_id = request_body.get("preset_id")

        result = await select(table='presets',
                              table_fields=['preset', 'type'],
                              where="id=%s AND instance=%s",
                              params=(preset_id, info.instance_id))
        if not result:
            return web.HTTPNotFound(text="The identifier of the preset for this instance is not valid or does not exist")

        fields = {"date_use": start_scan_time}
        await update(table='presets', data=fields, where="id=%s AND instance=%s", params=[preset_id, info.instance_id])

        preset_value = result[0]["preset"]
        log.debug("Scan params: {}".format(preset_value))
        preset = base64.b64encode(preset_value.encode("utf-8"))
        docroot = "{}/{}/".format(site_info["docroot_base"], site_info["docroot"])
        output = create_task(exec_bin="/var/www/imunify/scripts/run_scan.py",
                             name='scan-{}'.format(str(result[0]["type"]).lower()),
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
        where_statement = "task_id=%s AND scan_date=%s"
        while attempt < MAX_REQUEST_ATTEMPTS and not report_result:
            report_result = await select(table='report',
                                         table_fields=['report', 'scan_date', 'preset_id'],
                                         where=where_statement,
                                         params=(task_id, date))
            attempt += 1
            await asyncio.sleep(0.5)
        log.debug("Attempt: '{}'. Result: {}".format(attempt, report_result))

        if not report_result:
            return web.Response(text=dumps(list()))

        file_list = list()
        for file_id in loads(report_result[0]["report"])["infected"]:
            table_fields = ['id', 'file', 'status', 'malicious_type', 'path', 'detected', 'created', 'last_modified']
            result = await select(table='files', table_fields=table_fields, where="id=%s", params=(file_id))

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
            response = site_info_response.text()
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

        preset_id = await insert(table="presets", data=preset_info)
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

        fields = {"is_active": is_active}
        await update(table='presets', data=fields, where="id=%s AND instance=%s", params=[preset_id, info.instance_id])
        return web.Response(text=dumps({"preset_id": preset_id}))

    @staticmethod
    async def scan_done(task_info: dict, scan_info: dict):
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

        presets = await select(table='presets', table_fields=['type'], where="id=%s", params=(scan_info["preset_id"]))
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

            file_id = await insert(table="files", data=file_data)
            if not file_id:
                where_statement = "instance=%s AND site_id=%s AND path_hash=%s"
                file_row = await select(table="files",
                                        table_fields=["id"],
                                        where=where_statement,
                                        params=(scan_info["instance"], scan_info["site_id"], path_hash))
                file_id = file_row[0]["id"]

                data = {"iav_file_id": infected_file["iav_file_id"],
                        "status": infected_file["status"] if FileStatus.has_value(infected_file["status"]) else str(FileStatus.infected)}
                await update(table="files", data=data, where="id=%s", params=[file_id])

            report["infected"].append(file_id)
        report["cured"] = scan_report.get("cured", 0)
        report_data["report"] = dumps(report)
        await insert(table="report", data=report_data)

    @staticmethod
    async def files_done(task_info: dict, info: dict):
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
            file_status = get_file_status(info["action"].upper())
            for operation in operations:
                if operation["status"] == OPERATION_STATUS_SUCCESS:
                    fields = {"status": str(file_status)}
                    await update(table='files', data=fields, where="id=%s", params=[operation["id"]])

    @staticmethod
    async def get_feature(info: HandlerInfo):
        """
        Информация о состоянии плагина
        :param info: Информация о запросе
        :return:
        """
        is_pro_version = await get_settings_value(info.instance_id, "isProVersion", "False")
        has_scheduled_actions = await get_settings_value(info.instance_id, "hasScheduledActions", "False")
        # TODO(d.smirnov): убрать дефолтные значения, когда будут реальные данные
        resp = {"isProVersion": is_pro_version.get(),
                "hasScheduledActions": has_scheduled_actions.get()}
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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "date_use IN (SELECT MAX(date_use) FROM imunify_presets " \
                          "WHERE site_id=%s AND instance=%s GROUP BY type) " \
                          "AND site_id=%s AND instance=%s"
        presets = await select(table="presets",
                               table_fields=["id", "type", "preset", "is_active"],
                               where=where_statement,
                               params=(site_id, info.instance_id, site_id, info.instance_id))

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
            preset_id = await insert(table="presets", data=preset_info)
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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = site_info_response.json()

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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "id=%s AND site_id=%s AND instance=%s"
        presets = await select(table="presets",
                               table_fields=["id", "type", "preset", "is_active"],
                               where=where_statement,
                               params=(preset_id, site_id, info.instance_id))

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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        where_statement = "instance=%s AND site_id=%s "
        order_statement = "ORDER BY scan_date DESC "
        all_rows = await select(table="report",
                                table_fields=["COUNT(*) as count"],
                                where=where_statement + order_statement,
                                params=(info.instance_id, site_id))

        scan_type = info.query_params.get("type", str())
        params = [info.instance_id, site_id]
        if scan_type:
            where_statement += "AND report->'$.type' = %s "
            params.append(scan_type)
        where_statement += order_statement + get_limit_value(info.query_params.get("limit", str(DEFAULT_LIMIT_VALUE)))
        reports = await select(table="report",
                               table_fields=["report", "scan_date", "preset_id"],
                               where=where_statement,
                               params=params)

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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        file_type = info.path_params.get("type").upper()
        if not FileStatus.has_value(file_type):
            return web.HTTPBadRequest(text="File type is not valid")

        table_fields = ["id", "file", "status", "malicious_type", "path", "detected", "created", "last_modified"]
        where_statement = "site_id=%s AND instance=%s AND status=%s ORDER BY detected DESC"
        all_rows = await select(table="files",
                                table_fields=["COUNT(*) as count"],
                                where=where_statement,
                                params=(site_id, info.instance_id, file_type))

        where_statement += get_limit_value(info.query_params.get("limit", str(DEFAULT_LIMIT_VALUE)))
        files = await select(table="files",
                             table_fields=table_fields,
                             where=where_statement,
                             params=(site_id, info.instance_id, file_type))

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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)
        site_info = site_info_response.json()

        file_ids = request_body.get("files")
        response = await get_instance(info.instance_id)
        data = await response.json()
        host = data.get("host", "")

        ids = ",".join(str(id) for id in file_ids)
        where_statement = "id IN ({}) AND status=%s AND site_id=%s AND instance=%s".format(ids)
        files = await select(table="files",
                             table_fields=["id", "iav_file_id", "file", "path"],
                             where=where_statement,
                             params=(str(FileStatus.infected), site_id, info.instance_id))

        if not files:
            return web.HTTPNotFound(text="There is no files to delete")

        params = ["--host", host, "--action", str(FileAction.delete).lower()]
        for file in files:
            path = site_info["docroot_base"] + "/" + site_info["docroot"] + file["path"] + "/" + file["file"]
            params.append("--file")
            params.append(str(file["id"]))
            params.append(str(file["iav_file_id"]))

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

    async def post_site_site_id_files(self, info: HandlerInfo):
        """
        Операции с файлами
        TODO(d.vitvitskii) Вынести операции с файлами по разным хендлерам
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
            response = site_info_response.text()
            return web.Response(text=response, status=site_info_response.status)

        file_ids = request_body.get("files")
        action = request_body.get("action").upper()
        if not FileAction.has_value(action):
            return web.HTTPNotFound(text="There is no handler to process this action")

        response = await get_instance(info.instance_id)
        data = await response.json()
        host = data.get("host", "")

        file_status = str(FileStatus.cured) if action == str(FileAction.restore) else str(FileStatus.infected)

        ids = str()
        if not file_ids:
            where_statement = "instance=%s AND site_id=%s AND status=%s "
            ids = ",".join(str(file_data["id"]) for file_data in await select(table="files", table_fields=["id"], where=where_statement, params=(info.instance_id, site_id, file_status)))
        else:
            ids = ",".join(str(id) for id in file_ids)
        where_statement = "id IN ({}) AND status=%s AND site_id=%s AND instance=%s".format(ids)
        files = await select(table="files",
                             table_fields=["id", "iav_file_id", "file", "path"],
                             where=where_statement,
                             params=(file_status, site_id, info.instance_id))

        if not files:
            return web.HTTPNotFound(text="There is no files to process")

        params = ["--host", host, "--action", action.lower()]
        for file in files:
            params.append("--file")
            params.append(str(file["id"]))
            params.append(str(file["iav_file_id"]))

        output = create_task(exec_bin="/var/www/imunify/scripts/files.py",
                             name='files-{}'.format(action.lower()),
                             params=params,
                             instance_id=info.instance_id,
                             task_env={"INSTANCE_ID": info.instance_id, "LOG_SETTINGS_FILE_LEVEL": "debug"},
                             notify={"entity": "plugin", "id": int(getenv("PLUGIN_ID"))})

        result = loads(output)
        loop = asyncio.get_event_loop()
        info = {
            "instance": info.instance_id,
            "ses6": info.ses6,
            "action": action
        }
        loop.create_task(task_wait(result['task_id'], info, self.files_done))
        result = loads(output)
        return web.Response(text=dumps(result))

    async def post_register(self, info: HandlerInfo):
        """
        Активация Imunify
        :param info: Информация о запросе
        :return:
        """
        request_body = await info.body
        notify_consul = NotifyConsul()
        plugin_id = getenv("PLUGIN_ID")

        license = request_body.get("license")
        log.debug("License: {}".format(str(license)))

        instance_id = request_body.get("instance")
        lic_key = license.get("lickey", str())

        if not lic_key:
            notify_consul.put_key(str(instance_id), "update", "plugin", [f"plugin/{plugin_id}"], addition={
                "name": "plugin-activate",
                "reason": "License key not found",
                "status": "failed"
            })
            return web.HTTPBadRequest(text="License key not found")

        instance_info = await get_instance(instance_id)
        if instance_info.status != 200:
            response = await instance_info.text()
            log.error("Instance '{}' not found. Error: '{}'".format(str(instance_id), response))
            return web.Response(text=response, status=instance_info.status)

        data = await instance_info.json()
        host = data.get("host", "")

        notify_consul.put_key(str(instance_id), "update", "plugin", [f"plugin/{plugin_id}"], addition={
            "name": "plugin-activate",
            "status": "running"
        })

        env = environ.copy()
        env["INSTANCE_ID"] = str(instance_id)
        cmd = ["/usr/bin/ssh", "-o", "StrictHostKeyChecking=no", "root@" + host, "imunify-antivirus", "register", lic_key, "--json"]

        attempt = 0
        result = {}
        while attempt < MAX_REQUEST_ATTEMPTS:
            attempt += 1
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
            proc.wait()

            proc_stdout = proc.stdout.read().decode("utf-8")
            proc_stderr = proc.stderr.read().decode("utf-8")

            log.debug("Attempt: '{}' Run command: '{}'. Return code: '{}'. STDOUT: '{}', STDERR: '{}'".format(attempt, str(cmd), str(proc.returncode), proc_stdout, proc_stderr))
            if proc.returncode:
                result = {"stdout": proc_stdout, "stderr": proc_stderr}
                log.error("Attempt: '{}' '{}'".format(attempt, dumps(result)))
                await asyncio.sleep(1)
            else:
                await update("settings", data={"value": "True"}, where="instance=%s AND name=%s", params=[instance_id, "isProVersion"])
                notify_consul.put_key(str(instance_id), "update", "plugin", [f"plugin/{plugin_id}"], addition={
                    "name": "plugin-activate",
                    "status": "complete"
                })
                return web.HTTPOk(text=proc_stdout)

        notify_consul.put_key(str(instance_id), "update", "plugin", [f"plugin/{plugin_id}"], addition={
            "name": "plugin-activate",
            "reason": "License key not found",
            "status": "failed"
        })
        return web.HTTPBadRequest(text=dumps(result))


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


async def install_imunufy(instance=None):
    """
    Установка антивируса
    Вызывается при старте основного приложения и устанавливает антивирус на все существующие инстансы vepp'а
    Выступает в качестве callback'а для фоновой задачи, которая отслеживает новые инстансы
    :return:
    """
    log.debug("Start installing ImunifyAV")
    vepp_list = list()
    try:
        response = await get_vepp_list() if (instance is None) else await get_instance(instance)
        if response.status == 200:
            data = await response.json()
            vepp_list = data['list'] if instance is None else [data]
    except ValueError as e:
        log.error("Can not get instance or instances. Error '{}'".format(e))

    task_env = {
        "ANSIBLE_LOAD_CALLBACK_PLUGINS": "True",
        "ANSIBLE_STDOUT_CALLBACK": "json",
        "ANSIBLE_HOST_KEY_CHECKING": "False",
        "SCAN_SCRIPT_PATH": getcwd() + "/scripts/scan.py",
        "HEAL_SCRIPT_PATH": getcwd() + "/scripts/heal.py",
        "INSTANCE_ID": ""
    }

    for item in vepp_list:
        instance_id = str(item['id'])
        if not item.get("host", ""):
            log.error("Can not get host for instance {}".format(instance_id))
            continue
        task_env["INSTANCE_ID"] = instance_id
        output = create_task(exec_bin=ANSIBLE_PLAYBOOK_COMMAND,
                             name='imunify_install',
                             params=["--inventory", item["host"] + ',', getcwd() + "/playbooks/imunify.yml"],
                             instance_id=instance_id,
                             task_env=task_env,
                             lock=IMUNIFY_LOCK.format(instance_id))
        log.debug("Install task id: {}".format(output))
        await insert("settings", data={"instance": item['id'], "name": "isProVersion", "value": "False"})
        await insert("settings", data={"instance": item['id'], "name": "hasScheduledActions", "value": "False"})


async def init_db(app):
    app["DB_CONNECTION_POOL"] = await create_pool(host='mysql',
                                                  port=3306,
                                                  user=getenv('MYSQL_USER'),
                                                  password=getenv('MYSQL_PASSWORD'),
                                                  db=getenv('MYSQL_DATABASE'),
                                                  minsize=MIN_POOL_SIZE,
                                                  maxsize=MAX_POOL_SIZE,
                                                  autocommit=False)
    fields = [DbField("instance", "INT"),
              DbField("name", "VARCHAR", 128),
              DbField("value", "VARCHAR", 256)]
    indexes = [DbIndex("UNIQUE INDEX", "settings", ["instance", "name"])]
    await create_table("settings", fields, indexes)

    fields = [DbField("id", "INT AUTO_INCREMENT PRIMARY KEY"),
              DbField("instance", "INT"),
              DbField("site_id", "INT"),
              DbField("task_id", "INT"),
              DbField("report", "JSON"),
              DbField("scan_date", "BIGINT"),
              DbField("preset_id", "BIGINT")]
    await create_table("report", fields)

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
    await create_table("files", fields, indexes)

    fields = [DbField("id", "BIGINT AUTO_INCREMENT PRIMARY KEY"),
              DbField("instance", "INT"),
              DbField("site_id", "INT"),
              DbField("type", ScanType.to_sql_enum()),
              DbField("preset", "JSON"),
              DbField("date_use", "BIGINT"),
              DbField("is_active", "TINYINT", size=1, default="1")]
    await create_table("presets", fields)

    app['install_imunify'] = app.loop.create_task(install_imunufy())  # Установка антивируса на уже имеющиеся инстансы
    app['instance_waiter'] = app.loop.create_task(instance_waiter(new_instance))

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
    app.on_startup.append(start_background_tasks)
    # Возможно стоит добавить on_cleanup

    app.add_routes([make_get('/feature'),
                    make_get('/site/{site_id}/files/{type}'),
                    make_get('/site/{site_id}/preset/{preset_id}'),
                    make_get('/site/{site_id}/presets'),
                    make_get('/site/{site_id}/presets/default'),
                    make_get('/site/{site_id}/scan/history'),
                    make_get('/scan/result'),
                    make_post('/preset/{id}/status'),
                    make_post('/site/{site_id}/files'),
                    make_post('/site/{site_id}/preset'),
                    make_post('/site/{site_id}/scan'),
                    make_post('/register'),
                    make_delete('/site/{site_id}/files')])

    log.info("Starting Imunify service".format(sock_path))
    web.run_app(app, sock=sock)

    remove(args.socket)
