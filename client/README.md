🛠 Documentation status: IN PROCESS

# client/imunify-plugin

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Клиентская часть плагина Imunify для vepp.

## Разработка
1. Установить [nodejs](https://nodejs.org/en/).
2. Запуск разработки `npm run dev`.
3. Сборка `npm run build`.


## Code style


### Порядок свойств методов и других элементов в компоненте:

1. Приватные и собственные свойства класса.
1. Свойства с декоратором @Element().
1. Свойства с декоратором @Prop().
1. Свойства с декоратором @State().
1. Свойства с декоратором @Event().
1. Методы с декоратором @Watch.
1. Методы с декоратором @Listen.
1. Методы с декоратором @Method.
1. Actions глобального state, если используется Redux.
1. Методы событий жизненного цикла (Component lifecycle events).
1. Другие методы класса (обработчики событий или вспомогательные методы).
1. Метод render.


### Линтеры и форматирование

В проекте используется [ESLint](https://eslint.org) и [Prettier](https://prettier.io). Каждый коммит проходит проверку на соответствие принятому формату кода. Замечания по стилям и формату написания делятся на два вида: ошибки, предупреждения. **Ошибки** не позволят выполнить коммит. **Предупреждения** в идеале также должны отсутствовать, но они не будут останавливать процесс коммита изменений.


### Изменение настроек Code style

Если необходимо изменить правила ESLint, Pretties или других правил, настроек или скриптов для процесса разработки, то создаем под это отдельную ветку.

#### Полезные ссылки:

1. [Configuring ESLint](https://eslint.org/docs/user-guide/configuring).
1. [Using ESLint and Prettier in a TypeScript Project](https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb).
1. [Configuring ESLint on a TypeScript project](https://javascriptplayground.com/typescript-eslint/).


### Особенности Code style данного проекта

В качестве правил для компонентов используются [правила React](https://github.com/yannickcr/eslint-plugin-react) с [рядом исключений](https://stackoverflow.com/questions/42541559/eslint-with-react-gives-no-unused-vars-errors) т.к. [Stencil проект с правилами](https://github.com/ionic-team/stencil-eslint) очень ограничен и не выполняет нужных функций.


Используется ESLint, а не TSLint. Причина в том, что команда TSLint приняла решение двигаться в сторону расширения правил ESLint, а не поддерживать отдельный линтер ([статья на medium](https://medium.com/palantir/tslint-in-2019-1a144c2317a9)). 

Основными правилами для TypeScript являются [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint).
Посмотреть работу конкретного правила для него можно [здесь](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules).


## Git

Все MR/PR в клиентский проект плагина должны быть оформлены согласно [конвенции](https://www.conventionalcommits.org/ru/v1.0.0-beta.4/).

Проверка коммита осуществляется по хуку утилитой https://github.com/conventional-changelog/commitlint.

Пример коммита:
```

    style(antivirus-card): 🎨 codestyle preview component

    Closes: #AS-1491


```

Для упрощения работы в командной строке используются утилиты
https://github.com/commitizen/cz-cli
https://github.com/streamich/git-cz


Чтобы оформить коммит выполните следующие команды из директории `.../imunify/client`:

- Добавляем файлы для коммита
  
  `git add .`

- Вызываем утилиты **commitizen** и с адаптером **git-cz**
  
  `npx git cz`

  или

  `npm run cz`

  или, если **commitizen** установлен глобально

  `git cz`

- Следуем инструкциям в командной строке.

#### Полезные ссылки:
1. [ENSURE COMMIT MESSAGES ARE WELL WRITTEN](https://delicious-insights.com/en/posts/git-hooks-commit/).
1. [Как генерировать осмысленные коммиты. Применяем стандарт Conventional Commits](https://habr.com/ru/company/yandex/blog/431432/).


## TODO

1. На текущий момент используется локальный билд утилиты git-cz. После мерджа и выпуска версии к [PR](https://github.com/streamich/git-cz/pull/67) их можно удалить и обновить пакет в node-modules.