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
            
            const utcDate = new Date(payment_date + 'T00:00:00.000Z');
            const newPayment = {
                payment_date: utcDate,
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
        let startDate, endDate;
        const today = new Date();

        if (period === 'week') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'month' && month) {
            const [year, monthNum] = month.split('-').map(Number);
            startDate = new Date(year, monthNum - 1, 1);
            endDate = new Date(year, monthNum, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'year') {
            const year = new Date().getFullYear();
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
        } else {
             startDate = new Date();
             startDate.setDate(today.getDate() - 7);
             startDate.setHours(0, 0, 0, 0);
             endDate = new Date();
             endDate.setHours(23, 59, 59, 999);
        }

        const accountInfo = await accounts.findOne({ account_number: accountNumber });
        const initialBalance = accountInfo ? accountInfo.initial_balance : 0;
        
        const balanceCorrectionPipeline = [
            { $match: { transaction_date: { $lt: startDate.toISOString() } } },
            { $project: { _id:0, transactions: [ { account: "$sender_account", change: { $multiply: ["$amount", -1] } }, { account: "$receiver_account", change: "$amount" } ]}},
            { $unwind: "$transactions" },
            { $replaceRoot: { newRoot: "$transactions" } },
            { $match: { account: accountNumber } },
            { $group: { _id: null, totalChange: { $sum: "$change" } } }
        ];
        const balanceResult = await transactions.aggregate(balanceCorrectionPipeline).toArray();
        const balanceAtPeriodStart = initialBalance + (balanceResult[0]?.totalChange || 0);

        const groupFormat = period === 'year' ? "%Y-%m" : "%Y-%m-%d";
        const historyPipeline = [
            { $match: { transaction_date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() } } },
            { $project: { _id:0, transactions: [ { account: "$sender_account", date: { $toDate: "$transaction_date" }, change: { $multiply: ["$amount", -1] } }, { account: "$receiver_account", date: { $toDate: "$transaction_date" }, change: "$amount" } ]}},
            { $unwind: "$transactions" },
            { $replaceRoot: { newRoot: "$transactions" } },
            { $match: { account: accountNumber } },
            { $group: { _id: { $dateToString: { format: groupFormat, date: "$date" } }, periodChange: { $sum: "$change" }}},
            { $sort: { _id: 1 } },
            { $setWindowFields: { sortBy: { _id: 1 }, output: { running_balance: { $sum: "$periodChange", window: { documents: [ "unbounded", "current" ] }}}}},
            { $project: { _id: 0, date: { $dateFromString: { dateString: { $concat: [ "$_id", period === 'year' ? "-01" : "" ] }}}, value: { $add: [balanceAtPeriodStart, "$running_balance"] }, type: 'actual' }}
        ];
        
        const historicalData = await transactions.aggregate(historyPipeline).toArray();
        let forecastData = [];

        const todayForForecast = new Date();
        const currentMonthStr = `${todayForForecast.getFullYear()}-${String(todayForForecast.getMonth() + 1).padStart(2, '0')}`;
        const shouldCreateForecast = period === 'week' || (period === 'month' && month === currentMonthStr);
        
        if (shouldCreateForecast) {
            let lastKnownBalance = balanceAtPeriodStart;
            if (historicalData.length > 0) {
                const lastActualDataPoint = historicalData[historicalData.length - 1];
                if (new Date(lastActualDataPoint.date) <= todayForForecast) {
                    lastKnownBalance = lastActualDataPoint.value;
                }
            }
        
            const forecastStartDate = new Date();
            forecastStartDate.setHours(0, 0, 0, 0);
        
            const plannedPayments = await planned_payments.find({
                payment_date: { $gte: forecastStartDate }
            }).sort({ payment_date: 1 }).toArray();
        
            let currentForecastBalance = lastKnownBalance;

            plannedPayments.forEach(payment => {
                const change = payment.transaction_type === '+' ? payment.amount : -payment.amount;
                currentForecastBalance += change;

                forecastData.push({
                    date: payment.payment_date,
                    value: currentForecastBalance,
                    type: 'forecast',
                    purpose: payment.purpose,
                    transactionAmount: change
                });
            });
        }
        
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