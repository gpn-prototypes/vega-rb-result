# Сборка VEGA-RB-RESULT на стенде с тестами и lint

## Файлы для правки в папке ci

- build.sh - передача параметров
- build-entrypoint.sh - запускает задачи в контейнере

## Что делать

### Управление запуском тестов/lint/...
Файл build.sh - добавлены две переменные для передачи в контейнер: WITH_TEST, WITH_LINT (почему так сделано описано в соответствующей статье confluence). Переменные устанавливаются в true/false в зависимости от необходимости запуска тестов.

Код:
```bash
docker run \
  --name "$NAME" \
  -v "$(pwd):/app" \
  --env NPM_URI=$NPM_URI \
  --env NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN \
  --env BASE_URL=$BASE_URL \
  --env BASE_API_URL=$BASE_API_URL \
  --env WITH_TEST=true \
  --env WITH_LINT=false \
```

Запуск в build-entrypoint.sh:
```bash
if [ $WITH_TEST == true ]
then
  echo "*** run tests ***"
  yarn test
fi

if [ $WITH_LINT == true ]
then
  echo "*** run lint ***"
  yarn lint
fi
```

Можно плодить сколько угодно, но решение временное - переделывать нужно фундаментально, описание в confluence:
- [DevOps](https://artcpt.atlassian.net/wiki/spaces/V2/pages/19562465752)
