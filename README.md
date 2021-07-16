# vega-template

Шаблон, необходимый для старта проекта VEGA.

## Зависимости

- [Vega UI Kit](https://github.com/gpn-prototypes/vega-ui)
- [Vega Frontend Configs](https://github.com/gpn-prototypes/frontend-configs)

Полный список зависимостей приведен в [package.json](package.json).

## Браузеры

Две последние мажорные версии браузеров на Chromium (в т.ч. Chrome, Yandex, Edge).

## Начало работы

Для старта вам нужно установить пакеты с помощью `yarn`.

Для запуска в dev-режиме выполните команду `yarn dev`.

Для запуска в режиме разработки в контексте single-spa выполните команду `yarn dev-in-shell`.

Для сборки проекта в prod-режиме выполните `yarn build`.

В проекте создана основа для написания unit-тестов. Переменные окружения можно добавить через файл .env.

## Деплой

В файлах `.github/kuberta.yaml` и `.github/workflows/build-static.yml` необходимо раскоментировать конфиги,
и заменить вхождения `vega-template` на `vega-${projectName}`

В файле `.github/kuberta.yaml` нужно указать соответсвующее название проекта в поле `name`

В файле `app-config/index.js` нужно указать соответсвующий `projectName`.

В настройках репозитория добавить секреты (узнать у CSSSR): `CDN_UPLOAD_SECRET` и `DOWNLOAD_ACTIONS_SSH_KEY`.
