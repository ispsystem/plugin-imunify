🛠 Documentation status: IN PROCESS

# clietn/imunify

Клиентская часть плагина Imunify для vepp.

## Разработка
1. Установить [nodejs](https://nodejs.org/en/).
2. Запуск разработки `npm run dev`.
3. Сборка `npm run build`.

## Code style

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
