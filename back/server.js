const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

// --- НАСТРОЙКИ ПОДКЛЮЧЕНИЯ ---
const uri = "mongodb://localhost:27017";
const dbName = "market-pulse";
const collectionName = "transactions";

const client = new MongoClient(uri);

app.use(cors()); // Разрешаем запросы (например, с localhost:5173)

async function run() {
  try {
    await client.connect();
    console.log("Успешно подключились к MongoDB!");
    const database = client.db(dbName);
    const transactions = database.collection(collectionName);

    // Создаем эндпоинт, на который будет обращаться React
    // GET http://localhost:5000/api/chart-data
    app.get('/api/chart-data', async (req, res) => {
      try {
        // Используем Aggregation Framework для группировки данных
        const pipeline = [
          {
            // 1. Группируем документы по дате (без времени) и суммируем amount
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$transaction_date" } } },
                totalValue: { $sum: "$amount" }
            }
          },
          {
            // 2. Преобразуем поля в формат, который нужен для Recharts
            $project: {
              _id: 0, // убираем поле _id
              name: "$_id", // переименовываем _id в name
              value: "$totalValue" // переименовываем totalValue в value
            }
          },
          {
            // 3. Сортируем по дате для красивого графика
            $sort: {
              name: 1
            }
          }
        ];
        
        const chartData = await transactions.aggregate(pipeline).toArray();
        res.json(chartData);

      } catch (error) {
        res.status(500).send("Ошибка при агрегации данных: " + error);
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