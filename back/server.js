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

    app.post('/api/planned-payments', async (req, res) => {
        try {
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
            res.status(201).json(result);
        } catch (error) {
            console.error("ОШИБКА СОЗДАНИЯ ПЛАНОВОГО ПЛАТЕЖА:", error);
            res.status(500).send("Ошибка на сервере при создании платежа.");
        }
    });

    app.get('/api/account-history/:accountNumber', async (req, res) => {
      try {
        const accountNumber = parseInt(req.params.accountNumber);
        if (isNaN(accountNumber)) return res.status(400).send("Номер счета должен быть числом.");
        
        const { period, month } = req.query;
        let startDate = new Date('1970-01-01');
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (period === 'week') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month' && month) {
            const [year, monthNum] = month.split('-').map(Number);
            startDate = new Date(year, monthNum - 1, 1);
        } else if (period === 'year') {
            startDate = new Date(new Date().getFullYear(), 0, 1);
        }
        const accountInfo = await accounts.findOne({ account_number: accountNumber });
        const initialBalance = accountInfo ? accountInfo.initial_balance : 0;
        
        const groupFormat = period === 'year' ? "%Y-%m" : "%Y-%m-%d";
        const historyPipeline = [
            { $match: { transaction_date: { $lte: today.toISOString() } } },
            { $project: { _id:0, transactions: [ { account: "$sender_account", date: { $toDate: "$transaction_date" }, change: { $multiply: ["$amount", -1] } }, { account: "$receiver_account", date: { $toDate: "$transaction_date" }, change: "$amount" } ]}},
            { $unwind: "$transactions" },
            { $replaceRoot: { newRoot: "$transactions" } },
            { $match: { account: accountNumber } },
            { $group: { _id: { $dateToString: { format: groupFormat, date: "$date" } }, periodChange: { $sum: "$change" }}},
            { $sort: { _id: 1 } },
            { $setWindowFields: { sortBy: { _id: 1 }, output: { running_balance: { $sum: "$periodChange", window: { documents: [ "unbounded", "current" ] }}}}},
            { $project: { _id: 0, date: { $dateFromString: { dateString: { $concat: [ "$_id", period === 'year' ? "-01" : "" ] }}}, value: { $add: [initialBalance, "$running_balance"] }, type: 'actual' }}
        ];
        
        let allHistoricalData = await transactions.aggregate(historyPipeline).toArray();
        const historicalData = allHistoricalData.filter(item => new Date(item.date) >= startDate);

        let lastBalance = initialBalance;
        if (allHistoricalData.length > 0) {
            lastBalance = allHistoricalData[allHistoricalData.length - 1].value;
        }
        
        const forecastStartDate = new Date(new Date().setHours(0, 0, 0, 0));
        const plannedPayments = await planned_payments.find({ payment_date: { $gte: forecastStartDate } }).sort({ payment_date: 1 }).toArray();
        const forecastData = [];
        let currentForecastBalance = lastBalance;
        const dailyForecasts = {};

        plannedPayments.forEach(p => {
            const dateStr = p.payment_date.toISOString().split('T')[0];
            if (!dailyForecasts[dateStr]) dailyForecasts[dateStr] = 0;
            dailyForecasts[dateStr] += (p.transaction_type === '+' ? p.amount : -p.amount);
        });

        const sortedForecastDates = Object.keys(dailyForecasts).sort();
        
        if (sortedForecastDates.length > 0) {
            forecastData.push({
                date: forecastStartDate,
                value: lastBalance,
                type: 'forecast'
            });
        }
        
        sortedForecastDates.forEach(dateStr => {
            currentForecastBalance += dailyForecasts[dateStr];
            forecastData.push({ date: new Date(dateStr), value: currentForecastBalance, type: 'forecast' });
        });
        
        res.json({
            actual: historicalData,
            forecast: forecastData,
        });

      } catch (error) {
        console.error("ОШИБКА ВЫЧИСЛЕНИЯ И ПРОГНОЗА:", error);
        res.status(500).send("Ошибка при вычислении истории и прогноза: " + error);
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