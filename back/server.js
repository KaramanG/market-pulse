const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = "mongodb://localhost:27017";
const dbName = "market-pulse";

const client = new MongoClient(uri);

app.use(cors());

async function run() {
  try {
    await client.connect();
    console.log("Успешно подключились к MongoDB!");
    const database = client.db(dbName);
    const transactions = database.collection("transactions");
    const accounts = database.collection("accounts");

    // Эндпоинт остался прежним, но логика внутри полностью новая
    // GET http://localhost:5000/api/account-history/1
    app.get('/api/account-history/:accountNumber', async (req, res) => {
      try {
        const accountNumber = parseInt(req.params.accountNumber);
        if (isNaN(accountNumber)) {
          return res.status(400).send("Номер счета должен быть числом.");
        }

        // --- 1. Получаем начальный баланс ---
        const accountInfo = await accounts.findOne({ account_number: accountNumber });
        const initialBalance = accountInfo ? accountInfo.initial_balance : 0;
        
        // --- 2. Сложный pipeline для вычисления истории ---
        const pipeline = [
          // Этап I: Создаем два документа из каждой транзакции (списание и зачисление)
          {
            $project: {
              transactions: [
                {
                  account: "$sender_account",
                  date: { $toDate: "$transaction_date" },
                  change: { $multiply: ["$amount", -1] } // списание
                },
                {
                  account: "$receiver_account",
                  date: { $toDate: "$transaction_date" },
                  change: "$amount" // зачисление
                }
              ]
            }
          },
          // Этап II: "Разворачиваем" массив в отдельные документы
          { $unwind: "$transactions" },
          // Этап III: Заменяем корень документа на содержимое поля transactions
          { $replaceRoot: { newRoot: "$transactions" } },
          // Этап IV: Выбираем операции только для нужного нам счета
          { $match: { account: accountNumber } },
          // Этап V: Группируем по дням и считаем итоговое изменение за день
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              daily_change: { $sum: "$change" }
            }
          },
          // Этап VI: Сортируем по дате
          { $sort: { _id: 1 } },
          // Этап VII: Вычисляем накопительный итог (баланс на конец дня)
          {
            $setWindowFields: {
              sortBy: { _id: 1 },
              output: {
                running_balance: {
                  $sum: "$daily_change",
                  window: { documents: [ "unbounded", "current" ] }
                }
              }
            }
          },
          // Этап VIII: Финальная подготовка для графика
          {
            $project: {
              _id: 0,
              name: "$_id", // Дата
              value: { $add: [initialBalance, "$running_balance"] } // Баланс = начальный + накопленные изменения
            }
          }
        ];

        const chartData = await transactions.aggregate(pipeline).toArray();
        res.json(chartData);

      } catch (error) {
        console.error("ОШИБКА ВЫЧИСЛЕНИЯ ИСТОРИИ:", error);
        res.status(500).send("Ошибка при вычислении истории счета: " + error);
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