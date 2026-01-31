@echo off
echo 🐳 Сборка Docker образа...
docker-compose build playwright-tests

echo 🚀 Запуск тестов в Docker...
docker-compose up playwright-tests

echo 📊 Генерация Allure отчета...
call npm run allure:generate

echo ✅ Тесты завершены!
echo 📈 Для просмотра отчета выполните: npm run allure:open