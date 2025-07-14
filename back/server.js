const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

// --- НАСТРОЙКИ ПОДКЛЮЧЕНИЯ ---
const uri = "mongodb://localhost:27017";
const dbName = "market-pulse"; 
// Меняем коллекцию на новую!
const collectionName = "account_history"; 

const client = new MongoClient(uri);

app.use(cors());

async function run() {
  try {
    await client.connect();
    console.log("Успешно подключились к MongoDB!");
    const database = client.db(dbName);
    const accountHistory = database.collection(collectionName);

    // НОВЫЙ ЭНДПОИНТ: принимает номер счета в URL
    // Например: GET http://localhost:5000/api/account-history/1
    app.get('/api/account-history/:accountNumber', async (req, res) => {
      try {
        // Получаем номер счета из параметров URL и преобразуем в число
        const accountNumber = parseInt(req.params.accountNumber);

        // Проверяем, что номер счета - это число
        if (isNaN(accountNumber)) {
          return res.status(400).send("Номер счета должен быть числом.");
        }

        // Запрос стал гораздо проще!
        const pipeline = [
          {
            // 1. Находим все записи для конкретного счета
            $match: {
              account_number: accountNumber
            }
          },
          {
            // 2. Сортируем по дате, чтобы линия на графике шла правильно
            $sort: {
              date: 1 // 1 = по возрастанию
            }
          },
          {
            // 3. Преобразуем поля в формат, который нужен для Recharts
            $project: {
                _id: 0,
                name: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } } },
                value: "$balance"
            }
          }
        ];
        
        const chartData = await accountHistory.aggregate(pipeline).toArray();
        res.json(chartData);

      } catch (error) {
        console.error("ОШИБКА ПОЛУЧЕНИЯ ИСТОРИИ СЧЕТА:", error);
        res.status(500).send("Ошибка при получении истории счета: " + error);
      }
    });

    app.listen(port, () => {
      console.log(`API сервер запущен на http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Не удалось подключиться к MongoDB", error);
  }
}

run();