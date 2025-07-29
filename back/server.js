const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;

const uri = "mongodb://localhost:27017";
const dbName = "market-pulse";

const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    console.log("Успешно подключились к MongoDB!");
    const database = client.db(dbName);
    const transactions = database.collection("transactions");
    const accounts = database.collection("accounts");
    const planned_payments = database.collection("planned_payments");

    // Обработка модального окна
    app.post('/api/planned-payments', async (req, res) => {
      try {
        console.log("-> Получен POST-запрос на /api/planned-payments");
        const { payment_date, amount, purpose, transaction_type } = req.body;      

        if (!payment_date || !amount || !purpose || !transaction_type) {
          return res.status(400).send("Все поля обязательны.");
        }

        if (transaction_type !== '+' && transaction_type !== '-') {
            return res.status(400).send("Недопустимое значение для типа транзакции.");
        }

        const newPayment = {
          payment_date: new Date(payment_date),
          amount: parseFloat(amount),
          purpose: purpose,
          transaction_type: transaction_type,
          creation_date: new Date(),
          user_id: 1
        };

        const result = await planned_payments.insertOne(newPayment);
        console.log("   Данные успешно сохранены в MongoDB:", result.insertedId);
        res.status(201).json(result);

      } catch (error) {
        console.error("ОШИБКА СОЗДАНИЯ ПЛАНОВОГО ПЛАТЕЖА:", error);
        res.status(500).send("Ошибка на сервере при создании платежа.");
      }
    });

    // Обработка запроса для графика
    app.get('/api/account-history/:accountNumber', async (req, res) => {
      try {
        const accountNumber = parseInt(req.params.accountNumber);
        if (isNaN(accountNumber)) {
          return res.status(400).send("Номер счета должен быть числом.");
        }
        const accountInfo = await accounts.findOne({ account_number: accountNumber });
        const initialBalance = accountInfo ? accountInfo.initial_balance : 0;
        const pipeline = [
          { $project: { transactions: [ { account: "$sender_account", date: { $toDate: "$transaction_date" }, change: { $multiply: ["$amount", -1] } }, { account: "$receiver_account", date: { $toDate: "$transaction_date" }, change: "$amount" } ]}},
          { $unwind: "$transactions" },
          { $replaceRoot: { newRoot: "$transactions" } },
          { $match: { account: accountNumber } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, daily_change: { $sum: "$change" }}},
          { $sort: { _id: 1 } },
          { $setWindowFields: { sortBy: { _id: 1 }, output: { running_balance: { $sum: "$daily_change", window: { documents: [ "unbounded", "current" ] }}}}},
          { $project: { _id: 0, name: "$_id", value: { $add: [initialBalance, "$running_balance"] }}}
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